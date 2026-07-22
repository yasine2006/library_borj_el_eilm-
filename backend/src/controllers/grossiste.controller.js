import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// ============================================
// REGISTER GROSSISTE — avec fichier upload
// ============================================
export const registerGrossiste = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, address, city,
            company_name, rc_number, estimated_volume } = req.body;

    if (!email || !password || !first_name || !last_name || !phone || !company_name) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Check email unique
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Chemin du fichier uploadé
    const document_path = req.file ? `/uploads/grossistes/${req.file.filename}` : null;

    const result = await pool.query(`
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, address, city,
        user_type, role_id, is_active, approval_status,
        company_name, rc_number, estimated_volume, document_path
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'wholesale',3,true,'pending',$8,$9,$10,$11)
      RETURNING id, email, first_name, last_name, approval_status
    `, [email, hashedPassword, first_name, last_name, phone,
        address || null, city || null,
        company_name, rc_number || null, estimated_volume || null, document_path]);

    res.status(201).json({ message: 'Demande soumise avec succès', user: result.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ============================================
// GET ALL GROSSISTES — Super Admin
// ============================================
export const getPendingGrossistes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, address, city,
             company_name, rc_number, estimated_volume, document_path,
             approval_status, rejection_reason, created_at
      FROM users
      WHERE user_type = 'wholesale' AND role_id = 3
      ORDER BY
        CASE approval_status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
        created_at DESC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ============================================
// APPROVE GROSSISTE
// ============================================
export const approveGrossiste = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE users SET approval_status='approved' WHERE id=$1 AND user_type='wholesale'",
      [id]
    );
    res.json({ message: 'Grossiste approuvé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ============================================
// REJECT GROSSISTE
// ============================================
export const rejectGrossiste = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await pool.query(
      "UPDATE users SET approval_status='rejected', rejection_reason=$1 WHERE id=$2 AND user_type='wholesale'",
      [reason || null, id]
    );
    res.json({ message: 'Grossiste refusé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};