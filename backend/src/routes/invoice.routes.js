import express from 'express';
import { generateInvoice } from '../controllers/invoice.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();
router.get('/:id/pdf', verifyToken, asyncHandler(generateInvoice));

export default router;
