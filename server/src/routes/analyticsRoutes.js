import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
  getAnalyticsOverview,
  getAttendanceHeatmap,
  getAttritionRisk,
  getLeaveApprovalTrend,
  getPayrollDistribution
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(verifyToken);

// Access guard: Admin + HR + HR-Manager
router.get("/overview", requireRole("hr", "admin", "hr-manager"), getAnalyticsOverview);
router.get("/attendance-heatmap", requireRole("hr", "admin", "hr-manager"), getAttendanceHeatmap);
router.get("/attrition-risk", requireRole("hr", "admin", "hr-manager"), getAttritionRisk);
router.get("/leave-approval-trend", requireRole("hr", "admin", "hr-manager"), getLeaveApprovalTrend);
router.get("/payroll-distribution", requireRole("hr", "admin", "hr-manager"), getPayrollDistribution);

export default router;
