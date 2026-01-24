import mongoose from 'mongoose';

const alertSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Please add an alert message'],
    },
    animalType: {
      type: String,
      required: [true, 'Please add animal type'],
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: false, 
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: false
    },
    zoneName: {
      type: String,
      required: false,
    },
    severity: {
      type: String,
      enum: ['LOW', 'HIGH'],
      default: 'LOW',
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
