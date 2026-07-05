import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/', getCategories);
router.post('/', verifyToken, checkRole([1]), createCategory);
router.put('/:id', verifyToken, checkRole([1]), updateCategory);
router.delete('/:id', verifyToken, checkRole([1]), deleteCategory);
export default router;