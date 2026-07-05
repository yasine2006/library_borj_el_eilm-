import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder
} from '../controllers/purchase_order.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, checkRole([1, 2]), getPurchaseOrders);
router.get('/:id', verifyToken, checkRole([1, 2]), getPurchaseOrderById);
router.post('/', verifyToken, checkRole([1, 2]), createPurchaseOrder);
router.put('/:id/status', verifyToken, checkRole([1, 2]), updatePurchaseOrderStatus);
router.delete('/:id', verifyToken, checkRole([1]), deletePurchaseOrder);

export default router;