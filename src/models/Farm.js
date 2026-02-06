import mongoose from 'mongoose';

const farmSchema = mongoose.Schema(
  {
    farmName: {
      type: String,
      required: [true, 'Please add a farm name'],
    },
    location: {
      type: String,
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    cameraFeeds: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    }
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 4;
}

const Farm = mongoose.model('Farm', farmSchema);

export default Farm;
