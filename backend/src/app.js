import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchase_order.routes.js';
import stockRoutes from './routes/stock.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import grossisteRoutes from './routes/grossiste.routes.js';
import { runMigrations } from './config/migrate.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

dotenv.config();

// ---- Fail-fast: JWT secret obligatoire w qwi (ma-ybda9ch ila kan placeholder) ----
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.toLowerCase().includes('change') || JWT_SECRET.includes('secret_key')) {
  console.error('[FATAL] JWT_SECRET manquant ou trop faible. Définissez un secret long et aléatoire (env JWT_SECRET).');
  process.exit(1);
}

const app = express();

// Vercel injecte le proxy : kaythassal `trust proxy` bsh rate-limit w logs ykhdmo s7i7
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// CORS : ghir les origines declarees f CORS_ORIGIN (si vide => tout autorise)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / requete non-navigateur
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/grossistes', grossisteRoutes);

// 404 l kol route /api ma-3arfهاش
app.use('/api', notFoundHandler);

// NOTE: sur Vercel, le frontend (React) est servi par le CDN statique.
// Le static/SPA n'est active qu'en dev local.
if (!process.env.VERCEL) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

// Gestion centralisee des erreurs (doit etre en dernier)
app.use(errorHandler);

// Migrations (IF NOT EXISTS) — une seule fois par instance
if (!global.__migrationsDone) {
  global.__migrationsDone = true;
  runMigrations().catch((e) => console.error('[MIGRATION] echec:', e.message));
}

export default app;
