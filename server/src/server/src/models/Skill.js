const skillSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  name: { type: String, required: true },
  proficiency: { type: Number, required: true },
  endorsements: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Skill', skillSchema);
