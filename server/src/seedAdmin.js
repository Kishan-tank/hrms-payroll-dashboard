import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import Employee from "./models/employee.js";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/hrms-pro";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for admin seeding...");

    // Check if an admin account already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(`Admin account already exists (${existingAdmin.email}). Skipping creation.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
      await mongoose.disconnect();
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.create({
      name: "System Admin",
      email: adminEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      department: "Administration",
      designation: "System Administrator",
      isActive: true,
    });

    // Create linked Employee profile
    await Employee.create({
      employeeId: `ADM-${Date.now()}`,
      name: adminUser.name,
      email: adminUser.email,
      department: "Administration",
      role: "admin",
      status: "Active",
      joinDate: new Date(),
      basicPay: 0,
      userId: adminUser._id,
      isActive: true,
    });

    console.log(`Admin account created successfully: ${adminUser.email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedAdmin();
