import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import PerformanceReview from "../models/PerformanceReview.js";
import Employee from "../models/employee.js";
import { notifyChange } from "../utils/mailer.js";

// Helper to get Employee ID from logged-in user email
const getEmployeeId = async (user, providedEmpId) => {
    const role = user.role ? String(user.role).toLowerCase() : "";
    if (providedEmpId && (role === "admin" || role.includes("hr"))) {
        return providedEmpId;
    }
    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
        if (role === "admin") return null;
        throw new Error("Employee profile not found for the logged-in user.");
    }
    return employee._id;
};

// Check if user is owner of goal or admin/hr
const canModifyGoal = async (user, goalEmployeeId) => {
    const role = user.role ? String(user.role).toLowerCase() : "";
    if (role === "admin" || role.includes("hr")) return true;
    const employee = await Employee.findOne({ email: user.email });
    if (!employee) return false;
    return String(employee._id) === String(goalEmployeeId);
};

// Goal status computation helper
const computeGoalStatus = (progress, dueDate, explicitStatus) => {
    const prog = Math.min(100, Math.max(0, Number(progress) || 0));
    if (prog >= 100) return "Completed";
    if (explicitStatus && ["Not Started", "In Progress", "Completed", "Missed"].includes(explicitStatus)) {
        return explicitStatus;
    }
    if (dueDate && new Date(dueDate) < new Date() && prog < 100) return "Missed";
    if (prog > 0) return "In Progress";
    return "Not Started";
};


// =================== GOALS ===================

export const getGoals = async (req, res) => {
    try {
        const role = req.user.role ? String(req.user.role).toLowerCase() : "";
        let query = {};

        if (req.query.employeeId) {
            query.employeeId = req.query.employeeId;
        } else if (!(role === "admin" || role.includes("hr"))) {
            const empId = await getEmployeeId(req.user);
            query.employeeId = empId;
        }

        const goals = await Goal.find(query)
            .populate("employeeId", "name email department role")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, goals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createGoal = async (req, res) => {
    try {
        const { title, description, dueDate, progress, status } = req.body;
        const employeeId = await getEmployeeId(req.user, req.body.employeeId);

        const prog = Math.min(100, Math.max(0, Number(progress) || 0));
        const calculatedStatus = computeGoalStatus(prog, dueDate, status);

        const goal = new Goal({
            employeeId,
            title,
            description: description || "",
            progress: prog,
            status: calculatedStatus,
            dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        await goal.save();
        await goal.populate("employeeId", "name email department role");

        const emp = await Employee.findById(employeeId);
        notifyChange({
            user: emp || { name: "Employee" },
            action: "GOAL_MUTATION",
            details: { title, actionType: "Created", progress: prog, status: calculatedStatus, dueDate: dueDate || "No due date" },
            actor: req.user,
        });

        res.status(201).json({ success: true, goal, message: "Goal created successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGoalProgress = async (req, res) => {
    try {
        const { progress } = req.body;
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

        const isAllowed = await canModifyGoal(req.user, goal.employeeId);
        if (!isAllowed) {
            return res.status(403).json({ success: false, message: "Access denied. Only the goal owner or HR/Admin can update progress." });
        }

        const newProgress = Math.min(100, Math.max(0, Number(progress) || 0));
        goal.progress = newProgress;
        goal.status = computeGoalStatus(newProgress, goal.dueDate, goal.status);
        await goal.save();
        await goal.populate("employeeId", "name email department role");

        const emp = await Employee.findById(goal.employeeId);
        notifyChange({
            user: emp || { name: "Employee" },
            action: "GOAL_MUTATION",
            details: { title: goal.title, actionType: "Progress Updated", progress: goal.progress, status: goal.status },
            actor: req.user,
        });

        res.status(200).json({ success: true, goal, message: "Progress updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

        const isAllowed = await canModifyGoal(req.user, goal.employeeId);
        if (!isAllowed) {
            return res.status(403).json({ success: false, message: "Access denied. Only the goal owner or HR/Admin can edit this goal." });
        }

        const { title, description, dueDate, progress, status } = req.body;
        if (title !== undefined) goal.title = title;
        if (description !== undefined) goal.description = description;
        if (dueDate !== undefined) goal.dueDate = dueDate ? new Date(dueDate) : undefined;
        if (progress !== undefined) goal.progress = Math.min(100, Math.max(0, Number(progress) || 0));

        goal.status = computeGoalStatus(goal.progress, goal.dueDate, status || goal.status);

        await goal.save();
        await goal.populate("employeeId", "name email department role");

        const emp = await Employee.findById(goal.employeeId);
        notifyChange({
            user: emp || { name: "Employee" },
            action: "GOAL_MUTATION",
            details: { title: goal.title, actionType: "Updated", progress: goal.progress, status: goal.status },
            actor: req.user,
        });

        res.status(200).json({ success: true, goal, message: "Goal updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

        const isAllowed = await canModifyGoal(req.user, goal.employeeId);
        if (!isAllowed) {
            return res.status(403).json({ success: false, message: "Access denied. Only the goal owner or HR/Admin can delete this goal." });
        }

        await Goal.findByIdAndDelete(req.params.id);

        const emp = await Employee.findById(goal.employeeId);
        notifyChange({
            user: emp || { name: "Employee" },
            action: "GOAL_MUTATION",
            details: { title: goal.title, actionType: "Deleted" },
            actor: req.user,
        });

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
        const emp = await Employee.findById(employeeId);
        notifyChange({
            user: emp || { name: "Employee" },
            action: "TASK_MUTATION",
            details: { title, actionType: "Created", priority, status },
            actor: req.user,
        });
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

// Check if user is admin or hr manager
const canManageReviews = (user) => {
    const role = user.role ? String(user.role).toLowerCase() : "";
    return role === "admin" || role.includes("hr");
};

// =================== PERFORMANCE REVIEWS ===================

export const getPerformanceReviews = async (req, res) => {
    try {
        const role = req.user.role ? String(req.user.role).toLowerCase() : "";
        let query = {};

        if (req.query.employeeId) {
            query.employeeId = req.query.employeeId;
        } else if (!(role === "admin" || role.includes("hr"))) {
            const empId = await getEmployeeId(req.user);
            query.employeeId = empId;
        }

        const reviews = await PerformanceReview.find(query)
            .populate("employeeId", "name department role email")
            .populate("reviewerId", "name department role")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPerformanceReview = async (req, res) => {
    try {
        if (!canManageReviews(req.user)) {
            return res.status(403).json({ success: false, message: "Access denied. Only HR Manager or Admin can manage performance reviews." });
        }
        const { employeeId, score, reviewPeriod, managerFeedback, status } = req.body;
        if (!employeeId || !score || !reviewPeriod) {
            return res.status(400).json({ success: false, message: "Employee ID, score, and review period are required." });
        }

        let reviewerId = null;
        try {
            const reviewer = await Employee.findOne({ email: req.user.email });
            if (reviewer) reviewerId = reviewer._id;
        } catch (_) {}

        const review = new PerformanceReview({
            employeeId,
            reviewerId,
            score,
            reviewPeriod,
            managerFeedback: managerFeedback || "",
            status: status || "Submitted",
        });

        await review.save();
        await review.populate("employeeId", "name email department role");
        await review.populate("reviewerId", "name department role");

        notifyChange({
            user: review.employeeId || { name: "Employee" },
            action: "PERFORMANCE_REVIEW_CREATED",
            details: { reviewPeriod, score, managerFeedback, actionType: "Created" },
            actor: req.user,
        });

        res.status(201).json({ success: true, review, message: "Performance review submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePerformanceReview = async (req, res) => {
    try {
        if (!canManageReviews(req.user)) {
            return res.status(403).json({ success: false, message: "Access denied. Only HR Manager or Admin can manage performance reviews." });
        }
        const { score, reviewPeriod, managerFeedback, status } = req.body;
        const review = await PerformanceReview.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Performance review not found" });

        if (score !== undefined) review.score = score;
        if (reviewPeriod !== undefined) review.reviewPeriod = reviewPeriod;
        if (managerFeedback !== undefined) review.managerFeedback = managerFeedback;
        if (status !== undefined) review.status = status;

        await review.save();
        await review.populate("employeeId", "name email department role");
        await review.populate("reviewerId", "name department role");

        notifyChange({
            user: review.employeeId || { name: "Employee" },
            action: "PERFORMANCE_REVIEW_CREATED",
            details: { reviewPeriod: review.reviewPeriod, score: review.score, managerFeedback: review.managerFeedback, actionType: "Updated" },
            actor: req.user,
        });

        res.status(200).json({ success: true, review, message: "Performance review updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePerformanceReview = async (req, res) => {
    try {
        if (!canManageReviews(req.user)) {
            return res.status(403).json({ success: false, message: "Access denied. Only HR Manager or Admin can manage performance reviews." });
        }
        const review = await PerformanceReview.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Performance review not found" });

        const emp = await Employee.findById(review.employeeId);
        notifyChange({
            user: emp || { name: "Employee" },
            action: "PERFORMANCE_REVIEW_CREATED",
            details: { reviewPeriod: review.reviewPeriod, actionType: "Deleted" },
            actor: req.user,
        });

        res.status(200).json({ success: true, message: "Performance review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};