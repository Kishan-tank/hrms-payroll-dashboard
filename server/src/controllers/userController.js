import bcrypt from "bcrypt";
import User from "../models/user.js";
import Employee from "../models/employee.js";
import { sendEmail, notifyChange } from "../utils/mailer.js";
import {
  renderAccountCreatedEmail,
  renderAccountVerificationEmail,
} from "../templates/emailTemplate.js";

const normaliseRole = (rawRole) => {
  if (!rawRole) return "employee";
  const r = String(rawRole).toLowerCase().replace(/\s+/g, "-");
  if (r === "admin") return "admin";
  if (r.includes("hr")) return "hr-manager";
  return "employee";
};

// POST /api/users — Admin creates user
export const createUser = async (req, res) => {
  try {
    const { name, email, role, password, department, designation } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalisedRole = normaliseRole(role);
    if (normalisedRole === "admin") {
      return res.status(400).json({
        success: false,
        message: "Creating admin accounts via API is not allowed",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    let initialPassword = password;
    let isTempPassword = false;

    if (!initialPassword || initialPassword.trim().length < 6) {
      initialPassword = Math.random().toString(36).slice(-8) + "1!";
      isTempPassword = true;
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Generate 6-digit verification OTP (15 min expiry)
    const verifyOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyOtpHash = await bcrypt.hash(verifyOtpCode, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: normalisedRole,
      department: department || "General",
      designation: designation || "Staff",
      isActive: true,
      isVerified: false,
      verifyOtpHash,
      verifyOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      verifyOtpLastSentAt: new Date(),
    });

    // Create linked Employee profile
    await Employee.create({
      employeeId: `EMP-${Date.now()}`,
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation,
      role: user.role,
      status: "Active",
      joinDate: new Date(),
      basicPay: 50000,
      userId: user._id,
      isActive: true,
    });

    // Print dev verify OTP in terminal
    console.log(`\n==================================================`);
    console.log(`🔑 [DEV VERIFY OTP] Account Verification Code for ${user.email}: ${verifyOtpCode}`);
    console.log(`==================================================\n`);

    // Fire-and-forget account verification email notification
    sendEmail({
      to: user.email,
      subject: "HRMSPro: Verify your account",
      html: renderAccountVerificationEmail(verifyOtpCode, 15),
    }).catch((err) => console.error("[Mailer] Account verification notification error:", err));

    // Fire-and-forget welcome account email notification
    sendEmail({
      to: user.email,
      subject: "Welcome to HRMSPro - Account Created",
      html: renderAccountCreatedEmail({
        name: user.name,
        email: user.email,
        tempPassword: isTempPassword || password ? initialPassword : null,
      }),
    }).catch((err) => console.error("[Mailer] Account creation notification error:", err));

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verifyOtpHash;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
      tempPassword: isTempPassword || password ? initialPassword : null,
    });
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// PATCH /api/users/:id/role — Promote/demote role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const newRole = normaliseRole(role);
    if (newRole === "admin") {
      return res.status(400).json({
        success: false,
        message: "Promoting a user to admin is not permitted",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify the admin account role",
      });
    }

    if (req.user && req.user.id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    // Sync role to Employee document
    await Employee.updateOne(
      { $or: [{ userId: user._id }, { email: user.email }] },
      { $set: { role: newRole } }
    );

    // Fire-and-forget dual audit notification emails (to user AND admin email)
    notifyChange({
      user,
      action: "ROLE_UPDATE",
      details: { oldRole, newRole },
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// DELETE /api/users/:id — Soft delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the admin account",
      });
    }

    if (req.user && req.user.id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own admin account",
      });
    }

    user.isActive = false;
    await user.save();

    // Soft delete linked Employee
    await Employee.updateOne(
      { $or: [{ userId: user._id }, { email: user.email }] },
      { $set: { status: "Inactive", isActive: false, deletedAt: new Date() } }
    );

    // Fire-and-forget dual audit notification emails (to user AND admin email)
    notifyChange({
      user,
      action: "ACCOUNT_DEACTIVATE",
      details: {},
    });

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// GET /api/users — List active users
export const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const query = { isActive: { $ne: false } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      const normRole = normaliseRole(role);
      query.role = normRole;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
