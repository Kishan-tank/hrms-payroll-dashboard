import express from "express";
import {
  createUser,
  updateUserRole,
  deleteUser,
  getUsers,
} from "../controllers/userController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Guard all user management routes with admin-only permission
router.use(verifyToken, requireRole("admin"));

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
