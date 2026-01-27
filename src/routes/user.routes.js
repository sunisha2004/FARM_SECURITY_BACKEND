import express from 'express';
import {
  getMe,
  updateMe,
  deactivateUser,
} from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('image'), updateMe);
router.patch('/deactivate/:id', protect, adminOnly, deactivateUser);

export default router;
