import express from "express";
import {
  getHeadcountTrend,
  getPayrollTrend,
  getLeaveBreakdown,
  getDeptAttendance
} from "../controllers/reportsController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireRole("admin", "hr"));

router.get("/headcount", getHeadcountTrend);
router.get("/payroll-trend", getPayrollTrend);
router.get("/leave-breakdown", getLeaveBreakdown);
router.get("/dept-attendance", getDeptAttendance);

export default router;
