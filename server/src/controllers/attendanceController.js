import Attendance from "../models/attendance.js";
import Employee from "../models/employee.js";

// Fetch all attendance records
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employeeId", "name department employeeId");
    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Check-in
export const checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found" });

    const date = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const currentTime = now.toLocaleTimeString('en-US', timeOptions);

    let record = await Attendance.findOne({ employeeId: employee._id, date });
    if (record) {
      if (record.checkIn && record.checkIn !== "-") {
        return res.status(400).json({ success: false, message: "Already checked in today" });
      } else {
        record.checkIn = currentTime;
        record.status = "Present";
        await record.save();
      }
    } else {
      record = await Attendance.create({
        employeeId: employee._id,
        date,
        checkIn: currentTime,
        status: "Present"
      });
    }
    res.status(200).json({ success: true, message: "Checked in successfully", record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Check-out
export const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found" });

    const date = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const currentTime = now.toLocaleTimeString('en-US', timeOptions);

    let record = await Attendance.findOne({ employeeId: employee._id, date });
    if (!record || !record.checkIn || record.checkIn === "-") {
      return res.status(400).json({ success: false, message: "Please check in first" });
    }
    
    if (record.checkOut && record.checkOut !== "-") {
      return res.status(400).json({ success: false, message: "Already checked out today" });
    }

    record.checkOut = currentTime;
    await record.save();

    res.status(200).json({ success: true, message: "Checked out successfully", record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
