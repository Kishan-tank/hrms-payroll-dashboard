import express from "express";
import { runPayroll, getPayrollRecords, getPayrollSummary, voidPayrollRecord, editPayrollRecord } from "../controllers/payrollController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/run", requireRole("admin", "hr"), runPayroll);
router.get("/", requireRole("admin", "hr", "hr-manager", "employee"), getPayrollRecords);
router.get("/summary", requireRole("admin", "hr"), getPayrollSummary);
// HR/Admin only: soft-delete (void) a payroll record — blocked for Paid records
router.delete("/:id", requireRole("admin", "hr", "hr-manager"), voidPayrollRecord);
// Admin-only: edit a payroll record's fields
router.patch("/:id", requireRole("admin"), editPayrollRecord);

export default router;
