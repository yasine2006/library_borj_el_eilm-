import express from 'express';
import { registerGrossiste, getPendingGrossistes, approveGrossiste, rejectGrossiste } from '../controllers/grossiste.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public — inscription avec fichier
router.post('/register', upload.single('document'), registerGrossiste);

// Super Admin fqt
router.get('/', verifyToken, checkRole([1]), getPendingGrossistes);
router.put('/:id/approve', verifyToken, checkRole([1]), approveGrossiste);
router.put('/:id/reject', verifyToken, checkRole([1]), rejectGrossiste);

export default router;