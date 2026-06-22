import Attendance from "../models/attendance.js";
import Employee from "../models/employee.js";

// Fetch all attendance records
export const getAttendance = async (req, res) => {
  try {
    const userRole = req.user?.role;
    let query = {};

    if (userRole === "employee") {
      const userId = req.user?._id || req.user?.id;
      const employee = await Employee.findOne({ userId });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }
      query.employeeId = employee._id;
    } else if (!["admin", "hr", "hr-manager"].includes(userRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const records = await Attendance.find(query).populate("employeeId", "name department employeeId");
    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized." });

    const employee = await Employee.findOne({ userId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });
    
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already checked in today." });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRecord = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: timeString,
      status: "Present"
    });

    res.status(201).json({ success: true, message: "Checked in successfully", record: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check in", error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized." });

    const employee = await Employee.findOne({ userId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ employeeId: employee._id, date: today });
    
    if (!record) {
      return res.status(400).json({ success: false, message: "You haven't checked in yet today." });
    }
    if (record.checkOut) {
      return res.status(400).json({ success: false, message: "You have already checked out today." });
    }

    const now = new Date();
    record.checkOut = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    await record.save();

    res.status(200).json({ success: true, message: "Checked out successfully", record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check out", error: error.message });
  }
};
