import express from "express";
import { getHrSummary, getRecentActivity, getEmployeeSummary } from "../controllers/dashboardController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/hr-summary", requireRole("admin", "hr-manager"), getHrSummary);
router.get("/recent-activity", requireRole("admin", "hr-manager"), getRecentActivity);
router.get("/employee-summary", requireRole("employee", "admin", "hr-manager"), getEmployeeSummary);

export default router;
