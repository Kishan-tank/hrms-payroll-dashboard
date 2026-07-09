import Attendance from "../models/attendance.js";
import Employee from "../models/employee.js";

const resolveEmployeeForUser = async (user) => {
  const userId = user?._id || user?.id;
  const email = user?.email;

  if (userId) {
    const employeeByUserId = await Employee.findOne({ userId });
    if (employeeByUserId) return employeeByUserId;
  }

  if (email) {
    return Employee.findOne({ email });
  }

  return null;
};

// Fetch all attendance records
export const getAttendance = async (req, res) => {
  try {
    const userRole = req.user?.role;
    let query = {};

    if (userRole === "employee") {
      // Fix: use $or to match by userId OR email — handles both linked and unlinked accounts
      const employee = await Employee.findOne({
        $or: [{ userId: req.user?.id }, { email: req.user?.email }]
      });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }
      query.employeeId = employee._id;
    } else if (!["admin", "hr", "hr-manager"].includes(userRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const records = await Attendance.find(query).populate("employeeId", "name department employeeId email userId");
    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    if (!req.user?.id && !req.user?.email) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Fix: use $or to match by userId OR email
    const employee = await Employee.findOne({
      $or: [{ userId: req.user?.id }, { email: req.user?.email }]
    });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (existing) {
      return res.status(400).json({ success: false, message: "You have already checked in today." });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Fix: detect Late check-in — if after 09:30 AM, mark as 'Late' instead of 'Present'
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? 'Late' : 'Present';

    const newRecord = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: timeString,
      status
    });

    res.status(201).json({ success: true, message: "Checked in successfully", record: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check in", error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    if (!req.user?.id && !req.user?.email) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Fix: use $or to match by userId OR email
    const employee = await Employee.findOne({
      $or: [{ userId: req.user?.id }, { email: req.user?.email }]
    });
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

export const regularizeAttendance = async (req, res) => {
  try {
    const { date, reason, checkIn, checkOut } = req.body;
    if (!req.user?.id && !req.user?.email) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Fix: use $or to match by userId OR email
    const employee = await Employee.findOne({
      $or: [{ userId: req.user?.id }, { email: req.user?.email }]
    });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found." });

    let record = await Attendance.findOne({ employeeId: employee._id, date });
    if (!record) {
      record = new Attendance({
        employeeId: employee._id,
        date,
        status: 'Pending'
      });
    }

    if (checkIn) record.checkIn = checkIn;
    if (checkOut) record.checkOut = checkOut;
    if (reason) record.reason = reason;
    record.status = "Pending"; // Needs HR approval
    // In a real system, we might add a notes field or separate Regularization Request collection
    // For now, updating the record to Pending state.

    await record.save();

    res.status(200).json({ success: true, message: "Regularization request submitted", record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit request", error: error.message });
  }
};

export const updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const userRole = req.user?.role;
    if (!["admin", "hr", "hr-manager"].includes(userRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Fix: validate that status is one of the allowed values
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`
      });
    }

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    record.status = status;
    await record.save();

    res.status(200).json({ success: true, message: "Status updated successfully", record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
  }
};
