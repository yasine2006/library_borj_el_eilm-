import pool from '../config/db.js';

// ============================================
// GET ALL PURCHASE ORDERS
// ============================================
export const getPurchaseOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        po.*,
        s.name as supplier_name,
        s.phone as supplier_phone,
        u.first_name, u.last_name,
        (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items_count,
        (SELECT COALESCE(SUM(poi.quantity * poi.unit_cost),0) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as total_cost
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.user_id = u.id
      ORDER BY po.created_at DESC
    `);
    res.json(result.rows.map(r => ({
      ...r,
      items_count: parseInt(r.items_count),
      total_cost: parseFloat(r.total_cost)
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ============================================
// GET PURCHASE ORDER BY ID (avec items)
// ============================================
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await pool.query(`
      SELECT po.*, s.name as supplier_name, s.phone as supplier_phone,
             u.first_name, u.last_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.user_id = u.id
      WHERE po.id = $1
    `, [id]);
    if (po.rows.length === 0) return res.status(404).json({ error: 'Bon introuvable' });

    const items = await pool.query(`
      SELECT poi.*, p.name as product_name, p.image_url, p.stock as current_stock, p.brand
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = $1
    `, [id]);

    res.json({ ...po.rows[0], items: items.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ============================================
// CREATE PURCHASE ORDER
// ============================================
export const createPurchaseOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { supplier_id, notes, items } = req.body;
    const created_by = req.user.id;

    if (!items || items.length === 0) throw new Error('Ajoutez au moins un produit');

    const po = await client.query(
      `INSERT INTO purchase_orders (supplier_id, notes, user_id, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [supplier_id, notes || null, created_by]
    );
    const poId = po.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost)
         VALUES ($1, $2, $3, $4)`,
        [poId, item.product_id, item.quantity, item.unit_cost || 0]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(po.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally { client.release(); }
};

// ============================================
// UPDATE STATUS — wqt received → stock kayzad
// ============================================
export const updatePurchaseOrderStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status } = req.body;

    const prev = await client.query('SELECT status FROM purchase_orders WHERE id = $1', [id]);
    if (prev.rows.length === 0) return res.status(404).json({ error: 'Bon introuvable' });
    const prevStatus = prev.rows[0].status;

    const updateData = status === 'received'
      ? await client.query(
          `UPDATE purchase_orders SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
          [status, id]
        )
      : await client.query(
          `UPDATE purchase_orders SET status=$1 WHERE id=$2 RETURNING *`,
          [status, id]
        );

    // Wqt received — kayzad stock
    if (status === 'received' && prevStatus !== 'received') {
      const items = await client.query(
        `SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = $1`,
        [id]
      );
      for (const item of items.rows) {
        await client.query(
          `UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
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
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
};

// ============================================
// DELETE PURCHASE ORDER (pending fqt)
// ============================================
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT status FROM purchase_orders WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Bon introuvable' });
    if (check.rows[0].status !== 'pending')
      return res.status(400).json({ error: 'Impossible de supprimer un bon déjà traité' });
    await pool.query('DELETE FROM purchase_orders WHERE id = $1', [id]);
    res.json({ message: 'Bon supprimé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};