const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['Holiday', 'Birthday', 'Anniversary', 'Training'] }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);