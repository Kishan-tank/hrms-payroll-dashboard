/**
 * seed.js — One-time demo seed for HRMSPro
 *
 * Creates two demo accounts with linked Employee profiles:
 *   HR Manager : demo.hr@hrmspro.com   / Demo@1234
 *   Employee   : demo.employee@hrmspro.com / Demo@1234
 *
 * Run:  node --env-file=.env src/seed.js
 * Safe: skips if emails already exist — idempotent.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dns from 'dns';

// ── inline model imports (avoids circular deps with app.js) ──────────────────
import User from './models/user.js';
import Employee from './models/employee.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set. Create a .env file in the server/ directory.');
  process.exit(1);
}

// ── demo accounts definition ─────────────────────────────────────────────────
const DEMO_PASSWORD = 'Demo@1234';

const DEMO_ACCOUNTS = [
  {
    user: {
      name: 'Demo HR Manager',
      email: 'demo.hr@hrmspro.com',
      role: 'hr-manager',
      department: 'Human Resources',
      designation: 'HR Manager',
    },
    employee: {
      employeeId: 'EMP-DEMO-001',
      name: 'Demo HR Manager',
      email: 'demo.hr@hrmspro.com',
      phone: '+91-9000000001',
      department: 'Human Resources',
      role: 'HR Manager',
      status: 'Active',
      joinDate: new Date('2023-01-15'),
      basicPay: 120000,
    },
  },
  {
    user: {
      name: 'Demo Employee',
      email: 'demo.employee@hrmspro.com',
      role: 'employee',
      department: 'Engineering',
      designation: 'Software Engineer',
    },
    employee: {
      employeeId: 'EMP-DEMO-002',
      name: 'Demo Employee',
      email: 'demo.employee@hrmspro.com',
      phone: '+91-9000000002',
      department: 'Engineering',
      role: 'Software Engineer',
      status: 'Active',
      joinDate: new Date('2023-06-01'),
      basicPay: 75000,
    },
  },
];

// ── main seed function ────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱  Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected.\n');

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const account of DEMO_ACCOUNTS) {
    const { user: userData, employee: employeeData } = account;

    // ── User record ───────────────────────────────────────────────────────
    let user = await User.findOne({ email: userData.email });

    if (user) {
      console.log(`⏭  User already exists: ${userData.email} — skipping user creation.`);
    } else {
      user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      console.log(`✅  Created User: ${userData.email}  [role: ${userData.role}]`);
    }

    // ── Employee profile record ───────────────────────────────────────────
    let employee = await Employee.findOne({ email: employeeData.email });

    if (employee) {
      // Make sure userId is linked even if employee already existed
      if (!employee.userId || employee.userId.toString() !== user._id.toString()) {
        employee.userId = user._id;
        await employee.save();
        console.log(`🔗  Linked existing Employee profile to User: ${employeeData.email}`);
      } else {
        console.log(`⏭  Employee profile already exists & linked: ${employeeData.email} — skipping.`);
      }
    } else {
      await Employee.create({
        ...employeeData,
        userId: user._id,
      });
      console.log(`✅  Created Employee profile: ${employeeData.email}  [${employeeData.employeeId}]`);
    }

    console.log('');
  }

  console.log('─────────────────────────────────────────────');
  console.log('🎉  Seed complete!\n');
  console.log('  HR Manager  →  demo.hr@hrmspro.com     / Demo@1234');
  console.log('  Employee    →  demo.employee@hrmspro.com / Demo@1234');
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
