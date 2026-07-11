import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import PerformanceReview from "../models/PerformanceReview.js";
import Employee from "../models/employee.js";

// Helper to get Employee ID from logged-in user email
const getEmployeeId = async (user, providedEmpId) => {
    if (providedEmpId && user.role === "hr-manager") {
        return providedEmpId;
    }
    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
        throw new Error("Employee profile not found for the logged-in user.");
    }
    return employee._id;
};

// =================== GOALS ===================

export const getGoals = async (req, res) => {
    try {
        const employeeId = await getEmployeeId(req.user, req.query.employeeId);
        const goals = await Goal.find({ employeeId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createGoal = async (req, res) => {
    try {
        const { title, dueDate, progress } = req.body;
        const employeeId = await getEmployeeId(req.user, req.body.employeeId);

        const goal = new Goal({
            employeeId,
            title,
            progress: progress || 0,
            dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        await goal.save();
        res.status(201).json({ success: true, goal, message: "Goal created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGoal = async (req, res) => {
    try {
        const { progress, title } = req.body;
        const goal = await Goal.findByIdAndUpdate(
            req.params.id,
            { progress, title },
            { new: true }
        );
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
        res.status(200).json({ success: true, goal, message: "Goal updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findByIdAndDelete(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
        res.status(200).json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =================== TASKS ===================

export const getTasks = async (req, res) => {
    try {
        const employeeId = await getEmployeeId(req.user, req.query.employeeId);
        const tasks = await Task.find({ employeeId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, priority, status } = req.body;
        const employeeId = await getEmployeeId(req.user, req.body.employeeId);

        const task = new Task({
            employeeId,
            title,
            priority: priority || "Medium",
            status: status || "Pending",
        });

        await task.save();
        res.status(201).json({ success: true, task, message: "Task created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { status, priority } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status, priority },
            { new: true }
        );
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });
        res.status(200).json({ success: true, task, message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });
        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =================== PERFORMANCE REVIEWS ===================

export const getPerformanceReviews = async (req, res) => {
    try {
        if (req.user.role === "hr-manager" && !req.query.employeeId) {
            const reviews = await PerformanceReview.find()
                .populate("employeeId", "name department role")
                .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, reviews });
        }

        const employeeId = await getEmployeeId(req.user, req.query.employeeId);
        const reviews = await PerformanceReview.find({ employeeId })
            .populate("employeeId", "name department role")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPerformanceReview = async (req, res) => {
    try {
        const { employeeId, score, reviewPeriod, managerFeedback } = req.body;
        if (!employeeId || !score || !reviewPeriod) {
            return res.status(400).json({ success: false, message: "Employee ID, score, and review period are required." });
        }

        const review = new PerformanceReview({
            employeeId,
            score,
            reviewPeriod,
            managerFeedback,
        });

        await review.save();
        await review.populate("employeeId", "name department role");
        res.status(201).json({ success: true, review, message: "Performance review submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};