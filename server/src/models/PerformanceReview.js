import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  score: { type: Number, required: true },
  reviewPeriod: { type: String, required: true },
  managerFeedback: { type: String }
}, { timestamps: true });

export default mongoose.model('PerformanceReview', performanceSchema);
