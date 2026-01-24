import express from 'express';
import {
  getMe,
  updateMe,
  deactivateUser,
} from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.patch('/deactivate/:id', protect, adminOnly, deactivateUser);

export default router;
