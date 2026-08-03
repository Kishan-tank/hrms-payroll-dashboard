import express from "express";
import {
  loginUser,
  verifyOtp,
  resendOtp,
  verifyAccount,
  resendAccountVerification,
  getCurrentUser,
  forgotPassword,
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
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

export default router;