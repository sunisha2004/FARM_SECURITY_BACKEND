import mongoose from 'mongoose';

const zoneSchema = mongoose.Schema(
  {
    zoneName: {
      type: String,
      required: [true, 'Please add a zone name'],
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['crop_area', 'storage_area', 'livestock_area', 'high_risk_area', 'other'],
      default: 'other',
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    coordinates: {
      type: [{
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }],
      validate: [v => v.length >= 3, 'Zone must have at least 3 coordinates to form a polygon']
    },
    center: {
      lat: { type: Number },
      lng: { type: Number }
    },
    locationName: {
      type: String,
    },
    thresholds: {
      animalCount: { type: Number, default: 1 },
      durationMinutes: { type: Number, default: 5 },
      motionIntensity: { type: Number, default: 50 }, // 0-100 scale
    },
    securityRules: {
      alertLevel: { type: String, enum: ['info', 'warning', 'critical'], default: 'warning' },
      notificationType: { type: [String], enum: ['app', 'email', 'sms'], default: ['app'] },
      allowedAnimals: { type: [String], default: [] },
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Farm',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Zone = mongoose.model('Zone', zoneSchema);

export default Zone;
