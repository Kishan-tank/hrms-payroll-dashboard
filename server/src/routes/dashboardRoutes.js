import express from "express";
import { getHrSummary, getRecentActivity } from "../controllers/dashboardController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/hr-summary", requireRole("admin", "hr"), getHrSummary);
router.get("/recent-activity", requireRole("admin", "hr"), getRecentActivity);

export default router;
