-- ============================================
-- LIBRAIRIE MAROCAINE - BASE DE DONNÉES
-- PostgreSQL Schema
-- ============================================

-- Créer la base de données
-- CREATE DATABASE librairie_marocaine;

-- Se connecter
-- \c librairie_marocaine;

-- ============================================
-- TABLE: roles
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    user_type VARCHAR(20) DEFAULT 'retail', -- 'retail' = Client Détail, 'wholesale' = Client Grossiste
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT 'bg-blue-500',
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: suppliers
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    barcode VARCHAR(50) UNIQUE,
    price_retail DECIMAL(10,2) NOT NULL DEFAULT 0,      -- Prix pour Client Détail
    price_wholesale DECIMAL(10,2) NOT NULL DEFAULT 0,   -- Prix pour Client Grossiste
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    brand VARCHAR(100),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: stock_movements
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'preparation', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: invoices
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    pdf_path VARCHAR(500),
    total_ht DECIMAL(10,2),
    tva DECIMAL(10,2) DEFAULT 20,
    total_ttc DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: activity_logs
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DONNÉES DE BASE
-- ============================================

-- Roles
INSERT INTO roles (id, name, description, permissions) VALUES
(1, 'super_admin', 'Super Administrateur - Tous les droits', '["*"]'),
(2, 'admin', 'Administrateur - Gestion produits, commandes, stock', '["products.read", "products.write", "orders.read", "orders.write", "stock.read"]'),
(3, 'client', 'Client - Achat de produits', '["products.read", "orders.create", "orders.read_own"]')
ON CONFLICT (id) DO NOTHING;

-- Catégories
INSERT INTO categories (name, slug, color, icon) VALUES
('Arts & Crafts', 'arts-crafts', 'bg-orange-500', '🎨'),
('Binders & Folders', 'binders-folders', 'bg-green-600', '📁'),
('Calculators', 'calculators', 'bg-blue-600', '🧮'),
('Classroom', 'classroom', 'bg-yellow-500', '🏫'),
('Creative Play', 'creative-play', 'bg-red-500', '🧸'),
('Livres', 'livres', 'bg-purple-600', '📖'),
('Cahiers', 'cahiers', 'bg-pink-500', '📓'),
('Stylos', 'stylos', 'bg-teal-500', '✏️')
ON CONFLICT (slug) DO NOTHING;

-- Fournisseurs
INSERT INTO suppliers (name, phone, email, city, address) VALUES
('Papeterie du Maroc', '+212 522-123456', 'contact@papeterie.ma', 'Casablanca', '123 Blvd Mohammed V'),
('Librairie Centrale', '+212 522-789012', 'info@librairie-centrale.ma', 'Rabat', '45 Ave Hassan II'),
('Fournitures Pro', '+212 522-345678', 'pro@fournitures.ma', 'Marrakech', '78 Rue de la Liberté')
ON CONFLICT DO NOTHING;

-- Produits
INSERT INTO products (name, description, category_id, supplier_id, barcode, price_retail, price_wholesale, stock, min_stock, brand, image_url) VALUES
('Premium Ballpoint Pens Set', 'Set of 12 high-quality ballpoint pens', 8, 1, '1234567890123', 14.99, 9.99, 50, 10, 'Parker', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Heavy Duty Stapler', 'Professional stapler up to 50 sheets', 2, 2, '1234567890124', 16.99, 11.99, 30, 5, 'Swingline', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Highlighter Markers Pack', 'Pack of 8 fluorescent highlighters', 8, 1, '1234567890125', 8.99, 5.99, 100, 20, 'Sharpie', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Desktop Hole Punch', '3-hole punch for standard binders', 2, 3, '1234567890126', 12.99, 8.99, 15, 5, 'Bostitch', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Mechanical Pencils Set', 'Set of 5 mechanical pencils 0.5mm', 8, 1, '1234567890127', 9.99, 6.99, 0, 10, 'Pentel', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Tablet Stand Adjustable', 'Adjustable aluminum tablet stand', 5, 2, '1234567890128', 24.99, 16.99, 25, 5, 'Lamicall', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Notebook Premium A4', 'Hardcover A4 notebook 200 pages', 7, 3, '1234567890129', 7.99, 4.99, 80, 15, 'Moleskine', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'),
('Color Gel Pens Pack', 'Pack of 20 gel pens vibrant colors', 8, 1, '1234567890130', 11.99, 7.99, 60, 12, 'Sakura', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400')
ON CONFLICT (barcode) DO NOTHING;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
