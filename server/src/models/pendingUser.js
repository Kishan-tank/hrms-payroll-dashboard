import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["employee", "hr-manager"],
      default: "employee",
    },
    department: {
      type: String,
      default: "General",
    },
    designation: {
      type: String,
      default: "Staff",
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB TTL index on otpExpiresAt: auto-deletes unconfirmed pending entries after expiry
pendingUserSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;
