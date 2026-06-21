import express from "express";
import { askAI } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.post("/ask", askAI);

export default router;
