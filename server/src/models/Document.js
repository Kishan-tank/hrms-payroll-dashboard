import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['Offer Letter', 'Payslip', 'Policy', 'Other', 'ID Proof'] },
  fileUrl: { type: String, required: true }, // Local path or URL
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
