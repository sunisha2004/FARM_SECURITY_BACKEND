import mongoose from 'mongoose';

const galleryImageSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

export default GalleryImage;
