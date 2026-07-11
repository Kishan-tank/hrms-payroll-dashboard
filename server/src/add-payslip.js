import mongoose from 'mongoose';
import Document from './models/Document.js';
import User from './models/user.js';

const MONGO_URI = process.env.MONGO_URI;

async function addPayslip() {
  await mongoose.connect(MONGO_URI);
  
  // Find any employee user to link the document to
  const user = await User.findOne({ role: 'employee' });
  if (!user) {
    console.log('No employee found to attach payslip to.');
    process.exit(1);
  }

  const newDoc = await Document.create({
    employeeId: user._id,
    title: 'Payslip - June 2026.txt',
    type: 'Payslip',
    fileUrl: '/uploads/dummy-payslip.txt',
    uploadedBy: user._id
  });

  console.log('Added dummy payslip:', newDoc);
  await mongoose.disconnect();
}

addPayslip().catch(console.error);
