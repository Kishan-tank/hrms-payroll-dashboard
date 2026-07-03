import express from "express";
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  getMe,
  updateEmployee,
  deleteEmployee,
  bulkDeactivate,
  bulkChangeDepartment
} from "../controllers/employeeController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All employee routes require authentication
router.use(verifyToken);

router.post("/", requireRole("admin", "hr", "hr-manager"), addEmployee);
router.post("/bulk-deactivate", requireRole("admin", "hr", "hr-manager"), bulkDeactivate);
router.post("/bulk-department", requireRole("admin", "hr", "hr-manager"), bulkChangeDepartment);
router.get("/me", getMe);
router.get("/", requireRole("admin", "hr", "hr-manager"), getAllEmployees);
router.get("/:id", requireRole("admin", "hr", "hr-manager"), getEmployeeById);
router.put("/:id", requireRole("admin", "hr", "hr-manager"), updateEmployee);
router.delete("/:id", requireRole("admin", "hr", "hr-manager"), deleteEmployee);

export default router;
