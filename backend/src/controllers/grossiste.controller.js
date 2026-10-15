import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// STOCKAGE DOCUMENT — Vercel Blob (prod) ou disque local (dev)
// ============================================
const storeDocument = async (file) => {
  // Prod (Vercel) : BLOB_READ_WRITE_TOKEN est fourni automatiquement
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const ext = path.extname(file.originalname) || '';
      const blob = await put(`grossistes/grossiste_${Date.now()}${ext}`, file.buffer, {
        access: 'public',
        allowOverwrite: true
      });
      return blob.url;
    } catch (e) {
      console.error('[BLOB] echec upload, fallback disque:', e.message);
    }
  }
  // Fallback dev local : ecrit sur disque
  const dir = path.join(__dirname, '../../uploads/grossistes');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `grossiste_${Date.now()}${path.extname(file.originalname)}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `/uploads/grossistes/${filename}`;
};

// ============================================
// REGISTER GROSSISTE — avec fichier upload
// ============================================
export const registerGrossiste = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, address, city,
            company_name, rc_number, estimated_volume } = req.body;

    if (!email || !password || !first_name || !last_name || !phone || !company_name) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check email unique
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Stockage du fichier : Vercel Blob (prod) ou disque local (dev)
    const document_path = req.file ? await storeDocument(req.file) : null;

    const result = await pool.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, address, city,
        user_type, role_id, is_active, approval_status,
        company_name, rc_number, estimated_volume, document_path
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'wholesale',3,true,'pending',$8,$9,$10,$11)
      RETURNING id, email, first_name, last_name, approval_status
    `, [normalizedEmail, hashedPassword, first_name, last_name, phone,
        address || null, city || null,
        company_name, rc_number || null, estimated_volume || null, document_path]);

    res.status(201).json({ message: 'Demande enregistrée', user: result.rows[0] });
  } catch (e) { next(e); }
};

// ============================================
// GET PENDING GROSSISTES — Super Admin
// ============================================
export const getPendingGrossistes = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, address, city, company_name,
             rc_number, estimated_volume, approval_status, rejection_reason, created_at,
             CASE WHEN document_path IS NOT NULL THEN true ELSE false END as has_document
      FROM users
      WHERE user_type = 'wholesale'
      ORDER BY (approval_status = 'pending') DESC, created_at DESC
    `);
    res.json(result.rows);
  } catch (e) { next(e); }
};

// ============================================
// GET DOCUMENT GROSSISTE — Super Admin (protege)
// ============================================
export const getGrossisteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT document_path FROM users WHERE id = $1 AND user_type = $2',
      [id, 'wholesale']
    );
    const docPath = result.rows[0]?.document_path;
    if (!docPath) return res.status(404).json({ error: 'Document introuvable' });

    // Stocke sur Vercel Blob (URL public) -> simple redirection
    if (/^https?:\/\//i.test(docPath)) return res.redirect(docPath);

    // Fallback dev local : ghir smiya dyal fichier
    const filename = path.basename(docPath);
    const filePath = path.join(__dirname, '../../uploads/grossistes', filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Document introuvable' });

    res.sendFile(filePath);
  } catch (e) { next(e); }
};

// ============================================
// APPROVE / REJECT
// ============================================
export const approveGrossiste = async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `UPDATE users SET approval_status='approved', rejection_reason=NULL
       WHERE id=$1 AND user_type='wholesale' RETURNING id`,
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Grossiste introuvable' });
    res.json({ message: 'Grossiste approuvé' });
  } catch (e) { next(e); }
};

export const rejectGrossiste = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const r = await pool.query(
      `UPDATE users SET approval_status='rejected', rejection_reason=$1
       WHERE id=$2 AND user_type='wholesale' RETURNING id`,
      [reason || null, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Grossiste introuvable' });
    res.json({ message: 'Grossiste refusé' });
  } catch (e) { next(e); }
};
