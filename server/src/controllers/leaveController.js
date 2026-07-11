import Leave from "../models/leave.js";
import Employee from "../models/employee.js";

// Get all leave requests
export const getLeaves = async (req, res) => {
  try {
    const userRole = req.user?.role;
    let query = { isActive: { $ne: false } };

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
    let { employeeId, type, fromDate, toDate, reason } = req.body;

    // Auto-resolve employeeId for all roles to prevent spoofing
    const userId = req.user?._id || req.user?.id;
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }
    employeeId = employee._id;

    // Validation: required fields (days no longer required from client)
    if (!employeeId || !type || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide type, fromDate, and toDate."
      });
    }

    // Fix: validate that fromDate <= toDate
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format for fromDate or toDate." });
    }
    if (from > to) {
      return res.status(400).json({ success: false, message: "fromDate must be before or equal to toDate." });
    }

    // Fix: compute days server-side — do not trust client-supplied 'days'
    const computedDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    if (computedDays <= 0) {
      return res.status(400).json({ success: false, message: "Leave days must be greater than zero." });
    }

    const newLeave = await Leave.create({
      employeeId,
      type,
      fromDate,
      toDate,
      days: computedDays,
      reason,
      status: 'Pending'
    });
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

    // Fetch existing leave first to check current state
    const existingLeave = await Leave.findById(id);
    if (!existingLeave) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    // Fix: prevent reverting an already-decided leave back to Pending
    if (status === "Pending" && ["Approved", "Rejected"].includes(existingLeave.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot revert status back to Pending. Current status is '${existingLeave.status}'.`
      });
    }

    existingLeave.status = status;
    await existingLeave.save();

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully.`, leave: existingLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update leave status.", error: error.message });
  }
};

// Cancel a pending leave (employee can cancel their own pending leaves only)
export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    // Resolve the requesting employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found." });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    // Fix: verify ownership — only the employee who applied can cancel
    if (leave.employeeId.toString() !== employee._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only cancel your own leave requests." });
    }

    // Fix: only allow cancellation of Pending leaves
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave that is already '${leave.status}'. Only Pending leaves can be cancelled.`
      });
    }

    // Soft-cancel: status = Cancelled, isActive stays true so the record
    // remains visible in leave history and reports. isActive: false is
    // reserved for actual record deletion, not cancellation.
    leave.status = "Cancelled";
    await leave.save();
    res.status(200).json({ success: true, message: "Leave request cancelled successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel leave.", error: error.message });
  }
};
