import mongoose from 'mongoose';

const onboardingStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completedAt: { type: Date },
}, { _id: false });

const onboardingActivitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
}, { _id: false });

const onboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    steps: [onboardingStepSchema],
    currentStepId: {
      type: String,
      default: 'profile',
    },
    policyAccepted: {
      type: Boolean,
      default: false,
    },
    policyAcceptedAt: {
      type: Date,
      default: null,
    },
    reviewStatus: {
      type: String,
      enum: ['In Progress', 'Pending Review', 'Approved', 'Rejected'],
      default: 'In Progress',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    activityLogs: [onboardingActivitySchema],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Onboarding', onboardingSchema);
