import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Employee from './src/models/Employee.js';
import Leave from './src/models/Leave.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms');
  
  const employeeCount = await Employee.countDocuments({ isActive: { $ne: false } });
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const onLeaveCount = await Leave.countDocuments({
    status: 'Approved',
    fromDate: { $lte: endOfDay },
    toDate: { $gte: startOfDay }
  });

  const departments = await Employee.aggregate([
    { $match: { isActive: { $ne: false } } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);

  console.log('--- DASHBOARD VERIFICATION ---');
  console.log('Employee Count:', employeeCount);
  console.log('On Leave Today:', onLeaveCount);
  console.log('Departments:', JSON.stringify(departments, null, 2));
  
  mongoose.connection.close();
}
test().catch(console.error);
