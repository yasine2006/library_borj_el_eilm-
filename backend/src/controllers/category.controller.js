import pool from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await pool.query(
      'INSERT INTO categories (name, slug, description, icon) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description || null, icon || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = await pool.query(
      'UPDATE categories SET name=$1, slug=$2, description=$3, icon=$4 WHERE id=$5 RETURNING *',
      [name, slug, description || null, icon || null, id]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(check.rows[0].count) > 0)
      return res.status(400).json({ error: `Impossible de supprimer: ${check.rows[0].count} produits utilisent cette catégorie` });
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Catégorie supprimée' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};