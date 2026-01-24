import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming 'admin' middleware exists
import { getAllZones } from '../controllers/zone.controller.js';

const router = express.Router();

// All routes here are relative to /api/admin/zones

router.route('/')
  .get(protect, admin, getAllZones);

export default router;
