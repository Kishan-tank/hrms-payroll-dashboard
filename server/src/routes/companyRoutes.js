import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getSkills,
    createSkill,
    endorseSkill,
    deleteSkill,
} from "../controllers/companyController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Events routes (Admin & HR Manager)
router.get("/events", getEvents);
router.post("/events", requireRole("admin", "hr-manager"), createEvent);
router.put("/events/:id", requireRole("admin", "hr-manager"), updateEvent);
router.delete("/events/:id", requireRole("admin", "hr-manager"), deleteEvent);

// Talent & Skills Matrix routes
router.get("/skills", getSkills);
router.post("/skills", createSkill);
router.post("/skills/:id/endorse", endorseSkill);
router.delete("/skills/:id", deleteSkill);

export default router;