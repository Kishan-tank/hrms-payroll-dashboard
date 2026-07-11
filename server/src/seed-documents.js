import mongoose from 'mongoose';
import Document from './models/document.js';
import User from './models/user.js';
import Employee from './models/employee.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set.');
  process.exit(1);
}

async function seedDocuments() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.');

  // Clean existing documents
  await Document.deleteMany({});

  const users = await User.find({});
  if (users.length === 0) {
    console.log('No users found.');
    process.exit(0);
  }

  // 1. Create global policies
  const policies = [
    {
      title: 'Company Handbook 2026',
      type: 'Policy',
      fileUrl: '/dummy-handbook.pdf',
    },
    {
      title: 'IT & Security Policy',
      type: 'Policy',
      fileUrl: '/dummy-security-policy.pdf',
    },
    {
      title: 'Leave & Attendance Guidelines',
      type: 'Policy',
      fileUrl: '/dummy-leave-policy.pdf',
    }
  ];

  await Document.insertMany(policies);
  console.log('✅ Seeded 3 global policies');

  // 2. Create personal documents for each user
  for (const user of users) {
    // We'll attach them using the User's ID as the frontend and backend are checking `req.user.id` for employee documents in the controller.
    // However, the schema says employeeId references Employee. Let's provide user._id since the controller uses req.user.id.
    const docs = [
      {
        employeeId: user._id, // Controller checks employeeId: req.user.id
        title: 'Offer Letter - ' + user.name,
        type: 'Offer Letter',
        fileUrl: '/dummy-offer-letter.pdf',
        uploadedBy: user._id
      },
      {
        employeeId: user._id,
        title: 'Payslip - Jun 2026',
        type: 'Payslip',
        fileUrl: '/dummy-payslip-jun.pdf',
        uploadedBy: user._id
      },
      {
        employeeId: user._id,
        title: 'Aadhar Card (ID Proof)',
        type: 'ID Proof',
        fileUrl: '/dummy-aadhar.pdf',
        uploadedBy: user._id
      }
    ];

    await Document.insertMany(docs);
    console.log(`✅ Seeded 3 documents for user: ${user.email}`);
  }

  console.log('🎉 Done!');
  await mongoose.disconnect();
  process.exit(0);
}

seedDocuments().catch(console.error);
