import mongoose from 'mongoose';
import Notification from './models/notification.js';
import User from './models/user.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set. Create a .env file in the server/ directory.');
  process.exit(1);
}

async function seedNotifications() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.');

  const users = await User.find({});
  if (users.length === 0) {
    console.log('No users found to seed notifications for.');
    process.exit(0);
  }

  for (const user of users) {
    // Delete existing notifications for a clean slate
    await Notification.deleteMany({ userId: user._id });

    const notifications = [
      {
        userId: user._id,
        title: 'System Update Completed',
        message: 'The HRMSPro system was successfully updated to version 2.1.',
        type: 'system',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      },
      {
        userId: user._id,
        title: 'Payroll Processed',
        message: 'Your payroll for the previous month has been processed successfully.',
        type: 'payroll',
        read: false,
        link: '/payroll',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        userId: user._id,
        title: 'Leave Request Approved',
        message: 'Your request for Sick Leave has been approved by your manager.',
        type: 'leave',
        read: false,
        link: '/leave',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      },
      {
        userId: user._id,
        title: 'New Document Uploaded',
        message: 'HR has uploaded the new Company Policy document. Please review it.',
        type: 'document',
        read: true,
        link: '/documents',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      },
    ];

    await Notification.insertMany(notifications);
    console.log(`✅ Seeded 4 notifications for user: ${user.email}`);
  }

  console.log('🎉 Done!');
  await mongoose.disconnect();
  process.exit(0);
}

seedNotifications().catch(console.error);
