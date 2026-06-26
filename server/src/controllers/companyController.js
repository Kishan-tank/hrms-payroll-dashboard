import Event from "../models/Event.js";
import Skill from "../models/Skill.js";
import Employee from "../models/employee.js";

// Helper to get Employee ID from logged-in user email
const getEmployeeId = async (user, providedEmpId) => {
    if (providedEmpId && user.role === "hr-manager") {
        return providedEmpId;
    }
    const employee = await Employee.findOne({ email: user.email });
    if (!employee) {
        throw new Error("Employee profile not found for the logged-in user.");
    }
    return employee._id;
};

// =================== COMPANY EVENTS ===================

export const getEvents = async (req, res) => {
    try {
        // Return all upcoming company events sorted by date
        const events = await Event.find().sort({ date: 1 });
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { title, date, type } = req.body;
        if (!title || !date) {
            return res.status(400).json({ success: false, message: "Title and date are required." });
        }

        const event = new Event({
            title,
            date: new Date(date),
            type: type || "Holiday",
        });

        await event.save();
        res.status(201).json({ success: true, event, message: "Event created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: "Event not found" });
        res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =================== TALENT & SKILLS MATRIX ===================

export const getSkills = async (req, res) => {
    try {
        const { department } = req.query;
        let filter = {};

        // Populate employee details to show who owns the skill
        const skills = await Skill.find(filter)
            .populate("employeeId", "name department role")
            .sort({ endorsements: -1, proficiency: -1 });

        if (department && department !== "All") {
            const filteredSkills = skills.filter(
                (s) => s.employeeId && s.employeeId.department === department
            );
            return res.status(200).json({ success: true, skills: filteredSkills });
        }

        res.status(200).json({ success: true, skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createSkill = async (req, res) => {
    try {
        const { name, proficiency } = req.body;
        const employeeId = await getEmployeeId(req.user, req.body.employeeId);

        if (!name || !proficiency) {
            return res.status(400).json({ success: false, message: "Skill name and proficiency are required." });
        }

        const skill = new Skill({
            employeeId,
            name,
            proficiency,
            endorsements: 0,
        });

        await skill.save();
        await skill.populate("employeeId", "name department role");
        res.status(201).json({ success: true, skill, message: "Skill added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const endorseSkill = async (req, res) => {
    try {
        // Increment endorsement count by 1
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            { $inc: { endorsements: 1 } },
            { new: true }
        ).populate("employeeId", "name department role");

        if (!skill) return res.status(404).json({ success: false, message: "Skill not found" });
        res.status(200).json({ success: true, skill, message: "Skill endorsed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) return res.status(404).json({ success: false, message: "Skill not found" });
        res.status(200).json({ success: true, message: "Skill deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};