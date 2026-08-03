import express from "express";
import {
  getAttendance,
  checkIn,
  checkOut,
  regularizeAttendance,
  updateAttendanceStatus,
  editAttendanceRecord,
  deactivateAttendance,
} from "../controllers/attendanceController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes with authentication
router.use(verifyToken);

router.get("/", getAttendance);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.post("/regularize", regularizeAttendance);
router.put("/:id/status", updateAttendanceStatus);

// Admin-only record correction and soft deletion
router.patch("/:id", requireRole("admin"), editAttendanceRecord);
router.delete("/:id", requireRole("admin"), deactivateAttendance);

export default router;

