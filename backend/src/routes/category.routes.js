import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();
router.get('/', asyncHandler(getCategories));
router.post('/', verifyToken, checkRole([1]), asyncHandler(createCategory));
router.put('/:id', verifyToken, checkRole([1]), asyncHandler(updateCategory));
router.delete('/:id', verifyToken, checkRole([1]), asyncHandler(deleteCategory));
export default router;
