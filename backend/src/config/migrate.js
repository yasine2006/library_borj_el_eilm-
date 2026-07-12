import pool from './db.js';

const sqls = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS rc_number VARCHAR(100)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS estimated_volume VARCHAR(100)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS document_path VARCHAR(500)`,
  `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS product_types TEXT`,
  `CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY, order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
    total_cost DECIMAL(10,2) DEFAULT 0, notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL, unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
];

export const runMigrations = async () => {
  for (const sql of sqls) {
    try { await pool.query(sql); console.log('✓ migration ok'); }
    catch (e) { console.log('✗ migration: ' + e.message.substring(0, 80)); }
  }
};
