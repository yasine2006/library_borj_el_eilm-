import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';
import { sendResetPasswordEmail } from '../services/email.service.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, address, city, user_type } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, mot de passe, prénom et nom sont obligatoires' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email deja utilise' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // IMPORTANT: wholessale men inscription public kayb9a 'pending'
    // (ma-ykounch access l prix gros 7ta Super Admin y validih)
    const isWholesale = user_type === 'wholesale';
    const approvalStatus = isWholesale ? 'pending' : 'approved';
    const roleId = 3; // client

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, user_type, role_id, is_active, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10)
       RETURNING id, email, first_name, last_name, phone, address, city, user_type, role_id, approval_status, created_at`,
      [normalizedEmail, hashedPassword, first_name, last_name, phone || null, address || null, city || null,
       isWholesale ? 'wholesale' : 'retail', roleId, approvalStatus]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur cree avec succes',
      token,
      user: {
        id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name,
        user_type: user.user_type, role_id: user.role_id, approval_status: user.approval_status
      }
    });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];

    // Message generic bach ma-nfchoch wach l'email kayn wla la
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    if (!user.is_active) return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        user_type: user.user_type,
        role_id: user.role_id,
        approval_status: user.approval_status || 'approved',
        company_name: user.company_name
      }
    });
  } catch (error) { next(error); }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, address, city, user_type, role_id, is_active, approval_status, company_name FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await pool.query('SELECT id, email, first_name FROM users WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [tokenHash, expires, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    try {
      await sendResetPasswordEmail(user.email, resetLink);
    } catch (mailErr) {
      console.error('[EMAIL] Echec envoi reset:', mailErr.message);
    }

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) { next(error); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token et mot de passe requis' });
    if (password.length < 6) return res.status(400).json({ error: 'Minimum 6 caractères' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [tokenHash]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) { next(error); }
};
