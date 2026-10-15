import pool from '../config/db.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_active = true
    `;
    let params = [];

    if (q && q.trim()) {
      const term = q.trim();
      const likeTerm = `%${term}%`;
      const barcodePrefix = `${term}%`;
      params.push(likeTerm, barcodePrefix);
      query += ` AND (
        p.name ILIKE $1 OR p.brand ILIKE $1 OR p.barcode ILIKE $1
        OR p.reference ILIKE $1
        OR (p.barcode LIKE $2)
      )`;
    }

    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT p.*, c.name as category_name, c.icon as category_icon, s.name as supplier_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = $1',
      [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produit non trouve' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, reference, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, stock_max, brand, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, description, reference, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, stock_max, brand, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [name, description, reference || null, category_id || null, supplier_id || null, barcode, price_retail, price_wholesale, stock || 0, min_stock || 5, stock_max || 0, brand, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, reference, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, stock_max, brand, image_url, is_active } = req.body;
    const result = await pool.query(
      `UPDATE products SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        reference = COALESCE($3, reference),
        category_id = COALESCE($4, category_id),
        supplier_id = COALESCE($5, supplier_id),
        barcode = COALESCE($6, barcode),
        price_retail = COALESCE($7, price_retail),
        price_wholesale = COALESCE($8, price_wholesale),
        stock = COALESCE($9, stock),
        min_stock = COALESCE($10, min_stock),
        stock_max = COALESCE($11, stock_max),
        brand = COALESCE($12, brand),
        image_url = COALESCE($13, image_url),
        is_active = COALESCE($14, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $15 RETURNING *`,
      [name || null, description || null, reference || null, category_id || null, supplier_id || null,
       barcode || null, price_retail ?? null, price_wholesale ?? null,
       stock ?? null, min_stock ?? null, stock_max ?? null, brand || null, image_url || null,
       is_active ?? null, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Soft delete: mark as inactive instead of deleting
    await pool.query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ message: 'Produit supprime' });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE stock <= min_stock AND is_active = true');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const bulkCreateProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Liste de produits requise' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.name || !p.price_retail) {
        errors.push({ ligne: i + 1, error: 'Nom et prix détail requis' });
        continue;
      }
      try {
        let category_id = p.category_id || null;
        if (p.category && !category_id) {
          const slugBase = p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categorie';
          let slug = slugBase;
          let cat;
          for (let attempt = 0; attempt < 5; attempt++) {
            try {
              cat = await pool.query(
                `INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
                [p.category, slug]
              );
              break;
            } catch (e) {
              if (e.code === '23505' && attempt < 4) { slug = slugBase + '-' + Math.random().toString(36).slice(2, 6); }
              else throw e;
            }
          }
          category_id = cat.rows[0].id;
        }

        let supplier_id = p.supplier_id || null;
        if (p.supplier && !supplier_id) {
          const sup = await pool.query(
            `INSERT INTO suppliers (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
            [p.supplier]
          );
          supplier_id = sup.rows[0].id;
        }

        const result = await pool.query(
          `INSERT INTO products (name, description, reference, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, stock_max, brand, image_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, name, reference`,
          [p.name, p.description || null, p.reference || null, category_id, supplier_id,
           p.barcode || null, p.price_retail, p.price_wholesale || 0,
           p.stock || 0, p.min_stock || 5, p.stock_max || 0, p.brand || null, p.image_url || null]
        );
        results.push(result.rows[0]);
      } catch (err) {
        errors.push({ ligne: i + 1, name: p.name, error: err.message });
      }
    }

    res.status(201).json({ imported: results.length, errors, products: results });
  } catch (error) {
    next(error);
  }
};