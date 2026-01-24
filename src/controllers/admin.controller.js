import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
// Zone model import removed


// @desc    Get all farmers
// @route   GET /api/admin/farmers
// @access  Private/Admin
const getFarmers = asyncHandler(async (req, res) => {
  const farmers = await User.find({ role: 'farmer' }).select('-password');
  res.json(farmers);
});

// @desc    Get single farmer by ID
// @route   GET /api/admin/farmers/:id
// @access  Private/Admin
const getFarmerById = asyncHandler(async (req, res) => {
  const farmer = await User.findById(req.params.id).select('-password');
  if (farmer && farmer.role === 'farmer') {
      const farm = await Farm.findOne({ owner: farmer._id });
      res.json({ farmer, farm });
  } else {
    res.status(404);
    throw new Error('Farmer not found');
  }
});

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/admin/farmers/:id/status
// @access  Private/Admin
const updateFarmerStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && user.role === 'farmer') {
    user.isActive = req.body.isActive;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
    });
  } else {
    res.status(404);
    throw new Error('Farmer not found');
  }
});

// @desc    Get all farms
// @route   GET /api/admin/farms
// @access  Private/Admin
const getAllFarms = asyncHandler(async (req, res) => {
  const farms = await Farm.find().populate('owner', 'name email');
  res.json(farms);
});

// Zones logic moved to dedicated controller


export {
  getFarmers,
  getFarmerById,
  updateFarmerStatus,
  getAllFarms,

};
