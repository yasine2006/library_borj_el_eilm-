import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder
} from '../controllers/purchase_order.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

router.get('/', verifyToken, checkRole([1, 2]), asyncHandler(getPurchaseOrders));
router.get('/:id', verifyToken, checkRole([1, 2]), asyncHandler(getPurchaseOrderById));
router.post('/', verifyToken, checkRole([1, 2]), asyncHandler(createPurchaseOrder));
router.put('/:id/status', verifyToken, checkRole([1, 2]), asyncHandler(updatePurchaseOrderStatus));
router.delete('/:id', verifyToken, checkRole([1]), asyncHandler(deletePurchaseOrder));

export default router;
