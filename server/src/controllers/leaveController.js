import Leave from "../models/leave.js";
import Employee from "../models/employee.js";

// Get all leave requests
export const getLeaves = async (req, res) => {
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

    const leaves = await Leave.find(query).populate("employeeId", "name department");
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch leaves.", error: error.message });
  }
};

// Employee applies for a new leave
export const applyLeave = async (req, res) => {
  try {
    let { employeeId, type, fromDate, toDate, days, reason } = req.body;

    // Auto-resolve employeeId for employees to prevent spoofing
    if (req.user?.role === "employee") {
      const userId = req.user?._id || req.user?.id;
      const employee = await Employee.findOne({ userId });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }
      employeeId = employee._id;
    }

    // Validation
    if (!employeeId || !type || !fromDate || !toDate || !days) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields. Please provide type, fromDate, toDate, and days." 
      });
    }

    if (days <= 0) {
      return res.status(400).json({ success: false, message: "Leave days must be greater than zero." });
    }

    const newLeave = await Leave.create({ employeeId, type, fromDate, toDate, days, reason, status: 'Pending' });
    res.status(201).json({ success: true, message: "Leave applied successfully.", leave: newLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to apply leave.", error: error.message });
  }
};

// Update leave status (HR/Admin only)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully.`, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update leave status.", error: error.message });
  }
};
