import express from "express";
import { askAI, getAIInsights } from "../controllers/aiController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(verifyToken);
router.post("/ask", askAI);
router.post("/insights", requireRole("admin", "hr"), getAIInsights);
export default router;