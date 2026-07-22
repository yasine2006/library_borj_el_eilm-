import express from 'express';
import { registerGrossiste, getPendingGrossistes, approveGrossiste, rejectGrossiste } from '../controllers/grossiste.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public — inscription avec fichier
router.post('/register', (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Fichier trop volumineux (max 5MB)' });
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, registerGrossiste);

// Super Admin fqt
router.get('/', verifyToken, checkRole([1]), getPendingGrossistes);
router.put('/:id/approve', verifyToken, checkRole([1]), approveGrossiste);
router.put('/:id/reject', verifyToken, checkRole([1]), rejectGrossiste);

export default router;