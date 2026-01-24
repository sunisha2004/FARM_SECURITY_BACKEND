import express from 'express';
import { protect, farmer } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  uploadVideo,
  getMyVideos,
  deleteVideo,
  updateVideo
} from '../controllers/video.controller.js';

const router = express.Router();

router.route('/')
  .post(protect, farmer, upload.single('video'), uploadVideo)
  .get(protect, farmer, getMyVideos);

router.route('/:id')
  .delete(protect, farmer, deleteVideo)
  .put(protect, farmer, upload.single('video'), updateVideo);

export default router;
