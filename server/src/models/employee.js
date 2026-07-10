import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
    joinDate: {
      type: Date,
      required: true,
    },
    basicPay: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      description: "Optional reference to a user account if they can log in",
    },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String },
    bankAccount: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    documents: [{
      type: { type: String }, // e.g. 'gov_id', 'offer_letter', 'certificate'
      url: { type: String },
      name: { type: String }
    }]
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
