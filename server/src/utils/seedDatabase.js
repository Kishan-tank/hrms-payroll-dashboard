import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/user.js";
import Employee from "../models/employee.js";
import Attendance from "../models/attendance.js";
import Leave from "../models/leave.js";
import Payroll from "../models/payroll.js";
import Skill from "../models/Skill.js";
import PerformanceReview from "../models/PerformanceReview.js";
import Task from "../models/Task.js";
import Goal from "../models/Goal.js";
import Event from "../models/Event.js";
import bcrypt from "bcrypt";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing old data...");
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    await Skill.deleteMany({});
    await PerformanceReview.deleteMany({});
    await Task.deleteMany({});
    await Goal.deleteMany({});
    await Event.deleteMany({});

    console.log("Creating Users and Employees...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const employeeData = [
      { name: "Anil Kumar", email: "anil@example.com", role: "hr", dept: "HR", basicPay: 70000, eId: "EMP001" },
      { name: "Priya Nair", email: "priya@example.com", role: "employee", dept: "Marketing", basicPay: 76000, eId: "EMP002" },
      { name: "Rahul Mehta", email: "rahul@example.com", role: "employee", dept: "Sales", basicPay: 91000, eId: "EMP003" },
      { name: "Sneha Rao", email: "sneha@example.com", role: "employee", dept: "Engineering", basicPay: 54000, eId: "EMP004" }
    ];

    const employees = [];

    for (const data of employeeData) {
      // 1. Create User (for login)
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        department: data.dept,
        designation: "Staff",
      });

      // 2. Create Employee Profile
      const emp = await Employee.create({
        employeeId: data.eId,
        name: data.name,
        email: data.email,
        department: data.dept,
        role: "Staff",
        joinDate: new Date("2022-01-15"),
        basicPay: data.basicPay,
        userId: user._id
      });
      employees.push(emp);
    }

    console.log("Creating Attendance records...");
    const today = new Date().toISOString().split('T')[0];
    
    await Attendance.create([
      { employeeId: employees[0]._id, date: today, checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present" },
      { employeeId: employees[1]._id, date: today, checkIn: "09:45 AM", checkOut: "06:00 PM", status: "Late" },
      { employeeId: employees[2]._id, date: today, checkIn: "-", checkOut: "-", status: "Absent" },
      { employeeId: employees[3]._id, date: today, checkIn: "-", checkOut: "-", status: "Leave" }
    ]);

    console.log("Creating Leave records...");
    await Leave.create([
      { employeeId: employees[1]._id, type: "Sick Leave", fromDate: today, toDate: today, days: 1, status: "Approved" },
      { employeeId: employees[2]._id, type: "Earned Leave", fromDate: "2026-06-18", toDate: "2026-06-20", days: 3, status: "Pending" }
    ]);

    console.log("Creating Payroll records...");
    await Payroll.create([
      { employeeId: employees[0]._id, month: "May", year: 2026, basicPay: employees[0].basicPay, deductions: 5000, netPay: employees[0].basicPay - 5000, status: "Paid", paidAt: new Date("2026-05-31") },
      { employeeId: employees[1]._id, month: "May", year: 2026, basicPay: employees[1].basicPay, deductions: 2000, netPay: employees[1].basicPay - 2000, status: "Paid", paidAt: new Date("2026-05-31") },
      { employeeId: employees[2]._id, month: "June", year: 2026, basicPay: employees[2].basicPay, deductions: 3000, netPay: employees[2].basicPay - 3000, status: "Pending" }
    ]);

    console.log("Creating Phase 2 records for Priya (employees[1])...");
    // Seed Skills
    await Skill.create([
      { employeeId: employees[1]._id, name: "React", proficiency: 95, endorsements: 5 },
      { employeeId: employees[1]._id, name: "TypeScript", proficiency: 85, endorsements: 3 },
      { employeeId: employees[1]._id, name: "Tailwind CSS", proficiency: 92, endorsements: 8 },
      { employeeId: employees[1]._id, name: "Node.js", proficiency: 70, endorsements: 2 }
    ]);

    // Seed PerformanceReview
    await PerformanceReview.create({
      employeeId: employees[1]._id,
      score: 92,
      reviewPeriod: "Q1 2026",
      managerFeedback: "Excellent work on frontend widgets."
    });

    // Seed Tasks
    await Task.create([
      { employeeId: employees[1]._id, title: "Design MyGoals Component", status: "Done", priority: "High" },
      { employeeId: employees[1]._id, title: "Integrate API for user stats", status: "In Progress", priority: "Medium" },
      { employeeId: employees[1]._id, title: "Update documentation for V2", status: "Pending", priority: "Low" }
    ]);

    // Seed Goals
    await Goal.create([
      { employeeId: employees[1]._id, title: "Ship Employee Portal V2", progress: 85, dueDate: new Date("2026-06-30") },
      { employeeId: employees[1]._id, title: "Complete AWS Certification", progress: 40, dueDate: new Date("2026-07-15") },
      { employeeId: employees[1]._id, title: "Reduce API Latency by 20%", progress: 100, dueDate: new Date("2026-05-30") }
    ]);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n--- TEST ACCOUNTS ---");
    console.log("HR Login: anil@example.com / password123");
    console.log("Employee Login: priya@example.com / password123");
    
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
