import express from 'express';
import {
  uploadGalleryImages,
  getGalleryImages,
  deleteGalleryImage,
  replaceGalleryImage,
} from '../controllers/gallery.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, upload.array('images', 10), uploadGalleryImages)
  .get(protect, getGalleryImages);

router
  .route('/:id')
  .delete(protect, deleteGalleryImage)
  .put(protect, upload.single('image'), replaceGalleryImage);

export default router;
