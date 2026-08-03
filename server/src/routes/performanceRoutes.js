import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
    getGoals,
    createGoal,
    updateGoalProgress,
    updateGoal,
    deleteGoal,
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    getPerformanceReviews,
    createPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,
} from "../controllers/performanceController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Goals routes (Employees & HR)
router.get("/goals", getGoals);
router.post("/goals", createGoal);
router.patch("/goals/:id/progress", updateGoalProgress);
router.put("/goals/:id", updateGoal);
router.delete("/goals/:id", deleteGoal);

// Tasks routes (Employees & HR)
router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTaskStatus);
router.delete("/tasks/:id", deleteTask);

// Performance Review routes (Admin & HR Manager)
router.get("/reviews", getPerformanceReviews);
router.post("/reviews", requireRole("admin", "hr-manager"), createPerformanceReview);
router.put("/reviews/:id", requireRole("admin", "hr-manager"), updatePerformanceReview);
router.delete("/reviews/:id", requireRole("admin", "hr-manager"), deletePerformanceReview);

export default router;