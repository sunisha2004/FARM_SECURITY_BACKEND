import express from 'express';
const router = express.Router();
import {
  processDetection,
  getAlerts,
  markAlertRead,
  deleteAlert,
  getDashboardStats,
  clearAllAlerts
} from '../controllers/alert.controller.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/stats').get(protect, getDashboardStats);
router.route('/').get(protect, getAlerts).delete(protect, clearAllAlerts);
router.route('/detect').post(protect, processDetection);
router.route('/:id/read').put(protect, markAlertRead);
router.route('/:id').delete(protect, deleteAlert);

export default router;
