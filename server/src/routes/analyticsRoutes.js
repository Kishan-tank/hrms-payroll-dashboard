import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
  getAttendanceHeatmap,
  getAttritionRisk,
  getLeaveApprovalTrend,
  getPayrollDistribution
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(verifyToken); // Requires login

// Only HR/Admin can access analytics
router.get("/attendance-heatmap", requireRole("hr", "admin", "hr-manager"), getAttendanceHeatmap);
router.get("/attrition-risk", requireRole("hr", "admin", "hr-manager"), getAttritionRisk);
router.get("/leave-approval-trend", requireRole("hr", "admin", "hr-manager"), getLeaveApprovalTrend);
router.get("/payroll-distribution", requireRole("hr", "admin", "hr-manager"), getPayrollDistribution);

export default router;
