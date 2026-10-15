import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStock, bulkCreateProducts } from '../controllers/product.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

router.get('/', asyncHandler(getAllProducts));
router.post('/bulk', verifyToken, checkRole([1, 2]), asyncHandler(bulkCreateProducts));
router.get('/low-stock', verifyToken, checkRole([1, 2]), asyncHandler(getLowStock));
router.get('/:id', asyncHandler(getProductById));
router.post('/', verifyToken, checkRole([1, 2]), asyncHandler(createProduct));
router.put('/:id', verifyToken, checkRole([1, 2]), asyncHandler(updateProduct));
router.delete('/:id', verifyToken, checkRole([1]), asyncHandler(deleteProduct));

export default router;
