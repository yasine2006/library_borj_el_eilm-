import pool from '../config/db.js';

// ============================================
// CREATE ORDER — stock kaytnaqas + stock_movements
// ============================================
export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { user_id, items, total_amount, shipping_address } = req.body;

    // Vérifier stock disponible avant de commander
    for (const item of items) {
      const stockCheck = await client.query(
        'SELECT stock, name FROM products WHERE id = $1',
        [item.product_id]
      );
      if (stockCheck.rows.length === 0) throw new Error(`Produit introuvable`);
      if (stockCheck.rows[0].stock < item.quantity) {
        throw new Error(`Stock insuffisant pour "${stockCheck.rows[0].name}" (disponible: ${stockCheck.rows[0].stock})`);
      }
    }

    // Créer la commande
    const orderResult = await client.query(
      'INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [`CMD-${Date.now()}`, user_id, total_amount, 'pending', shipping_address]
    );
    const orderId = orderResult.rows[0].id;

    // Ajouter les items seulement — stock kaytnaqas wqt livraison
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.product_id, item.quantity, item.price, item.quantity * item.price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

// ============================================
// GET ALL ORDERS — avec téléphone + items count
// ============================================
export const getOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email, u.phone,
        u.user_type,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ORDER BY ID — avec tous les détails
// ============================================
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(`
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email, u.phone,
        u.address, u.city, u.user_type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    const itemsResult = await pool.query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.image_url,
        p.brand,
        p.barcode
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// UPDATE ORDER STATUS — stock kaytnaqas wqt delivered
// ============================================
export const updateOrderStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status } = req.body;

    // Chof l status qbel
    const prev = await client.query('SELECT status FROM orders WHERE id = $1', [id]);
    const prevStatus = prev.rows[0]?.status;

    // Update status
    const result = await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Wqt livraison fqt — tnaqas stock
    if (status === 'delivered' && prevStatus !== 'delivered') {
      const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );
      const orderNum = result.rows[0].order_number;

      for (const item of items.rows) {
        await client.query(
          'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
        await client.query(
          'INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES ($1, $2, $3, $4)',
          [item.product_id, 'out', item.quantity, `Livraison commande ${orderNum}`]
        );
      }
    }

    // Wqt annulation — remet stock si was delivered
    if (status === 'cancelled' && prevStatus === 'delivered') {
      const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );
      const orderNum = result.rows[0].order_number;
      for (const item of items.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
        await client.query(
          'INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES ($1, $2, $3, $4)',
          [item.product_id, 'in', item.quantity, `Annulation commande ${orderNum}`]
        );
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// ============================================
// GET MY ORDERS — avec détails items
// ============================================
export const getMyOrders = async (req, res) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    // Charger les items pour chaque commande
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(`
          SELECT oi.*, p.name as product_name, p.image_url, p.brand
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};