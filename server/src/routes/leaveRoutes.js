import express from "express";
import { getLeaves, applyLeave } from "../controllers/leaveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getLeaves);
router.post("/", applyLeave);

export default router;
