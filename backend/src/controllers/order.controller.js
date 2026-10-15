import pool from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/email.service.js';

const ALLOWED_STATUS = ['pending', 'validated', 'preparation', 'shipped', 'delivered', 'cancelled'];
const ALLOWED_PAYMENT = ['cash_on_delivery', 'bank_transfer'];

// Helper: charge les items triés par product_id (anti-deadlock)
const getOrderItems = async (client, orderId) => {
  const r = await client.query(
    'SELECT product_id, quantity FROM order_items WHERE order_id = $1 ORDER BY product_id FOR UPDATE',
    [orderId]
  );
  return r.rows;
};

// ============================================
// CREATE ORDER — stock kayt-réservé daba (transaction + FOR UPDATE)
// ============================================
export const createOrder = async (req, res, next) => {
  let client;
  try {
    const { items, shipping_address, contact_phone, payment_method, notes } = req.body;
    const user_id = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }
    if (!shipping_address || String(shipping_address).trim().length < 5) {
      return res.status(400).json({ error: 'Adresse de livraison obligatoire' });
    }
    const payMethod = ALLOWED_PAYMENT.includes(payment_method) ? payment_method : 'cash_on_delivery';

    client = await pool.connect();
    await client.query('BEGIN');

    const userRow = await client.query('SELECT email, phone, first_name, user_type, approval_status FROM users WHERE id = $1', [user_id]);
    if (userRow.rows.length === 0) throw new AppError('Utilisateur introuvable', 400);
    const u = userRow.rows[0];
    const custPhone = (contact_phone && String(contact_phone).trim()) || u.phone || null;
    const isWholesale = u.user_type === 'wholesale' && u.approval_status === 'approved';

    // Valider + fusionner les doublons + trier par product_id (anti-deadlock)
    const merged = {};
    for (const it of items) {
      const pid = parseInt(it.product_id, 10);
      const qty = parseInt(it.quantity, 10);
      if (!pid || !Number.isInteger(qty) || qty <= 0) {
        throw new AppError('Article invalide dans le panier', 400);
      }
      merged[pid] = (merged[pid] || 0) + qty;
    }
    const ordered = Object.keys(merged)
      .map(id => ({ product_id: Number(id), quantity: merged[id] }))
      .sort((a, b) => a.product_id - b.product_id);

    // Vérifier + calculer les prix côté serveur (jamais faire confiance au client)
    let total = 0;
    const preparedItems = [];
    for (const it of ordered) {
      const prod = await client.query(
        'SELECT stock, name, price_retail, price_wholesale, is_active FROM products WHERE id = $1 FOR UPDATE',
        [it.product_id]
      );
      if (prod.rows.length === 0) throw new AppError(`Produit introuvable (id ${it.product_id})`, 400);
      const p = prod.rows[0];
      if (!p.is_active) throw new AppError(`Produit indisponible: "${p.name}"`, 400);
      if (p.stock < it.quantity) {
        throw new AppError(`Stock insuffisant pour "${p.name}" (disponible: ${p.stock})`, 400);
      }
      const unitPrice = parseFloat(isWholesale ? p.price_wholesale : p.price_retail) || 0;
      const lineTotal = unitPrice * it.quantity;
      total += lineTotal;
      preparedItems.push({ product_id: it.product_id, name: p.name, quantity: it.quantity, price: unitPrice, lineTotal });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, contact_phone, payment_method, notes)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7) RETURNING *`,
      [`CMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, user_id, total,
       shipping_address.trim(), custPhone, payMethod, notes || null]
    );
    const orderId = orderResult.rows[0].id;
    const orderNum = orderResult.rows[0].order_number;

    // Insérer les items + réserver le stock (atomique, WHERE stock >= qty)
    for (const it of preparedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
        [orderId, it.product_id, it.quantity, it.price, it.lineTotal]
      );
      const upd = await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1 RETURNING stock',
        [it.quantity, it.product_id]
      );
      if (upd.rows.length === 0) throw new AppError(`Stock insuffisant pour le produit #${it.product_id}`, 400);
      await client.query(
        'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
        [it.product_id, 'out', it.quantity, `Réservation commande ${orderNum}`, user_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);

    // Email de confirmation (best-effort — ma-yfchchelch la commande)
    if (u.email) {
      sendOrderConfirmationEmail(u.email, {
        order_number: orderNum,
        total_amount: total,
        shipping_address: shipping_address || null,
        items: preparedItems.map(it => ({ name: it.name, quantity: it.quantity, price: it.price, lineTotal: it.lineTotal })),
      }).catch(err => console.error('[EMAIL] confirmation:', err.message));
    }
  } catch (error) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ } }
    next(error);
  } finally {
    if (client) client.release();
  }
};

// ============================================
// GET ALL ORDERS
// ============================================
export const getOrders = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email, u.phone,
        u.user_type,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 500
    `);
    res.json(result.rows);
  } catch (error) { next(error); }
};

// ============================================
// GET ORDER BY ID
// ============================================
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(`
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email, u.phone,
        u.address, u.city, u.user_type
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    // Client (role 3) kaychouf ghir commands dyalou
    if (String(req.user.role) === '3' && String(orderResult.rows[0].user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const itemsResult = await pool.query(`
      SELECT 
        oi.*,
        p.name as product_name, p.image_url, p.brand, p.barcode
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error) { next(error); }
};

// ============================================
// UPDATE ORDER STATUS
// ============================================
export const updateOrderStatus = async (req, res, next) => {
  let client;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const prev = await client.query(
      `SELECT o.status, o.order_number, o.total_amount, u.email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 FOR UPDATE OF o`,
      [id]
    );
    if (prev.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    const prevStatus = prev.rows[0].status;
    const orderNum = prev.rows[0].order_number;
    const custEmail = prev.rows[0].email;
    const orderTotal = prev.rows[0].total_amount;

    const result = await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    const items = await getOrderItems(client, id);

    // Stock réservé dès la création → wqt annulation kanna3tih
    if (status === 'cancelled' && prevStatus !== 'cancelled') {
      for (const item of items) {
        await client.query(
          'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
        await client.query(
          'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
          [item.product_id, 'in', item.quantity, `Annulation commande ${orderNum}`, req.user.id]
        );
      }
    }

    // Réactivation dyal commande annulée → réserver à nouveau
    if (status !== 'cancelled' && prevStatus === 'cancelled') {
      for (const item of items) {
        const upd = await client.query(
          'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1 RETURNING stock',
          [item.quantity, item.product_id]
        );
        if (upd.rows.length === 0) throw new AppError('Stock insuffisant pour réactiver la commande', 400);
        await client.query(
          'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
          [item.product_id, 'out', item.quantity, `Réactivation commande ${orderNum}`, req.user.id]
        );
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);

    // Email de changement de statut (best-effort)
    if (custEmail && status !== prevStatus) {
      sendOrderStatusEmail(custEmail, { order_number: orderNum, total_amount: orderTotal }, status)
        .catch(err => console.error('[EMAIL] statut:', err.message));
    }
  } catch (error) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ } }
    next(error);
  } finally {
    if (client) client.release();
  }
};

// ============================================
// GET MY ORDERS
// ============================================
export const getMyOrders = async (req, res, next) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200',
      [req.user.id]
    );

    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(`
          SELECT oi.*, p.name as product_name, p.image_url, p.brand
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (error) { next(error); }
};
