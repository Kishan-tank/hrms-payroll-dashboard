import mongoose from "mongoose";
import Task from "../models/Task.js";
import Employee from "../models/employee.js";

// Get tasks (filtered by employee for 'employee' role, or all for HR/Admin)
export const getTasks = async (req, res) => {
  try {
    let userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "hr") userRole = "hr-manager";
    let query = {};

    if (userRole === "employee") {
      const userId = req.user?._id || req.user?.id;
      const employee = await Employee.findOne({ userId });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }
      query.employeeId = employee._id;
    }

    const tasks = await Task.find(query).populate("employeeId", "name department role").sort({ createdAt: -1 });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks.", error: error.message });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    let { employeeId, title, priority, status } = req.body;

    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "employee") {
      const userId = req.user?._id || req.user?.id;
      const employee = await Employee.findOne({ userId });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }
      employeeId = employee._id;
    }

    if (!employeeId || !title) {
      return res.status(400).json({ success: false, message: "Title and Employee ID are required." });
    }

    const newTask = await Task.create({
      employeeId,
      title,
      priority: priority || "Medium",
      status: status || "Pending"
    });

    const populatedTask = await Task.findById(newTask._id).populate("employeeId", "name department role");

    res.status(201).json({ success: true, message: "Task created successfully.", task: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create task.", error: error.message });
  }
};

// Update a task (status, priority, title)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID format." });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    // Verify employee ownership if role is employee
    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "employee") {
      const userId = req.user?._id || req.user?.id;
      const employee = await Employee.findOne({ userId });
      if (!employee || task.employeeId.toString() !== employee._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to update this task." });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, status, priority },
      { new: true, runValidators: true }
    ).populate("employeeId", "name department role");

    res.status(200).json({ success: true, message: "Task updated successfully.", task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update task.", error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID format." });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "employee") {
      const userId = req.user?._id || req.user?.id;
      const employee = await Employee.findOne({ userId });
      if (!employee || task.employeeId.toString() !== employee._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete this task." });
      }
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete task.", error: error.message });
  }
};
