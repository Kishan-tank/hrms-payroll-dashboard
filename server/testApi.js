import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find HR user
    const hr = await mongoose.connection.collection("users").findOne({ role: "hr", isActive: true });
    if (!hr) throw new Error("No HR found");
    const hrToken = jwt.sign({ id: hr._id }, process.env.JWT_SECRET);
    
    // Find Employee user
    const emp = await mongoose.connection.collection("users").findOne({ role: "employee", isActive: true });
    if (!emp) throw new Error("No Employee found");
    const empToken = jwt.sign({ id: emp._id }, process.env.JWT_SECRET);
    
    console.log("--- TEST 1: HR Hits /insights ---");
    const hrRes = await fetch("http://localhost:5000/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` },
      body: JSON.stringify({ summary: { totalEmployees: 50, presentToday: 48, onLeave: 2 } })
    });
    console.log("Status:", hrRes.status);
    console.log("Response:", JSON.stringify(await hrRes.json(), null, 2));
    
    console.log("\n--- TEST 2: Employee Hits /insights ---");
    const empRes = await fetch("http://localhost:5000/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${empToken}` },
      body: JSON.stringify({ summary: { totalEmployees: 50, presentToday: 48, onLeave: 2 } })
    });
    console.log("Status:", empRes.status);
    console.log("Response:", JSON.stringify(await empRes.json(), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
