import LeavePolicy from "../models/leavePolicy.js";
import { notifyChange } from "../utils/mailer.js";


// POST /api/leave-policies — Admin creates a leave policy
export const createLeavePolicy = async (req, res) => {
  try {
    // Controller-level role enforcement (Admin only)
    const userRole = req.user?.role ? String(req.user.role).toLowerCase() : "";
    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only administrators can create leave policies",
      });
    }

    const {
      name,
      leaveType,
      daysAllotted,
      department,
      applicableRoles,
      allowCarryForward,
      maxCarryForwardDays,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Policy name is required",
      });
    }

    if (!leaveType) {
      return res.status(400).json({
        success: false,
        message: "Leave type is required",
      });
    }

    const validLeaveTypes = [
      "Casual Leave",
      "Sick Leave",
      "Earned Leave",
      "Work From Home",
      "Optional Holiday",
    ];

    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid leave type. Must be one of: ${validLeaveTypes.join(", ")}`,
      });
    }

    const daysNum = parseInt(daysAllotted, 10);
    if (isNaN(daysNum) || daysNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Days allotted per year must be a positive number",
      });
    }

    const carryForwardAllowed = Boolean(allowCarryForward);
    const maxCarry = carryForwardAllowed ? parseInt(maxCarryForwardDays || 0, 10) : 0;

    const policy = await LeavePolicy.create({
      name: name.trim(),
      leaveType,
      daysAllotted: daysNum,
      department: department || "All",
      applicableRoles: Array.isArray(applicableRoles) && applicableRoles.length > 0
        ? applicableRoles
        : ["employee", "hr-manager"],
      allowCarryForward: carryForwardAllowed,
      maxCarryForwardDays: maxCarry,
      isActive: true,
      createdBy: req.user.id,
    });

    notifyChange({
      user: { name: "All Organization Members", email: process.env.ADMIN_EMAIL },
      action: "LEAVE_POLICY_MUTATION",
      details: { policyName: policy.name, leaveType: policy.leaveType, daysAllotted: policy.daysAllotted, actionType: "Created" },
      actor: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Leave policy created successfully",
      policy,
    });

  } catch (error) {
    console.error("createLeavePolicy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create leave policy",
      error: error.message,
    });
  }
};

// GET /api/leave-policies — List all active leave policies
export const getLeavePolicies = async (req, res) => {
  try {
    const policies = await LeavePolicy.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      policies,
    });
  } catch (error) {
    console.error("getLeavePolicies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave policies",
      error: error.message,
    });
  }
};
