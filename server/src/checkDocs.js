import mongoose from 'mongoose';
import Document from './models/Document.js';

const MONGO_URI = process.env.MONGO_URI;

async function checkDocs() {
  await mongoose.connect(MONGO_URI);
  const docs = await Document.find({}, 'title type fileUrl');
  console.log('Docs in DB:');
  console.log(docs);
  await mongoose.disconnect();
}
checkDocs().catch(console.error);
