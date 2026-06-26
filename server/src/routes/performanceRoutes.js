import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    getPerformanceReviews,
    createPerformanceReview,
} from "../controllers/performanceController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Goals routes (Employees & HR)
router.get("/goals", getGoals);
router.post("/goals", createGoal);
router.put("/goals/:id", updateGoal);
router.delete("/goals/:id", deleteGoal);

// Tasks routes (Employees & HR)
router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTaskStatus);
router.delete("/tasks/:id", deleteTask);

// Performance Review routes
router.get("/reviews", getPerformanceReviews);
// Only HR / Managers can submit official performance review scores
router.post("/reviews", requireRole("hr-manager"), createPerformanceReview);

export default router;