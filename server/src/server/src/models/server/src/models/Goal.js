const goalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  dueDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);