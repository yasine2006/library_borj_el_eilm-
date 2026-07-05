import pool from '../config/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, user_type, role_id, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, address, city, user_type, role_id, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouve' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, city } = req.body;
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, address = $4, city = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [first_name, last_name, phone, address, city, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Utilisateur supprime' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role_id = 3');
    const totalAdmins = await pool.query('SELECT COUNT(*) FROM users WHERE role_id IN (1, 2)');
    const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
    const totalOrders = await pool.query('SELECT COUNT(*) FROM orders');
    const totalRevenue = await pool.query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered'");
    const lowStock = await pool.query('SELECT COUNT(*) FROM products WHERE stock <= min_stock AND stock > 0');
    const outOfStock = await pool.query('SELECT COUNT(*) FROM products WHERE stock = 0');
    const normalStock = await pool.query('SELECT COUNT(*) FROM products WHERE stock > min_stock');

    // Ventes par mois (12 derniers mois)
    const salesByMonth = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        TO_CHAR(created_at, 'YYYY-MM') as month_key,
        COUNT(*) as orders_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status NOT IN ('cancelled')
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month_key ASC
    `);

    // Top 5 produits les plus vendus
    const topProducts = await pool.query(`
      SELECT 
        p.name,
        p.image_url,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
      GROUP BY p.id, p.name, p.image_url
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Commandes par statut
    const ordersByStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalAdmins: parseInt(totalAdmins.rows[0].count),
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].coalesce),
      lowStock: parseInt(lowStock.rows[0].count),
      outOfStock: parseInt(outOfStock.rows[0].count),
      normalStock: parseInt(normalStock.rows[0].count),
      salesByMonth: salesByMonth.rows.map(r => ({
        ...r,
        revenue: parseFloat(r.revenue),
        orders_count: parseInt(r.orders_count)
      })),
      topProducts: topProducts.rows.map(r => ({
        ...r,
        total_sold: parseInt(r.total_sold),
        total_revenue: parseFloat(r.total_revenue)
      })),
      ordersByStatus: ordersByStatus.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREATE ADMIN — Super Admin fqt
// ============================================
export const createAdmin = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, 'retail', 2, true) RETURNING id, email, first_name, last_name, role_id, created_at`,
      [email, hashedPassword, first_name, last_name, phone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};