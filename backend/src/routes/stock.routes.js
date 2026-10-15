import express from 'express';
import { getStockMovements, addStock, removeStock, getStockSummary } from '../controllers/stock.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();
router.get('/movements', verifyToken, checkRole([1, 2]), asyncHandler(getStockMovements));
router.get('/summary', verifyToken, checkRole([1, 2]), asyncHandler(getStockSummary));
router.post('/add', verifyToken, checkRole([1, 2]), asyncHandler(addStock));
router.post('/remove', verifyToken, checkRole([1, 2]), asyncHandler(removeStock));

export default router;
