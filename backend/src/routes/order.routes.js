import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders } from '../controllers/order.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

router.post('/', verifyToken, asyncHandler(createOrder));
router.get('/my-orders', verifyToken, asyncHandler(getMyOrders));
router.get('/', verifyToken, checkRole([1, 2]), asyncHandler(getOrders));
router.get('/:id', verifyToken, asyncHandler(getOrderById));
router.put('/:id/status', verifyToken, checkRole([1, 2]), asyncHandler(updateOrderStatus));

export default router;
