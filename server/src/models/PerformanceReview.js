import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  score: { type: Number, required: true },
  reviewPeriod: { type: String, required: true },
  managerFeedback: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Acknowledged'],
    default: 'Submitted',
  }
}, { timestamps: true });

export default mongoose.model('PerformanceReview', performanceSchema);
