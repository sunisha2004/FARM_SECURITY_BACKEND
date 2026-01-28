import asyncHandler from 'express-async-handler';
import GalleryImage from '../models/GalleryImage.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload multiple gallery images
// @route   POST /api/gallery
// @access  Private/Farmer
const uploadGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images uploaded');
  }

  const images = [];
  for (const file of req.files) {
    const imageUrl = `/${file.path.replace(/\\/g, '/')}`;
    const image = await GalleryImage.create({
      user: req.user._id,
      imageUrl,
      title: file.originalname,
    });
    images.push(image);
  }

  res.status(201).json(images);
});

// @desc    Get all gallery images for a farmer
// @route   GET /api/gallery
// @access  Private/Farmer
const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(images);
});

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Farmer
const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  if (image.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Delete local file
  try {
    const relativePath = image.imageUrl.startsWith('/') ? image.imageUrl.substring(1) : image.imageUrl;
    if (fs.existsSync(relativePath)) {
      fs.unlinkSync(relativePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }

  await image.deleteOne();
  res.json({ id: req.params.id });
});

// @desc    Replace a gallery image
// @route   PUT /api/gallery/:id
// @access  Private/Farmer
const replaceGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  if (image.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No new image uploaded');
  }

  // Delete old file
  try {
    const relativePath = image.imageUrl.startsWith('/') ? image.imageUrl.substring(1) : image.imageUrl;
    if (fs.existsSync(relativePath)) {
      fs.unlinkSync(relativePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }

  // Update with new file
  image.imageUrl = `/${req.file.path.replace(/\\/g, '/')}`;
  image.title = req.file.originalname;

  const updatedImage = await image.save();
  res.json(updatedImage);
});

export {
  uploadGalleryImages,
  getGalleryImages,
  deleteGalleryImage,
  replaceGalleryImage,
};
