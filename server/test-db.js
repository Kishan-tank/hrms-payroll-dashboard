import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const db = mongoose.connection.db;
    const today = new Date().toISOString().split('T')[0];
    
    const attendanceCount = await db.collection('attendances').countDocuments({ date: today });
    console.log(`Total Attendance records for today (${today}):`, attendanceCount);
    
    const allAtt = await db.collection('attendances').countDocuments();
    console.log("Total Attendance records all time:", allAtt);

    const pendingLeaves = await db.collection('leaves').countDocuments({ status: "Pending" });
    console.log("Total pending leaves:", pendingLeaves);

    mongoose.connection.close();
  })
  .catch(console.error);
