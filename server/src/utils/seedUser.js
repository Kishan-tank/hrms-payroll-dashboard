import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedUser = async () => {
  try {
    await connectDB();

    const user = await User.create({
      name: "Demo Employee",
      email: "employee@example.com",
      password: "123456",
      role: "employee",
      department: "Engineering",
      designation: "Intern",
    });

    console.log("Dummy user created:", user.email);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedUser();