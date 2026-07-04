import mongoose from 'mongoose';

const faqCategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String, required: true },
  items: [{
    id: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('FAQCategory', faqCategorySchema);
