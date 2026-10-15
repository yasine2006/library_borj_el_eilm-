import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/register', registerLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/forgot-password', authLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(resetPassword));
router.get('/me', verifyToken, asyncHandler(getMe));

export default router;
