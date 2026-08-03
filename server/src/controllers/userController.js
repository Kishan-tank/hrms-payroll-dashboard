import bcrypt from "bcrypt";
import User from "../models/user.js";
import Employee from "../models/employee.js";
import PendingUser from "../models/pendingUser.js";
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

// Step 1: Initiate Add User (POST /api/users/initiate)
export const initiateUser = async (req, res) => {
  try {
    const { name, email, role, department, designation } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const normalisedRole = normaliseRole(role);

    if (normalisedRole === "admin") {
      return res.status(400).json({
        success: false,
        message: "Creating admin accounts via API is not allowed",
      });
    }

    // Check if email already belongs to an existing User
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email address",
      });
    }

    // Generate 6-digit OTP (15-min expiry)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Upsert PendingUser: overwrite existing pending entry if present
    let pendingUser = await PendingUser.findOne({ email: cleanEmail });
    if (pendingUser) {
      pendingUser.name = name.trim();
      pendingUser.role = normalisedRole;
      pendingUser.department = department || "General";
      pendingUser.designation = designation || "Staff";
      pendingUser.otpHash = otpHash;
      pendingUser.otpExpiresAt = otpExpiresAt;
      pendingUser.otpAttempts = 0;
      pendingUser.otpLastSentAt = new Date();
      await pendingUser.save();
    } else {
      pendingUser = await PendingUser.create({
        name: name.trim(),
        email: cleanEmail,
        role: normalisedRole,
        department: department || "General",
        designation: designation || "Staff",
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        otpLastSentAt: new Date(),
      });
    }

    console.log(`\n==================================================`);
    console.log(`🔑 [DEV PENDING USER OTP] Code for ${pendingUser.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    sendEmail({
      to: pendingUser.email,
      subject: "HRMSPro: Confirm your account",
      html: renderAccountVerificationEmail(otpCode, 15),
    }).catch((err) => console.error("[Mailer] Pending user OTP send error:", err));

    res.status(200).json({
      success: true,
      pendingId: pendingUser._id,
      email: pendingUser.email,
      message: "Verification OTP code sent to user's email",
    });
  } catch (error) {
    console.error("initiateUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate user creation",
      error: error.message,
    });
  }
};

// Step 2: Confirm OTP & Create User (POST /api/users/confirm)
export const confirmUser = async (req, res) => {
  try {
    const { pendingId, email, otp, password } = req.body;

    if ((!pendingId && !email) || !otp) {
      return res.status(400).json({
        success: false,
        message: "Pending ID/Email and verification OTP code are required",
      });
    }

    const query = pendingId ? { _id: pendingId } : { email: email.toLowerCase().trim() };
    const pendingUser = await PendingUser.findOne(query);

    if (!pendingUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    if (new Date() > new Date(pendingUser.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    if (pendingUser.otpAttempts >= 5) {
      return res.status(400).json({
        success: false,
        maxAttemptsExceeded: true,
        message: "Max attempts (5) exceeded. Please initiate a new add user request.",
      });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), pendingUser.otpHash);

    if (!isMatch) {
      pendingUser.otpAttempts = (pendingUser.otpAttempts || 0) + 1;
      await pendingUser.save();
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Check again that email wasn't created concurrently
    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(409).json({
        success: false,
        message: "User already exists with this email address",
      });
    }

    let initialPassword = password;
    let isTempPassword = false;

    if (!initialPassword || initialPassword.trim().length < 6) {
      initialPassword = Math.random().toString(36).slice(-8) + "1!";
      isTempPassword = true;
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Create real User record with isVerified: true
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: hashedPassword,
      role: pendingUser.role,
      department: pendingUser.department || "General",
      designation: pendingUser.designation || "Staff",
      isActive: true,
      isVerified: true,
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

    // Delete PendingUser entry
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Send Welcome Email to the new user
    sendEmail({
      to: user.email,
      subject: "Welcome to HRMSPro - Your Account is Ready",
      html: renderAccountCreatedEmail({
        name: user.name,
        email: user.email,
        tempPassword: isTempPassword || password ? initialPassword : null,
      }),
    }).catch((err) => console.error("[Mailer] Account creation notification error:", err));

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
      tempPassword: isTempPassword || password ? initialPassword : null,
    });
  } catch (error) {
    console.error("confirmUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm and create user",
      error: error.message,
    });
  }
};

// Resend Pending User OTP (POST /api/users/resend-otp)
export const resendPendingOtp = async (req, res) => {
  try {
    const { pendingId, email } = req.body;

    if (!pendingId && !email) {
      return res.status(400).json({
        success: false,
        message: "Pending ID or email is required",
      });
    }

    const query = pendingId ? { _id: pendingId } : { email: email.toLowerCase().trim() };
    const pendingUser = await PendingUser.findOne(query);

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: "Pending user session expired or not found",
      });
    }

    // 30s Cooldown Check
    if (pendingUser.otpLastSentAt) {
      const timeDiff = Date.now() - new Date(pendingUser.otpLastSentAt).getTime();
      if (timeDiff < 30000) {
        const remainingSec = Math.ceil((30000 - timeDiff) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting another code.`,
        });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    pendingUser.otpHash = otpHash;
    pendingUser.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    pendingUser.otpAttempts = 0;
    pendingUser.otpLastSentAt = new Date();
    await pendingUser.save();

    console.log(`\n==================================================`);
    console.log(`🔑 [DEV RESEND PENDING OTP] Code for ${pendingUser.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    sendEmail({
      to: pendingUser.email,
      subject: "HRMSPro: Confirm your account",
      html: renderAccountVerificationEmail(otpCode, 15),
    }).catch((err) => console.error("[Mailer] Resend pending user OTP error:", err));

    res.status(200).json({
      success: true,
      message: "Verification code resent to user's email",
    });
  } catch (error) {
    console.error("resendPendingOtp error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification code",
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
