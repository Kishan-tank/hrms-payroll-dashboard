import mongoose from 'mongoose';
import Document from './models/Document.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set.');
  process.exit(1);
}

async function removeDummyDocs() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.');

  const res = await Document.deleteMany({ fileUrl: { $regex: '^/dummy-' } });
  console.log('Deleted dummy docs:', res.deletedCount);

  console.log('🎉 Done!');
  await mongoose.disconnect();
  process.exit(0);
}

removeDummyDocs().catch(console.error);
