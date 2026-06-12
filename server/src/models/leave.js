
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  type: {
    type: String,
    enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Work From Home", "Optional Holiday"],
    required: true,
  },
  fromDate: { type: String, required: true }, // "YYYY-MM-DD"
  toDate: { type: String, required: true },   // "YYYY-MM-DD"
  days: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  }
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);
