import Employee from "../models/employee.js";
import Payroll from "../models/payroll.js";
import Leave from "../models/leave.js";
import Attendance from "../models/attendance.js";
import User from "../models/user.js";

function timeAgo(date) {
  if (!date) return "Just now";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
}

export const getHrSummary = async (req, res) => {
  try {
    // 1. Total Employees
    const totalEmployees = await Employee.countDocuments({ status: "Active" });

    // 2. Attendance Rate
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({ date: today });
    let attendanceRate = "0%";
    if (totalEmployees > 0 && todayAttendance.length > 0) {
      const presentCount = todayAttendance.filter(a => ["Present", "Late"].includes(a.status)).length;
      attendanceRate = `${Math.round((presentCount / totalEmployees) * 100)}%`;
    }

    // 3. Payroll Status (for current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const payrollRecords = await Payroll.countDocuments({ month: currentMonth, year: currentYear });
    let payrollStatus = "Not Started";
    if (payrollRecords > 0) {
      const paidRecords = await Payroll.countDocuments({ month: currentMonth, year: currentYear, status: "Paid" });
      payrollStatus = `${Math.round((paidRecords / payrollRecords) * 100)}%`;
    }

    // 4. Pending Approvals
    const pendingApprovals = await Leave.countDocuments({ status: "Pending" });

    res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        attendanceRate,
        payrollStatus,
        pendingApprovals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch HR summary", error: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // Leaves
    const recentLeaves = await Leave.find().sort({ updatedAt: -1 }).limit(5).populate('employeeId');
    for (const leave of recentLeaves) {
      if (leave.employeeId) {
        activities.push({
          action: `Leave ${leave.status}`,
          name: leave.employeeId.name,
          dept: leave.employeeId.department,
          time: leave.updatedAt
        });
      }
    }

    // Employees
    const recentEmployees = await Employee.find().sort({ createdAt: -1 }).limit(5);
    for (const emp of recentEmployees) {
      activities.push({
        action: 'Employee Added',
        name: emp.name,
        dept: emp.department,
        time: emp.createdAt
      });
    }

    // Payroll
    const recentPayroll = await Payroll.find({ status: "Paid" }).sort({ paidAt: -1 }).limit(5).populate('employeeId');
    for (const pay of recentPayroll) {
      if (pay.employeeId) {
        activities.push({
          action: 'Payroll Processed',
          name: pay.employeeId.name,
          dept: pay.employeeId.department,
          time: pay.paidAt || pay.updatedAt
        });
      }
    }

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const topActivities = activities.slice(0, 5).map(act => ({
      ...act,
      time: timeAgo(act.time)
    }));

    res.status(200).json({ success: true, activities: topActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch recent activity", error: error.message });
  }
};

export const getEmployeeSummary = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Try to find a linked Employee document first
    let employee = await Employee.findOne({ userId });

    // If no Employee record is linked to this user account,
    // fall back to the User record so the dashboard always loads.
    if (!employee) {
      const user = await User.findById(userId).select("name email role department designation");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({
        success: true,
        summary: {
          employee: {
            name: user.name,
            role: user.designation || user.role || "Employee",
            department: user.department || "General"
          },
          workspace: { attendanceStatus: "Not Checked In", checkInTime: null },
          payrollLeave: { leavesTaken: 0, leaveBalance: 24, latestNetPay: 0 }
        }
      });
    }

    // Employee record found — fetch real attendance, leave, payroll data
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({ employeeId: employee._id, date: today });

    const totalLeaves = await Leave.aggregate([
      { $match: { employeeId: employee._id, status: "Approved" } },
      { $group: { _id: null, total: { $sum: "$days" } } }
    ]);
    const leavesTaken = totalLeaves.length > 0 ? totalLeaves[0].total : 0;
    const leaveBalance = Math.max(0, 24 - leavesTaken);

    // Calculate Attendance Rate for current month
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();
    const startOfMonth = new Date(currentYear, currentMonthIndex, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentYear, currentMonthIndex + 1, 0).toISOString().split('T')[0];
    
    const monthAttendance = await Attendance.find({ 
      employeeId: employee._id, 
      date: { $gte: startOfMonth, $lte: endOfMonth } 
    });
    
    // Assume 22 working days in a month for simplicity
    const workingDays = 22;
    const presentCount = monthAttendance.filter(a => ["Present", "Late"].includes(a.status)).length;
    const attendanceRate = Math.min(100, Math.round((presentCount / workingDays) * 100));

    // Calculate Payroll Status
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long' });
    const latestPayroll = await Payroll.findOne({ employeeId: employee._id }).sort({ createdAt: -1 });
    let payrollStatus = "Not Started";
    if (latestPayroll) {
      if (latestPayroll.month === currentMonthStr && latestPayroll.year === currentYear) {
        payrollStatus = latestPayroll.status;
      } else {
        payrollStatus = "Pending"; // For previous month or waiting for current
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        employee: {
          name: employee.name,
          role: employee.role,
          department: employee.department
        },
        workspace: {
          attendanceStatus: todayAttendance ? todayAttendance.status : "Not Checked In",
          checkInTime: todayAttendance?.checkIn || null,
          attendanceRate: attendanceRate
        },
        payrollLeave: {
          leavesTaken,
          leaveBalance,
          latestNetPay: latestPayroll?.netPay || 0,
          payrollStatus: payrollStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employee summary", error: error.message });
  }
};
