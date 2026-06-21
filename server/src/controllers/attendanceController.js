import Attendance from "../models/attendance.js";

// Fetch all attendance records
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employeeId", "name department employeeId");
    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
