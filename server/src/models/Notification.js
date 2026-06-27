import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['leave', 'payroll', 'attendance', 'document', 'system'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      // Optional frontend route to navigate to on click
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast per-user queries
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
