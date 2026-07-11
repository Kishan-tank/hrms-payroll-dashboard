import mongoose from 'mongoose';

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms-pro');
  const db = mongoose.connection.db;
  const employees = await db.collection('employees').find({}).toArray();
  const users = await db.collection('users').find({}).toArray();
  console.log("USERS:", users.map(u => ({ id: u._id, email: u.email, role: u.role })));
  console.log("EMPLOYEES:", employees.map(e => ({ id: e._id, email: e.email, userId: e.userId })));
  process.exit(0);
}

check();
