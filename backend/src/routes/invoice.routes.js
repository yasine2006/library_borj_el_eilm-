import express from 'express';
import { generateInvoice } from '../controllers/invoice.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/:id/pdf', verifyToken, generateInvoice);

export default router;