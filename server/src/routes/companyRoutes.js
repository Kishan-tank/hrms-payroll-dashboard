import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
    getEvents,
    createEvent,
    deleteEvent,
    getSkills,
    createSkill,
    endorseSkill,
    deleteSkill,
} from "../controllers/companyController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Events routes
router.get("/events", getEvents);
// Only HR managers can add/delete official company events
router.post("/events", requireRole("hr-manager"), createEvent);
router.delete("/events/:id", requireRole("hr-manager"), deleteEvent);

// Talent & Skills Matrix routes
router.get("/skills", getSkills);
router.post("/skills", createSkill);
router.post("/skills/:id/endorse", endorseSkill);
router.delete("/skills/:id", deleteSkill);

export default router;