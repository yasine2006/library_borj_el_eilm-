import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders } from '../controllers/order.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/', verifyToken, checkRole([1, 2]), getOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, checkRole([1, 2]), updateOrderStatus);

export default router;
