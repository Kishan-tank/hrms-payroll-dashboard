import mongoose from 'mongoose';

async function sync() {
  await mongoose.connect('mongodb+srv://tankkishan902_db_user:c0Sf5boBDsuZpP7W@cluster0.dia8ndg.mongodb.net/');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  const employees = await db.collection('employees').find({}).toArray();
  
  const existingEmails = new Set(employees.map(e => e.email));
  let count = 0;
  for (const user of users) {
    if (!existingEmails.has(user.email)) {
      await db.collection('employees').insertOne({
        employeeId: `EMP-${Date.now() + Math.floor(Math.random() * 1000)}`,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        department: user.department || "General",
        role: user.role || "employee",
        status: "Active",
        joinDate: new Date(),
        basicPay: 50000,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created employee for ${user.email}`);
      count++;
    }
  }
  console.log(`Created ${count} missing employees.`);
  process.exit(0);
}

sync();
