import express from 'express';
import { getStockMovements, addStock, removeStock, getStockSummary } from '../controllers/stock.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/movements', verifyToken, checkRole([1, 2]), getStockMovements);
router.get('/summary', verifyToken, checkRole([1, 2]), getStockSummary);
router.post('/add', verifyToken, checkRole([1, 2]), addStock);
router.post('/remove', verifyToken, checkRole([1, 2]), removeStock);

export default router;