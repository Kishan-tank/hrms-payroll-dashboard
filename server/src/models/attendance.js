const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Links to Kishan's Employee model
    required: true,
  },
  date: {
    type: String, // Stored as "YYYY-MM-DD"
    required: true,
  },
  checkIn: {
    type: String, // Stored as "HH:MM AM/PM"
  },
  checkOut: {
    type: String, // Stored as "HH:MM AM/PM"
  },
  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Leave"],
    default: "Present",
  },
}, { timestamps: true });

