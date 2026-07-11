import express from "express";
import { getAttendance, checkIn, checkOut, regularizeAttendance, updateAttendanceStatus, deactivateAttendance } from "../controllers/attendanceController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// This protects all routes below it so only logged-in users can access them
router.use(verifyToken);

router.get("/", getAttendance);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.post("/regularize", regularizeAttendance);
router.put("/:id/status", updateAttendanceStatus);
// Defence-in-depth: role checked at route level AND inside controller
// — matches the same pattern as DELETE /api/payroll/:id
router.delete("/:id", requireRole("admin", "hr", "hr-manager"), deactivateAttendance);

export default router;
