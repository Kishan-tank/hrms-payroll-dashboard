import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import Employee from "../models/employee.js";
import { sendEmail } from "../utils/mailer.js";
import { renderOtpEmail } from "../templates/emailTemplate.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const generateTempOtpToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      type: "temp_otp",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5m",
    }
  );
};

export const registerUser = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Public self-registration is disabled. Please contact an administrator.",
  });
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    // Save OTP details to user record
    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();

    // Print dev OTP in terminal so local testing is never blocked
    console.log(`\n==================================================`);
    console.log(`🔑 [DEV OTP FALLBACK] Verification Code for ${user.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    // Send OTP email using mailer utility
    const emailResult = await sendEmail({
      to: user.email,
      subject: "HRMSPro Login Verification Code",
      html: renderOtpEmail(otpCode, 5),
    });

    const tempToken = generateTempOtpToken(user._id);

    res.status(200).json({
      success: true,
      requiresOtp: true,
      tempToken,
      message: emailResult.success
        ? "Verification code sent to your email"
        : `Email delivery failed (${emailResult.error}). Check server terminal for dev code: ${otpCode}`,
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: "Verification token and code are required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    if (!decoded || decoded.type !== "temp_otp") {
      return res.status(400).json({
        success: false,
        message: "Invalid token type",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Check expiration
    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Max attempt limit check (5 tries)
    if (user.otpAttempts >= 5) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Max attempts exceeded. Please request a new verification code.",
      });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.otpHash);

    if (!isMatch) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Clear OTP fields upon successful verification
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLastSentAt = undefined;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (!decoded || decoded.type !== "temp_otp") {
      return res.status(400).json({
        success: false,
        message: "Invalid token type",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Enforce 30-second cooldown between resends
    if (user.otpLastSentAt) {
      const timeDiff = Date.now() - new Date(user.otpLastSentAt).getTime();
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

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();

    console.log(`\n==================================================`);
    console.log(`🔑 [DEV RESEND OTP FALLBACK] Verification Code for ${user.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    const emailResult = await sendEmail({
      to: user.email,
      subject: "HRMSPro Login Verification Code",
      html: renderOtpEmail(otpCode, 5),
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? "New verification code sent to your email"
        : `Email failed (${emailResult.error}). Check server terminal for code: ${otpCode}`,
    });
  } catch (error) {
    console.error("resendOtp error:", error);
    res.status(500).json({
      success: false,
      message: "Resend OTP failed",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email ? email.toLowerCase().trim() : "" });

    if (!user) {
      return res.status(200).json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - HRMSPro",
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};