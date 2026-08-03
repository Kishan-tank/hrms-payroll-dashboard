import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['Holiday', 'Birthday', 'Anniversary', 'Training', 'Meeting', 'Other'],
    default: 'Other'
  },
  description: { type: String, default: '' },
  relatedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
