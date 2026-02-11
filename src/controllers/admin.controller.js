import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Zone from '../models/Zone.js';
import Video from '../models/Video.js';
import Alert from '../models/Alert.js';


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
  const { isActive } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: false }
  ).select('-password');

  if (updatedUser) {
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

// @desc    Get detailed farmer info
// @route   GET /api/admin/farmers/:id/details
// @access  Private/Admin
const getFarmerDetails = asyncHandler(async (req, res) => {
  const farmer = await User.findById(req.params.id).select('-password');
  
  if (!farmer || farmer.role !== 'farmer') {
    res.status(404);
    throw new Error('Farmer not found');
  }

  // Aggregate Data
  const farms = await Farm.find({ owner: farmer._id });
  const zones = await Zone.find({ createdBy: farmer._id });
  const videos = await Video.find({ uploadedBy: farmer._id });
  const alerts = await Alert.find({ farmerId: farmer._id });

  // Statistics
  const stats = {
      farmCount: farms.length,
      zoneCount: zones.length,
      videoCount: videos.length,
      alertCount: alerts.length,
      dangerousAlerts: alerts.filter(a => a.severity === 'DANGEROUS' || a.severity === 'HIGH').length,
      safeAlerts: alerts.filter(a => a.severity === 'SAFE' || a.severity === 'WARNING' || a.severity === 'LOW').length,
      animalSummary: alerts.reduce((acc, alert) => {
          acc[alert.animalType] = (acc[alert.animalType] || 0) + 1;
          return acc;
      }, {}),
      lastActivity: alerts.length > 0 || videos.length > 0
        ? new Date(Math.max(
            ...alerts.map(a => new Date(a.createdAt)),
            ...videos.map(v => new Date(v.createdAt)),
            new Date(0)
          ))
        : null
  };

  res.json({
    farmer,
    farms,
    stats
  });
});

// @desc    Get global statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getGlobalStats = asyncHandler(async (req, res) => {
  const farmersCount = await User.countDocuments({ role: 'farmer' });
  const farmsCount = await Farm.countDocuments();
  const zonesCount = await Zone.countDocuments();
  const alertsCount = await Alert.countDocuments();

  res.json({
    farmers: farmersCount,
    farms: farmsCount,
    zones: zonesCount,
    alerts: alertsCount
  });
});

// @desc    Get all farms
// @route   GET /api/admin/farms
// @access  Private/Admin
const getAllFarms = asyncHandler(async (req, res) => {
  const farms = await Farm.find().populate('owner', 'name email');
  res.json(farms);
});

export {
  getFarmers,
  getFarmerById,
  updateFarmerStatus,
  getAllFarms,
  getFarmerDetails,
  getGlobalStats
};
