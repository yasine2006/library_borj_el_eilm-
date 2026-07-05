import pool from '../config/db.js';

// ============================================
// GET STOCK MOVEMENTS — historique complet
// ============================================
export const getStockMovements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sm.*,
        p.name as product_name, p.image_url, p.brand, p.stock as current_stock,
        u.first_name, u.last_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
      ORDER BY sm.created_at DESC
      LIMIT 200
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ============================================
// ADD STOCK — entrée manuelle
// ============================================
export const addStock = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { product_id, quantity, reason } = req.body;
    if (!product_id || !quantity || quantity <= 0)
      throw new Error('Produit et quantité obligatoires');

    await client.query(
      'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, product_id]
    );
    await client.query(
      'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
      [product_id, 'in', quantity, reason || 'Ajout manuel', req.user.id]
    );
    const updated = await client.query('SELECT id, name, stock FROM products WHERE id = $1', [product_id]);
    await client.query('COMMIT');
    res.json({ message: 'Stock ajouté', product: updated.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally { client.release(); }
};

// ============================================
// REMOVE STOCK — sortie manuelle
// ============================================
export const removeStock = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { product_id, quantity, reason } = req.body;
    if (!product_id || !quantity || quantity <= 0)
      throw new Error('Produit et quantité obligatoires');

    const check = await client.query('SELECT stock, name FROM products WHERE id = $1', [product_id]);
    if (check.rows[0].stock < quantity)
      throw new Error(`Stock insuffisant — disponible: ${check.rows[0].stock}`);

    await client.query(
      'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, product_id]
    );
    await client.query(
      'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
      [product_id, 'out', quantity, reason || 'Retrait manuel', req.user.id]
    );
    const updated = await client.query('SELECT id, name, stock FROM products WHERE id = $1', [product_id]);
    await client.query('COMMIT');
    res.json({ message: 'Stock retiré', product: updated.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally { client.release(); }
};

// ============================================
// GET STOCK SUMMARY — par produit
// ============================================
export const getStockSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.name, p.brand, p.image_url, p.stock, p.min_stock,
        c.name as category_name,
        COALESCE(SUM(CASE WHEN sm.type = 'in' THEN sm.quantity ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END), 0) as total_out
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock_movements sm ON sm.product_id = p.id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.brand, p.image_url, p.stock, p.min_stock, c.name
      ORDER BY p.stock ASC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};