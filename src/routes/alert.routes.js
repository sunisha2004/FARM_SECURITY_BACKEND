import express from 'express';
const router = express.Router();
import {
  processDetection,
  getAlerts,
  markAlertRead,
  deleteAlert
} from '../controllers/alert.controller.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getAlerts);
router.route('/detect').post(protect, processDetection);
router.route('/:id/read').put(protect, markAlertRead);
router.route('/:id').delete(protect, deleteAlert);

export default router;
