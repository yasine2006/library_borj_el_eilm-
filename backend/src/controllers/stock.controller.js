import pool from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

// ============================================
// GET STOCK MOVEMENTS
// ============================================
export const getStockMovements = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        sm.*, p.name as product_name, p.image_url, p.stock as current_stock, p.brand,
        u.first_name, u.last_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
      ORDER BY sm.created_at DESC
      LIMIT 200
    `);
    res.json(result.rows);
  } catch (e) { next(e); }
};

// ============================================
// ADD STOCK — entrée manuelle
// ============================================
export const addStock = async (req, res, next) => {
  let client;
  try {
    const { product_id, quantity, reason } = req.body;
    const qty = parseInt(quantity, 10);
    if (!product_id || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Produit et quantité (entier > 0) obligatoires' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const updated = await client.query(
      'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock',
      [qty, product_id]
    );
    if (updated.rows.length === 0) throw new AppError('Produit introuvable', 404);

    await client.query(
      'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
      [product_id, 'in', qty, reason || 'Ajout manuel', req.user.id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Stock ajouté', product: updated.rows[0] });
  } catch (e) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ } }
    next(e);
  } finally {
    if (client) client.release();
  }
};

// ============================================
// REMOVE STOCK — sortie manuelle (atomique)
// ============================================
export const removeStock = async (req, res, next) => {
  let client;
  try {
    const { product_id, quantity, reason } = req.body;
    const qty = parseInt(quantity, 10);
    if (!product_id || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Produit et quantité (entier > 0) obligatoires' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Atomique : katn9ess ghir ila stock kafi (ma ykounch race condition)
    const upd = await client.query(
      'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND stock >= $1 RETURNING id, name, stock',
      [qty, product_id]
    );
    if (upd.rows.length === 0) {
      const exists = await client.query('SELECT stock FROM products WHERE id = $1', [product_id]);
      if (exists.rows.length === 0) throw new AppError('Produit introuvable', 404);
      throw new AppError(`Stock insuffisant — disponible: ${exists.rows[0].stock}`, 400);
    }

    await client.query(
      'INSERT INTO stock_movements (product_id, type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)',
      [product_id, 'out', qty, reason || 'Retrait manuel', req.user.id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Stock retiré', product: upd.rows[0] });
  } catch (e) {
    if (client) { try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ } }
    next(e);
  } finally {
    if (client) client.release();
  }
};

// ============================================
// GET STOCK SUMMARY
// ============================================
export const getStockSummary = async (req, res, next) => {
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
  } catch (e) { next(e); }
};
