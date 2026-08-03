import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import Employee from "../models/employee.js";
import { sendEmail } from "../utils/mailer.js";
import {
  renderOtpEmail,
  renderAccountVerificationEmail,
  renderPasswordResetOtpEmail,
  renderPasswordChangedEmail,
} from "../templates/emailTemplate.js";

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

    // Check account verification status before password check
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: "Please verify your email before logging in",
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

/** Account Email Verification Endpoint (POST /verify-account) */
export const verifyAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.verifyOtpHash || !user.verifyOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    if (new Date() > new Date(user.verifyOtpExpiresAt)) {
      user.verifyOtpHash = undefined;
      user.verifyOtpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.verifyOtpHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    user.isVerified = true;
    user.verifyOtpHash = undefined;
    user.verifyOtpExpiresAt = undefined;
    user.verifyOtpLastSentAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("verifyAccount error:", error);
    res.status(500).json({
      success: false,
      message: "Account verification failed",
    });
  }
};

/** Resend Account Verification OTP Endpoint (POST /verify-account/resend) */
export const resendAccountVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    // Enforce 30-second cooldown
    if (user.verifyOtpLastSentAt) {
      const timeDiff = Date.now() - new Date(user.verifyOtpLastSentAt).getTime();
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

    user.verifyOtpHash = otpHash;
    user.verifyOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    user.verifyOtpLastSentAt = new Date();
    await user.save();

    console.log(`\n==================================================`);
    console.log(`🔑 [DEV VERIFY OTP FALLBACK] Code for ${user.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    const emailResult = await sendEmail({
      to: user.email,
      subject: "HRMSPro: Verify your account",
      html: renderAccountVerificationEmail(otpCode, 15),
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? "Verification code sent to your email"
        : `Email delivery failed (${emailResult.error}). Check server terminal for dev code: ${otpCode}`,
    });
  } catch (error) {
    console.error("resendAccountVerification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification code",
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

// ============================================================
// STEP 1: Request reset OTP  POST /auth/forgot-password
// ============================================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const GENERIC = "If this email is registered, a verification code has been sent.";

    if (!email) return res.status(200).json({ success: true, message: GENERIC });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return the generic response — don't reveal whether the email exists
    if (!user) return res.status(200).json({ success: true, message: GENERIC });

    if (!user.isActive) return res.status(200).json({ success: true, message: GENERIC });

    // 30-second cooldown (same pattern as login OTP resend)
    if (user.resetOtpLastSentAt) {
      const elapsed = Date.now() - new Date(user.resetOtpLastSentAt).getTime();
      if (elapsed < 30000) {
        const remainingSec = Math.ceil((30000 - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting another code.`,
        });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = new Date();
    await user.save();

    console.log(`\n==================================================`);
    console.log(`🔑 [DEV RESET OTP] Code for ${user.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    const emailResult = await sendEmail({
      to: user.email,
      subject: "HRMSPro: Reset your password",
      html: renderPasswordResetOtpEmail(otpCode, 10),
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? GENERIC
        : `Email delivery failed (${emailResult.error}). Check server terminal for dev code: ${otpCode}`,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// RESEND reset OTP  POST /auth/forgot-password/resend
// ============================================================
export const resendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isActive) {
      return res.status(200).json({ success: true, message: "If this email is registered, a new code has been sent." });
    }

    if (user.resetOtpLastSentAt) {
      const elapsed = Date.now() - new Date(user.resetOtpLastSentAt).getTime();
      if (elapsed < 30000) {
        const remainingSec = Math.ceil((30000 - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting another code.`,
        });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = new Date();
    await user.save();

    console.log(`\n==================================================`);
    console.log(`🔑 [DEV RESET OTP RESEND] Code for ${user.email}: ${otpCode}`);
    console.log(`==================================================\n`);

    const emailResult = await sendEmail({
      to: user.email,
      subject: "HRMSPro: Reset your password",
      html: renderPasswordResetOtpEmail(otpCode, 10),
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? "A new verification code has been sent."
        : `Email failed. Check server terminal for dev code: ${otpCode}`,
    });
  } catch (error) {
    console.error("resendResetOtp error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// STEP 2: Verify reset OTP  POST /auth/verify-reset-otp
// ============================================================
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.isActive || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    if (new Date() > new Date(user.resetOtpExpiresAt)) {
      user.resetOtpHash = undefined;
      user.resetOtpExpiresAt = undefined;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    if ((user.resetOtpAttempts || 0) >= 5) {
      user.resetOtpHash = undefined;
      user.resetOtpExpiresAt = undefined;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Max attempts exceeded. Please request a new code.",
      });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), user.resetOtpHash);

    if (!isMatch) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    // OTP correct — clear it (single use) and issue a short-lived reset JWT
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = undefined;
    await user.save();

    const resetToken = jwt.sign(
      { id: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified. You may now set a new password.",
      resetToken,
    });
  } catch (error) {
    console.error("verifyResetOtp error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// ============================================================
// STEP 3: Set new password  POST /auth/reset-password
// ============================================================
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken) {
      return res.status(400).json({ success: false, message: "Reset token is required" });
    }

    // Verify JWT signature, expiry, and purpose claim
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset session. Please start over." });
    }

    if (!decoded || decoded.purpose !== "password-reset") {
      return res.status(400).json({ success: false, message: "Invalid reset token" });
    }

    // Server-side password validation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirmation are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Invalidate any leftover reset OTP fields for cleanliness
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = undefined;
    // Also keep old fields cleared (backward-compat)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Fire-and-forget security confirmation email
    sendEmail({
      to: user.email,
      subject: "HRMSPro: Your password was changed",
      html: renderPasswordChangedEmail(user.name),
    }).catch((err) => console.error("[Mailer] Password changed confirmation error:", err));

    res.status(200).json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};