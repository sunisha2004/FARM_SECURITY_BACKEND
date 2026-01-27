import asyncHandler from 'express-async-handler';
import Alert from '../models/Alert.js';
import Video from '../models/Video.js';
import Zone from '../models/Zone.js';

// @desc    Process animal detection and create alert
// @route   POST /api/alerts/detect
// @access  Private/Farmer (or potentially an IoT device with a token)
const processDetection = asyncHandler(async (req, res) => {
    const { animalType, zoneId, zoneName: providedZoneName, videoId } = req.body;

    if (!animalType) {
        res.status(400);
        throw new Error('Animal type is required');
    }

    // Dangerous animals list
    // Risk Classification
    const dangerousAnimals = ['boar', 'elephant', 'tiger', 'bear', 'leopard', 'lion', 'wolf', 'crocodile'];
    const warningAnimals = ['fox', 'monkey', 'unknown'];
    const safeAnimals = ['cow', 'sheep', 'chicken', 'cat', 'dog', 'horse', 'bird', 'goat'];

    let severity = 'SAFE'; 
    if (dangerousAnimals.includes(animalType.toLowerCase())) severity = 'DANGEROUS';
    else if (warningAnimals.includes(animalType.toLowerCase())) severity = 'WARNING';

    let alertZoneName = providedZoneName || 'Unknown Zone';
    let alertZoneId = zoneId || null;

    // Logic: 
    // 1. If zoneName provided directly, use it.
    // 2. If videoId provided, fetch video to get zoneName/zoneId.
    // 3. If zoneId provided, query Zone model.

    if(videoId && alertZoneName === 'Unknown Zone') {
         const video = await Video.findById(videoId);
         if(video) {
             if(video.zoneName) alertZoneName = video.zoneName;
             if(video.zoneId) alertZoneId = video.zoneId;
         }
    }

    // If still unknown but we have a zoneId (either from body or video)
    if (alertZoneId && alertZoneName === 'Unknown Zone') {
        const zone = await Zone.findById(alertZoneId);
        if (zone) alertZoneName = zone.zoneName;
    }

    const message = `⚠️ A ${animalType} detected in ${alertZoneName} zone – ${severity}`;

    const alert = await Alert.create({
        message,
        animalType,
        zoneId: alertZoneId,
        zoneName: alertZoneName,
        videoId: videoId || null,
        severity,
        farmerId: req.user._id,
        isRead: false
    });

    res.status(201).json(alert);
});

// @desc    Get all alerts for the logged-in farmer
// @route   GET /api/alerts
// @access  Private/Farmer
const getAlerts = asyncHandler(async (req, res) => {
    const alerts = await Alert.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
});

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private/Farmer
const markAlertRead = asyncHandler(async (req, res) => {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
        res.status(404);
        throw new Error('Alert not found');
    }

    if (alert.farmerId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    alert.isRead = true;
    const updatedAlert = await alert.save();

    res.json(updatedAlert);
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private/Farmer
const deleteAlert = asyncHandler(async (req, res) => {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
        res.status(404);
        throw new Error('Alert not found');
    }

    if (alert.farmerId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await alert.deleteOne();
    res.json({ id: req.params.id, message: 'Alert removed' });
});

// @desc    Clear all alerts
// @route   DELETE /api/alerts
// @access  Private/Farmer
const clearAllAlerts = asyncHandler(async (req, res) => {
    await Alert.deleteMany({ farmerId: req.user._id });
    res.json({ message: 'All alerts cleared' });
});

// @desc    Get dashboard statistics
// @route   GET /api/alerts/stats
// @access  Private/Farmer
const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // parallel queries for efficiency
    const [todayAlerts, activeAlerts, dangerousAlerts, zonesCount] = await Promise.all([
        Alert.find({ 
            farmerId: req.user._id,
            createdAt: { $gte: today }
        }),
        Alert.countDocuments({ farmerId: req.user._id, isRead: false }),
        Alert.countDocuments({ farmerId: req.user._id, severity: 'DANGEROUS', isRead: false }),
        Zone.countDocuments({ createdBy: req.user._id }) // assuming 'createdBy' links to farmer
    ]);

    // calculate 'Total animals detected today' from alerts? 
    // Or is every alert a detection? Yes, processDetection creates an alert for every detection (subject to throttle).
    // So todayAlerts.length is animals detected today.
    
    // Most frequent animal
    const animalCounts = {};
    todayAlerts.forEach(a => {
        animalCounts[a.animalType] = (animalCounts[a.animalType] || 0) + 1;
    });
    
    let mostFrequent = 'None';
    let maxCount = 0;
    Object.entries(animalCounts).forEach(([type, count]) => {
        if(count > maxCount) {
            maxCount = count;
            mostFrequent = type;
        }
    });

    // Last detected
    const lastAlert = await Alert.findOne({ farmerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
        totalAnimalsToday: todayAlerts.length,
        totalActiveAlerts: activeAlerts,
        totalDangerousAlerts: dangerousAlerts,
        totalZones: zonesCount,
        mostFrequentAnimal: mostFrequent,
        lastDetected: lastAlert ? {
            animal: lastAlert.animalType,
            zone: lastAlert.zoneName,
            time: lastAlert.createdAt
        } : null
    });
});

export {
    processDetection,
    getAlerts,
    markAlertRead,
    deleteAlert,
    clearAllAlerts,
    getDashboardStats
};
