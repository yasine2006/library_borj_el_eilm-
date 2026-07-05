import pool from '../config/db.js';

export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produit non trouve' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, brand, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, description, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, brand, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, description, category_id || null, supplier_id || null, barcode, price_retail, price_wholesale, stock || 0, min_stock || 5, brand, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, brand, image_url, is_active } = req.body;
    const result = await pool.query(
      `UPDATE products SET 
        name = $1, description = $2, category_id = $3, supplier_id = $4,
        barcode = $5, price_retail = $6, price_wholesale = $7,
        stock = $8, min_stock = $9, brand = $10, image_url = $11,
        is_active = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 RETURNING *`,
      [name, description, category_id || null, supplier_id || null,
       barcode || null, price_retail, price_wholesale,
       stock, min_stock, brand, image_url || null,
       is_active, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: mark as inactive instead of deleting
    await pool.query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ message: 'Produit supprime' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE stock <= min_stock AND is_active = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};