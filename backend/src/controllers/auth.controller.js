import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, address, city, user_type } = req.body;

    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email deja utilise' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Role: 3 = client (default)
    const roleId = user_type === 'wholesale' ? 3 : 3; // Both are clients, just different pricing

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, user_type, role_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING id, email, first_name, last_name, phone, address, city, user_type, role_id, created_at`,
      [email, hashedPassword, first_name, last_name, phone || null, address || null, city || null, user_type || 'retail', roleId]
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
      user: { id: user.id, email: user.email, first_name: user.first_name, user_type: user.user_type }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Mot de passe incorrect' });

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
        role_id: user.role_id
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, user_type, role_id, is_active FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};