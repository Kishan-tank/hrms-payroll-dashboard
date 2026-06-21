import express from "express";
import { getAttendance } from "../controllers/attendanceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// This protects all routes below it so only logged-in users can access them
router.use(verifyToken); 

router.get("/", getAttendance);

export default router;
