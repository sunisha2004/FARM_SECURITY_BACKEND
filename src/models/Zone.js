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
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
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
