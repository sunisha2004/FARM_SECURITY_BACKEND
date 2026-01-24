import express from 'express';
import { protect, farmer } from '../middleware/authMiddleware.js'; // Assuming 'farmer' middleware check exists or using generic protect + role check
import {
  createZone,
  getFarmerZones,
  updateZone,
  deleteZone,
} from '../controllers/zone.controller.js';

const router = express.Router();

// All routes here are relative to /api/farmer/zones

router.route('/')
  .post(protect, farmer, createZone)
  .get(protect, farmer, getFarmerZones);

router.route('/:id')
  .put(protect, farmer, updateZone)
  .delete(protect, farmer, deleteZone);

export default router;
