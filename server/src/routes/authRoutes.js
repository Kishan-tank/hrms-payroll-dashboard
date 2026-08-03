import express from "express";
import {
  loginUser,
  verifyOtp,
  resendOtp,
  verifyAccount,
  resendAccountVerification,
  getCurrentUser,
  forgotPassword,
  resendResetOtp,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/login/verify-otp", verifyOtp);
router.post("/login/resend-otp", resendOtp);
router.post("/verify-account", verifyAccount);
router.post("/verify-account/resend", resendAccountVerification);
router.get("/me", verifyToken, getCurrentUser);

// Password reset — 3-step OTP flow
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/resend", resendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;