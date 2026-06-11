import express from "express";
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All employee routes require authentication
router.use(verifyToken);

router.post("/", requireRole("admin", "hr"), addEmployee);
router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", requireRole("admin", "hr"), updateEmployee);
router.delete("/:id", requireRole("admin", "hr"), deleteEmployee);

export default router;
