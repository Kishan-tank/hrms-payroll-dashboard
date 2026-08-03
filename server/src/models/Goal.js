import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Missed'],
    default: 'Not Started',
  },
  dueDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
