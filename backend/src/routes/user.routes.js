import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getStats, createAdmin } from '../controllers/user.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// FIX: Stats et Users visibles par Admin (role 2) + Super Admin (role 1)
router.get('/stats', verifyToken, checkRole([1, 2]), getStats);
router.get('/', verifyToken, checkRole([1, 2]), getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, checkRole([1]), deleteUser);
router.post('/create-admin', verifyToken, checkRole([1]), createAdmin);

export default router;