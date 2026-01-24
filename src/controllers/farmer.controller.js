import asyncHandler from 'express-async-handler';
import Farm from '../models/Farm.js';
// Zone model import removed as legacy zone logic is being cleaned up


// @desc    Create a farm
// @route   POST /api/farmer/farm
// @access  Private/Farmer
const createFarm = asyncHandler(async (req, res) => {
  const { farmName, location } = req.body;

  const farmExists = await Farm.findOne({ owner: req.user._id });

  if (farmExists) {
    res.status(400);
    throw new Error('You already have a farm');
  }

  const farm = await Farm.create({
    farmName,
    location,
    owner: req.user._id,
  });

  res.status(201).json(farm);
});

// @desc    Get my farm
// @route   GET /api/farmer/farm
// @access  Private/Farmer
const getMyFarm = asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ owner: req.user._id });

  if (farm) {
    res.json(farm);
  } else {
    res.status(404);
    throw new Error('Farm not found');
  }
});

// @desc    Update farm details
// @route   PUT /api/farmer/farm
// @access  Private/Farmer
const updateFarm = asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ owner: req.user._id });

  if (farm) {
    farm.farmName = req.body.farmName || farm.farmName;
    farm.location = req.body.location || farm.location;
    
    // Add camera feeds if provided (handled via separate endpoint usually, but allowing update here too if array provided)
    if(req.body.cameraFeeds) {
         if(req.body.cameraFeeds.length <= 4) {
             farm.cameraFeeds = req.body.cameraFeeds;
         } else {
             res.status(400);
             throw new Error('Max 4 camera feeds allowed');
         }
    }

    const updatedFarm = await farm.save();
    res.json(updatedFarm);
  } else {
    res.status(404);
    throw new Error('Farm not found');
  }
});

// Zones logic moved to dedicated controller


// @desc    Upload CCTV reference (Video File)
// @route   POST /api/farmer/farm/cctv
// @access  Private/Farmer
const uploadCCTV = asyncHandler(async (req, res) => {
    // If using multer, file path is in req.file.path
    if(!req.file) {
        res.status(400);
        throw new Error('Video file is required');
    }

    const farm = await Farm.findOne({ owner: req.user._id });

    if (!farm) {
        res.status(404);
        throw new Error('Farm not found');
    }

    if (farm.cameraFeeds.length >= 4) {
        res.status(400);
        throw new Error('Maximum 4 cameras allowed');
    }

    // Convert local path to URL (assuming server is running on localhost/domain)
    // We'll store the relative path or full URL. 
    // Ideally store relative and prepend domain in frontend, but full URL is easier for now.
    const videoUrl = `/${req.file.path.replace(/\\/g, '/')}`; // Normalize slashes

    farm.cameraFeeds.push(videoUrl);
    await farm.save();

    res.json({ message: 'CCTV video uploaded', cameraFeeds: farm.cameraFeeds, videoUrl });
});


export {
  createFarm,
  getMyFarm,
  updateFarm,
  uploadCCTV
};
