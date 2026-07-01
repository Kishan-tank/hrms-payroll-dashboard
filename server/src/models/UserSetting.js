import mongoose from 'mongoose';

const userSettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light'
  },
  accentColor: {
    type: String,
    default: '#2563EB'
  },
  notifications: {
    newLeaveRequests: { type: Boolean, default: true },
    payrollProcessed: { type: Boolean, default: true },
    attendanceAlerts: { type: Boolean, default: false },
    newEmployeeJoined: { type: Boolean, default: true },
    performanceReviewsDue: { type: Boolean, default: false },
    systemMaintenance: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('UserSetting', userSettingSchema);
