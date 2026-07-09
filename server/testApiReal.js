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
    
    console.log("--- Fetching HR Summary ---");
    const sumRes = await fetch("http://localhost:5000/api/dashboard/hr-summary", {
      headers: { "Authorization": `Bearer ${hrToken}` }
    });
    const sumData = await sumRes.json();
    console.log("Summary fetched:", sumData.summary);
    
    console.log("\n--- Sending exact summary to /insights ---");
    const hrRes = await fetch("http://localhost:5000/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` },
      body: JSON.stringify({ summary: sumData.summary })
    });
    console.log("Status:", hrRes.status);
    const result = await hrRes.json();
    console.log("Response:", JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
