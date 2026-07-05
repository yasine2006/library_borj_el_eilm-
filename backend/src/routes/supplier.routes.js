import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierDetails } from '../controllers/supplier.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/', verifyToken, checkRole([1, 2]), getSuppliers);
router.post('/', verifyToken, checkRole([1]), createSupplier);
router.put('/:id', verifyToken, checkRole([1]), updateSupplier);
router.delete('/:id', verifyToken, checkRole([1]), deleteSupplier);
router.get('/:id/details', verifyToken, checkRole([1, 2]), getSupplierDetails);
export default router;