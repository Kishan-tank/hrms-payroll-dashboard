import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: String, // e.g., "June"
      required: true,
    },
    year: {
      type: Number, // e.g., 2026
      required: true,
    },
    basicPay: {
      type: Number,
      required: true,
    },
    deductions: {
      type: Number,
      required: true,
      default: 0,
    },
    netPay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Paid"],
      default: "Pending",
    },
    processedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    // Soft delete — isActive:false = voided record (removed from all active queries).
    // paidAt is preserved for audit even after voiding.
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
