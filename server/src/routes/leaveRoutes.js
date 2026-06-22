import express from "express";
import { getLeaves, applyLeave, updateLeaveStatus } from "../controllers/leaveController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getLeaves);
router.post("/", applyLeave);

// Only allow HR or admin to update status
router.put("/:id/status", requireRole("hr", "hr-manager", "admin"), updateLeaveStatus);

export default router;
