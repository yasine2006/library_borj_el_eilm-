import pool from '../config/db.js';

export const getSuppliers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, COUNT(p.id) as products_count
      FROM suppliers s
      LEFT JOIN products p ON p.supplier_id = s.id
      GROUP BY s.id ORDER BY s.name
    `);
    // Convert product_types array
    result.rows = result.rows.map(r => ({ ...r, product_types: r.product_types || [] }));
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, city, product_types } = req.body;
    const result = await pool.query(
      'INSERT INTO suppliers (name, phone, email, address, city, product_types) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, phone || null, email || null, address || null, city || null, product_types || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, city, product_types } = req.body;
    const result = await pool.query(
      'UPDATE suppliers SET name=$1, phone=$2, email=$3, address=$4, city=$5, product_types=$6 WHERE id=$7 RETURNING *',
      [name, phone || null, email || null, address || null, city || null, product_types || [], id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT COUNT(*) FROM products WHERE supplier_id = $1', [id]);
    if (parseInt(check.rows[0].count) > 0)
      return res.status(400).json({ error: `Impossible de supprimer: ${check.rows[0].count} produits utilisent ce fournisseur` });
    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    res.json({ message: 'Fournisseur supprimé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ============================================
// GET SUPPLIER DETAILS — produits + historique
// ============================================
export const getSupplierDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Info fournisseur
    const sup = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (sup.rows.length === 0) return res.status(404).json({ error: 'Fournisseur introuvable' });

    // Produits li kayjib
    const products = await pool.query(`
      SELECT id, name, image_url, brand, price_retail, price_wholesale, stock, min_stock, is_active
      FROM products
      WHERE supplier_id = $1
      ORDER BY name
    `, [id]);

    // Historique commandes li fiha produits dyal had fournisseur
    const orders = await pool.query(`
      SELECT DISTINCT
        o.id, o.order_number, o.status, o.total_amount, o.created_at,
        u.first_name, u.last_name, u.email, u.phone,
        SUM(oi.quantity) as total_items,
        SUM(oi.total_price) as sup_total
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE p.supplier_id = $1
      GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at,
               u.first_name, u.last_name, u.email, u.phone
      ORDER BY o.created_at DESC
      LIMIT 20
    `, [id]);

    // Stats globales
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COALESCE(SUM(oi.total_price), 0) as total_revenue
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE p.supplier_id = $1 AND o.status = 'delivered'
    `, [id]);

    res.json({
      supplier: sup.rows[0],
      products: products.rows,
      orders: orders.rows.map(r => ({
        ...r,
        total_items: parseInt(r.total_items),
        sup_total: parseFloat(r.sup_total)
      })),
      stats: {
        total_orders: parseInt(stats.rows[0].total_orders),
        total_items_sold: parseInt(stats.rows[0].total_items_sold),
        total_revenue: parseFloat(stats.rows[0].total_revenue)
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};