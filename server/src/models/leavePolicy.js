import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Policy name is required"],
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Work From Home", "Optional Holiday"],
      required: [true, "Leave type is required"],
    },
    daysAllotted: {
      type: Number,
      required: [true, "Days allotted per year is required"],
      min: [1, "Days allotted must be at least 1"],
    },
    department: {
      type: String,
      default: "All",
    },
    applicableRoles: {
      type: [String],
      default: ["employee", "hr-manager"],
    },
    allowCarryForward: {
      type: Boolean,
      default: false,
    },
    maxCarryForwardDays: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const LeavePolicy = mongoose.model("LeavePolicy", leavePolicySchema);

export default LeavePolicy;
