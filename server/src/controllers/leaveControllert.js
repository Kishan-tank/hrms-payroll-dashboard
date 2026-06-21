import Leave from "../models/leave.js";

// Get all leave requests
export const getLeaves = async (req, res) => {
  try {
    // Populate replaces the employeeId with actual employee details (name, dept)
    const leaves = await Leave.find().populate("employeeId", "name department");
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Employee applies for a new leave
export const applyLeave = async (req, res) => {
  try {
    const newLeave = await Leave.create(req.body);
    res.status(201).json({ success: true, leave: newLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




