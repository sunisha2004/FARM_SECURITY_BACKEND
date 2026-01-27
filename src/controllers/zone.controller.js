import asyncHandler from 'express-async-handler';
import Zone from '../models/Zone.js';
import Farm from '../models/Farm.js';

// @desc    Create a new zone
// @route   POST /api/farmer/zones
// @access  Private/Farmer
const createZone = asyncHandler(async (req, res) => {
  // console.log('createZone called with body:', req.body);
  const { zoneName, description, riskLevel } = req.body;

  if (!zoneName) {
    res.status(400);
    throw new Error('Please add a zone name');
  }

  // Find farmer's farm
  const farm = await Farm.findOne({ owner: req.user._id });

  if (!farm) {
    res.status(400);
    throw new Error('Please create a farm first');
  }

  const zone = await Zone.create({
    zoneName,
    description,
    riskLevel,
    farmId: farm._id,
    createdBy: req.user._id,
  });

  res.status(201).json(zone);
});

// @desc    Get all zones for logged-in farmer
// @route   GET /api/farmer/zones
// @access  Private/Farmer
const getFarmerZones = asyncHandler(async (req, res) => {
  // console.log('getFarmerZones called for user:', req.user._id);
  const farm = await Farm.findOne({ owner: req.user._id });

  if (!farm) {
    // If no farm, return empty list (or error depending on preference, logic says empty list is fine)
    return res.json([]);
  }

  const zones = await Zone.find({ farmId: farm._id });
  res.json(zones);
});

// @desc    Update a zone
// @route   PUT /api/farmer/zones/:id
// @access  Private/Farmer
const updateZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    res.status(404);
    throw new Error('Zone not found');
  }

  // Ensure zone belongs to the farmer's farm (and thus user)
  // We can check if zone.createdBy equals user or if farm.owner equals user.
  // Using createdBy is safer if we want to track who made it, but farm ownership is the main authority.
  // Checking createdBy:
  if (zone.createdBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to update this zone');
  }

  const updatedZone = await Zone.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // Return updated document
  );

  res.json(updatedZone);
});

// @desc    Delete a zone
// @route   DELETE /api/farmer/zones/:id
// @access  Private/Farmer
const deleteZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    res.status(404);
    throw new Error('Zone not found');
  }

  if (zone.createdBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to delete this zone');
  }

  await zone.deleteOne();

  res.json({ id: req.params.id, message: 'Zone removed' });
});

// @desc    Get all zones (Admin)
// @route   GET /api/admin/zones
// @access  Private/Admin
const getAllZones = asyncHandler(async (req, res) => {
  const zones = await Zone.find()
    .populate('farmId', 'farmName') // Populate farm name
    .populate('createdBy', 'name email'); // Populate farmer details

  res.json(zones);
});

export {
  createZone,
  getFarmerZones,
  updateZone,
  deleteZone,
  getAllZones,
};
