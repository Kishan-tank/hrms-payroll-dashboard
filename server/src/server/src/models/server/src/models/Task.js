const taskSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);