import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getFarmers,
  getFarmerById,
  updateFarmerStatus,
  getAllFarms,
  getGlobalStats,
  getFarmerDetails
} from '../controllers/admin.controller.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getGlobalStats);
router.route('/farmers').get(protect, admin, getFarmers);
router.route('/farmers/:id').get(protect, admin, getFarmerById);
router.route('/farmers/:id/details').get(protect, admin, getFarmerDetails);
router.route('/farmers/:id/status').patch(protect, admin, updateFarmerStatus);
router.route('/farms').get(protect, admin, getAllFarms);
// Zone routes removed (moved to admin.zone.routes.js)


export default router;
