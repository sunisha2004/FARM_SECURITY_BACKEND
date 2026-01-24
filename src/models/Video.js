import mongoose from 'mongoose';

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a video title'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add a file URL'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', videoSchema);

export default Video;
