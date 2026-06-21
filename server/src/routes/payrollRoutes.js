import express from "express";
import { runPayroll, getPayrollRecords, getPayrollSummary } from "../controllers/payrollController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/run", requireRole("admin", "hr"), runPayroll);
router.get("/", requireRole("admin", "hr"), getPayrollRecords);
router.get("/summary", requireRole("admin", "hr"), getPayrollSummary);

export default router;
