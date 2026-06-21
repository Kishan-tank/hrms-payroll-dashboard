import Leave from "../models/leave.js";

// Get all leave requests
export const getLeaves = async (req, res) => {
  try {
    // Populate replaces the employeeId with actual employee details (name, dept)
    const leaves = await Leave.find().populate("employeeId", "name department");
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch leaves.", error: error.message });
  }
};

// Employee applies for a new leave
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, type, fromDate, toDate, days } = req.body;

    // Validation (Jyoti's QA Task #10)
    if (!employeeId || !type || !fromDate || !toDate || !days) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields. Please provide employeeId, type, fromDate, toDate, and days." 
      });
    }

    if (days <= 0) {
      return res.status(400).json({ success: false, message: "Leave days must be greater than zero." });
    }

    const newLeave = await Leave.create(req.body);
    res.status(201).json({ success: true, message: "Leave applied successfully.", leave: newLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to apply leave.", error: error.message });
  }
};




