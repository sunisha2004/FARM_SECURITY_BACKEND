import asyncHandler from 'express-async-handler';
import Video from '../models/Video.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private/Farmer
const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No video file uploaded');
  }

  const { title, zoneId, zoneName } = req.body;
  const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;

  const video = await Video.create({
    title: title || req.file.originalname,
    fileUrl,
    uploadedBy: req.user._id,
    zoneId: zoneId || null,
    zoneName: zoneName || null
  });

  res.status(201).json(video);
});

// @desc    Get my videos
// @route   GET /api/videos
// @access  Private/Farmer
const getMyVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(videos);
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private/Farmer
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  // Check ownership
  if (video.uploadedBy.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Delete local file
  // Convert URL back to system path if possible, or just ignore if complexity is high
  // For now, simple attempt:
  try {
     const relativePath = video.fileUrl.startsWith('/') ? video.fileUrl.substring(1) : video.fileUrl;
     // Assuming server process cwd is root
     if(fs.existsSync(relativePath)) {
         fs.unlinkSync(relativePath);
     }
  } catch(err) {
      console.error("Error deleting file:", err);
  }

  await video.deleteOne();
  res.json({ id: req.params.id });
});

// @desc    Update video (Title or File)
// @route   PUT /api/videos/:id
// @access  Private/Farmer
const updateVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }
    
    if (video.uploadedBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    video.title = req.body.title || video.title;
    
    // If a new file is uploaded, replace the old one
    if(req.file) {
         // Delete old file
         try {
            const relativePath = video.fileUrl.startsWith('/') ? video.fileUrl.substring(1) : video.fileUrl;
            if(fs.existsSync(relativePath)) {
                fs.unlinkSync(relativePath);
            }
         } catch(err) {/* ignore */}

         video.fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const updatedVideo = await video.save();
    res.json(updatedVideo);
});

export {
  uploadVideo,
  getMyVideos,
  deleteVideo,
  updateVideo
};
