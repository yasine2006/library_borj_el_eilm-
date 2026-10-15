import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getStats, createAdmin } from '../controllers/user.controller.js';
import { verifyToken, checkRole, checkSelfOrRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

// FIX: Stats et Users visibles par Admin (role 2) + Super Admin (role 1)
router.get('/stats', verifyToken, checkRole([1, 2]), asyncHandler(getStats));
router.get('/', verifyToken, checkRole([1, 2]), asyncHandler(getAllUsers));
router.get('/:id', verifyToken, checkSelfOrRole([1, 2]), asyncHandler(getUserById));
router.put('/:id', verifyToken, checkSelfOrRole([1, 2]), asyncHandler(updateUser));
router.delete('/:id', verifyToken, checkRole([1]), asyncHandler(deleteUser));
router.post('/create-admin', verifyToken, checkRole([1]), asyncHandler(createAdmin));

export default router;
