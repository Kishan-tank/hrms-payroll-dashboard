import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAttendanceHeatmap, getAttritionRisk, getLeaveApprovalTrend } from './src/controllers/analyticsController.js';

dotenv.config();

async function test() {
  if (!process.env.MONGO_URI) {
    console.log("No MONGO_URI in .env, skipping real DB test.");
    return;
  }
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Mock req, res
  const req = {};
  const res = {
    status: (code) => ({
      json: (data) => {
        console.log(`[Response ${code}]:`, JSON.stringify(data, null, 2));
      }
    })
  };

  console.log("--- Testing Heatmap ---");
  await getAttendanceHeatmap(req, res);
  
  console.log("--- Testing Leave Trend ---");
  await getLeaveApprovalTrend(req, res);

  console.log("--- Testing Attrition Risk ---");
  await getAttritionRisk(req, res);

  await mongoose.disconnect();
}

test().catch(console.error);
