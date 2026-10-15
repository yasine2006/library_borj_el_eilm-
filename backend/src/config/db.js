import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Vercel Postgres / Neon / Supabase fournissent une URL (POSTGRES_URL, DATABASE_URL, ...).
// En dev local on peut continuer a utiliser DB_HOST/DB_NAME/DB_USER/DB_PASSWORD.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  null;

const pool = connectionString
  ? new Pool({
      connectionString,
      // Les servers Postgres serverless utilisent un certif auto-signe
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

// Pool global : evite d'ouvrir une connexion par requete (limite serverless)
pool.on('error', (e) => console.error('[PG] pool error:', e.message));

export default pool;
