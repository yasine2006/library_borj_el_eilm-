import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStock } from '../controllers/product.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/low-stock', verifyToken, checkRole([1, 2]), getLowStock);
router.get('/:id', getProductById);
router.post('/', verifyToken, checkRole([1, 2]), createProduct);
router.put('/:id', verifyToken, checkRole([1, 2]), updateProduct);
router.delete('/:id', verifyToken, checkRole([1]), deleteProduct);

export default router;
