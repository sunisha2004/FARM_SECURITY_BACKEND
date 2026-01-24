import express from 'express';
import { protect, farmer } from '../middleware/authMiddleware.js';
import {
  createFarm,
  getMyFarm,
  updateFarm,
  uploadCCTV,
} from '../controllers/farmer.controller.js';

const router = express.Router();

router.route('/farm')
    .post(protect, farmer, createFarm)
    .get(protect, farmer, getMyFarm)
    .put(protect, farmer, updateFarm);

// Zone routes removed (moved to farmer.zone.routes.js)


import upload from '../middleware/uploadMiddleware.js';

// ...

router.route('/farm/cctv').post(protect, farmer, upload.single('video'), uploadCCTV);

export default router;
