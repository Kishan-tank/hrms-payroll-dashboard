import express from "express";
import { getLeaves, applyLeave, updateLeaveStatus } from "../controllers/leaveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getLeaves);
router.post("/", applyLeave);
router.put("/:id/status", updateLeaveStatus);

export default router;
