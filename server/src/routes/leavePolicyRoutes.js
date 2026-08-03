import express from "express";
import {
  createLeavePolicy,
  getLeavePolicies,
} from "../controllers/leavePolicyController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getLeavePolicies);

// Route-level enforcement: strictly ADMIN ONLY
router.post("/", requireRole("admin"), createLeavePolicy);

export default router;
