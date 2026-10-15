import pool from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

// ============================================
// GET ALL PURCHASE ORDERS
// ============================================
export const getPurchaseOrders = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        po.*,
        s.name as supplier_name, s.phone as supplier_phone,
        u.first_name, u.last_name,
        (SELECT COUNT(*) FROM purchase_order_items oi WHERE oi.purchase_order_id = po.id) as items_count
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.user_id = u.id
      ORDER BY po.created_at DESC
      LIMIT 500
    `);
    res.json(result.rows);
  } catch (e) { next(e); }
};

// ============================================
// GET PURCHASE ORDER BY ID
// ============================================
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const po = await pool.query(`
      SELECT po.*, s.name as supplier_name, s.phone as supplier_phone,
             u.first_name, u.last_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.user_id = u.id
      WHERE po.id = $1
    `, [id]);
    if (po.rows.length === 0) return res.status(404).json({ error: 'Bon introuvable' });

    const items = await pool.query(`
      SELECT oi.*, p.name as product_name, p.image_url, p.stock as current_stock, p.brand
      FROM purchase_order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1
      ORDER BY oi.id
    `, [id]);

    res.json({ ...po.rows[0], items: items.rows });
  } catch (e) { next(e); }
};

// ============================================
// CREATE PURCHASE ORDER
// ============================================
export const createPurchaseOrder = async (req, res, next) => {
  let client;
  try {
    const { supplier_id, notes, items } = req.body;
    const created_by = req.user.id;

    if (!supplier_id) throw new AppError('Fournisseur obligatoire', 400);
    if (!Array.isArray(items) || items.length === 0) throw new AppError('Ajoutez au moins un produit', 400);

    const cleaned = items.map(it => {
      const qty = parseInt(it.quantity_ordered ?? it.quantity, 10);
      const cost = parseFloat(it.unit_cost);
      if (!it.product_id || !Number.isInteger(qty) || qty <= 0) throw new AppError('Quantité invalide', 400);
      if (!Number.isFinite(cost) || cost < 0) throw new AppError('Coût unitaire invalide', 400);
      return { product_id: it.product_id, qty, cost };
    });
    const totalCost = cleaned.reduce((s, it) => s + it.qty * it.cost, 0);

    client = await pool.connect();
    await client.query('BEGIN');

    const poNumber = `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const po = await client.query(
      `INSERT INTO purchase_orders (order_number, supplier_id, notes, user_id, status, total_cost)
       VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
      [poNumber, supplier_id, notes || null, created_by, totalCost]
    );
    const poId = po.rows[0].id;

    for (const it of cleaned) {
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity, unit_cost, total_cost)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [poId, it.product_id, it.qty, it.qty, it.cost, it.qty * it.cost]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(po.rows[0]);
  } catch (e) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ } }
    next(e);
  } finally {
    if (client) client.release();
  }
};

// ============================================
// UPDATE STATUS — wqt received → stock kayzad
// ============================================
export const updatePurchaseOrderStatus = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'received', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const prev = await client.query('SELECT status FROM purchase_orders WHERE id = $1 FOR UPDATE', [id]);
    if (prev.rows.length === 0) throw new AppError('Bon introuvable', 404);
    const prevStatus = prev.rows[0].status;

    const updateData = status === 'received'
      ? await client.query(
          'UPDATE purchase_orders SET status = $1, received_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [status, id]
        )
      : await client.query(
          'UPDATE purchase_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [status, id]
        );

    // Wqt received — kayzad stock
    if (status === 'received' && prevStatus !== 'received') {
      const items = await client.query(
        'SELECT product_id, COALESCE(quantity_ordered, quantity, 0) as quantity FROM purchase_order_items WHERE purchase_order_id = $1 ORDER BY product_id',
        [id]
      );
      for (const item of items.rows) {
        if (!item.product_id || Number(item.quantity) <= 0) continue;
        await client.query(
          'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
        await client.query(
          `INSERT INTO stock_movements (product_id, type, quantity, reason, user_id)
           VALUES ($1, 'in', $2, $3, $4)`,
          [item.product_id, item.quantity, `Réception bon commande #${id}`, req.user.id]
        );
      }
    }

    await client.query('COMMIT');
    res.json(updateData.rows[0]);
  } catch (e) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ } }
    next(e);
  } finally {
    if (client) client.release();
  }
};

// ============================================
// DELETE PURCHASE ORDER (pending fqt)
// ============================================
export const deletePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT status FROM purchase_orders WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Bon introuvable' });
    if (check.rows[0].status !== 'pending')
      return res.status(400).json({ error: 'Impossible de supprimer un bon déjà traité' });
    await pool.query('DELETE FROM purchase_orders WHERE id = $1', [id]);
    res.json({ message: 'Bon supprimé' });
  } catch (e) { next(e); }
};
