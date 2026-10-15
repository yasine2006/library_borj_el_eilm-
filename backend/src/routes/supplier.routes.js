import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierDetails } from '../controllers/supplier.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();
router.get('/', verifyToken, checkRole([1, 2]), asyncHandler(getSuppliers));
router.post('/', verifyToken, checkRole([1]), asyncHandler(createSupplier));
router.put('/:id', verifyToken, checkRole([1]), asyncHandler(updateSupplier));
router.delete('/:id', verifyToken, checkRole([1]), asyncHandler(deleteSupplier));
router.get('/:id/details', verifyToken, checkRole([1, 2]), asyncHandler(getSupplierDetails));
export default router;
