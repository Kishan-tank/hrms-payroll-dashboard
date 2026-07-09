import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hr = await mongoose.connection.collection("users").findOne({ role: "hr", isActive: true });
    const hrToken = jwt.sign({ id: hr._id }, process.env.JWT_SECRET);
    
    console.log("--- Sending TWO concurrent requests ---");
    const reqs = [
      fetch("http://localhost:5000/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` },
        body: JSON.stringify({ summary: { totalEmployees: 10 } })
      }),
      fetch("http://localhost:5000/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` },
        body: JSON.stringify({ summary: { totalEmployees: 10 } })
      })
    ];
    
    const results = await Promise.all(reqs);
    for (let i = 0; i < results.length; i++) {
        console.log(`Req ${i} Status:`, results[i].status);
        const data = await results[i].json();
        if (!data.success) {
            console.log(`Req ${i} Error:`, data.error || data.message);
        }
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
