import asyncHandler from 'express-async-handler';
import Zone from '../models/Zone.js';
import Farm from '../models/Farm.js';

// @desc    Create a new zone
// @route   POST /api/farmer/zones
// @access  Private/Farmer
const createZone = asyncHandler(async (req, res) => {
  // console.log('createZone called with body:', req.body);
  const { 
    zoneName, 
    description, 
    riskLevel, 
    category, 
    coordinates, 
    thresholds, 
    securityRules,
    center,
    locationName 
  } = req.body;

  if (!zoneName) {
    res.status(400);
    throw new Error('Please add a zone name');
  }

  if (!coordinates || coordinates.length < 3) {
    res.status(400);
    throw new Error('Please provide at least 3 coordinates for the zone boundary');
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
    category,
    coordinates,
    thresholds,
    securityRules,
    center,
    locationName,
    farmId: farm._id,
    createdBy: req.user._id,
  });

  // AUTO-SYNC: Update Farm location from Zone
  if (locationName) {
    farm.location = locationName;
    await farm.save();
  }

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

  // Ensure zone belongs to the farmer's farm
  if (zone.createdBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to update this zone');
  }

  // If coordinates are being updated, validate them
  if (req.body.coordinates && req.body.coordinates.length < 3) {
    res.status(400);
    throw new Error('Please provide at least 3 coordinates for the zone boundary');
  }

  const updatedZone = await Zone.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true } // Return updated document and run schema validators
  );

  // AUTO-SYNC: Update Farm location if zone has location
  if (updatedZone.locationName) {
    const farm = await Farm.findById(updatedZone.farmId);
    if (farm) {
      farm.location = updatedZone.locationName;
      await farm.save();
    }
  }

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

// @desc    Get primary zone location for auto-sync
// @route   GET /api/farmer/zones/location
// @access  Private/Farmer
const getZoneLocation = asyncHandler(async (req, res) => {
  const farm = await Farm.findOne({ owner: req.user._id });

  if (!farm) {
    res.status(404);
    throw new Error('Farm not found');
  }

  const zones = await Zone.find({ farmId: farm._id }).sort({ createdAt: 1 }).limit(1);

  if (zones.length > 0) {
    const zone = zones[0];
    res.json({
      zoneCenter: zone.center,
      zoneLocationName: zone.locationName || '',
      zoneCoordinates: zone.coordinates
    });
  } else {
    // Return empty if no zone
    res.json({
      zoneCenter: null,
      zoneLocationName: '',
      zoneCoordinates: []
    });
  }
});

export {
  createZone,
  getFarmerZones,
  updateZone,
  deleteZone,
  getAllZones,
  getZoneLocation,
};
