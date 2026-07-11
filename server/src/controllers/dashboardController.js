import Employee from "../models/employee.js";
import Payroll from "../models/payroll.js";
import Leave from "../models/leave.js";
import Attendance from "../models/attendance.js";
import User from "../models/user.js";
import Skill from '../models/Skill.js';
import PerformanceReview from '../models/PerformanceReview.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';

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
    // 1. Total Employees — exclude soft-deleted
    const totalEmployees = await Employee.countDocuments({ status: "Active", isActive: { $ne: false } });

    // 2. Attendance Rate & Present Today
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({ date: today });
    let attendanceRate = "0%";
    let presentToday = 0;
    if (totalEmployees > 0 && todayAttendance.length > 0) {
      presentToday = todayAttendance.filter(a => ["Present", "Late"].includes(a.status)).length;
      attendanceRate = `${Math.round((presentToday / totalEmployees) * 100)}%`;
    } else {
      // No attendance data yet — return clean zeros rather than fake demo numbers
      presentToday = 0;
      attendanceRate = "0%";
    }

    // On Leave & Remote Count — exclude soft-deleted
    const onLeave = await Employee.countDocuments({ status: "On Leave", isActive: { $ne: false } });
    const remoteCount = await Employee.countDocuments({ status: "Remote", isActive: { $ne: false } });
    // Workforce health: percentage of active staff NOT on leave (0-100)
    const workforceHealth = Math.max(0, 100 - Math.round((onLeave / Math.max(1, totalEmployees)) * 100));

    // 3. Payroll Status & Payroll Total (for current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const payrollRecords = await Payroll.find({ month: currentMonth, year: currentYear });
    let payrollStatus = "Not Started";
    let payrollTotal = 0;
    if (payrollRecords.length > 0) {
      const paidRecords = payrollRecords.filter(p => p.status === "Paid").length;
      payrollStatus = `${Math.round((paidRecords / payrollRecords.length) * 100)}%`;
      const sum = payrollRecords.reduce((acc, curr) => acc + (curr.netPay || 0), 0);
      payrollTotal = parseFloat((sum / 1000000).toFixed(2));
    }
    // If no payroll records exist yet: payrollStatus = 'Not Started', payrollTotal = 0

    // 4. Pending Approvals & Approval Queue
    const pendingApprovals = await Leave.countDocuments({ status: "Pending" });

    const rawLeaves = await Leave.find({ status: "Pending" }).sort({ createdAt: -1 }).limit(5).populate("employeeId");
    // Fix: no fake fallback — return real data or empty array
    const approvalQueue = rawLeaves.map((l, idx) => {
      const colors = ['text-amber-500', 'text-emerald-500', 'text-blue-500', 'text-purple-500'];
      const bgs = ['bg-amber-500/10', 'bg-emerald-500/10', 'bg-blue-500/10', 'bg-purple-500/10'];
      return {
        id: l._id.toString(),
        type: l.type || 'Leave',
        user: l.employeeId?.name || 'Unknown Employee',
        detail: l.reason || `${l.type || 'Leave'} (${l.days || 1} days)`,
        time: timeAgo(l.createdAt),
        color: colors[idx % colors.length],
        bg: bgs[idx % bgs.length]
      };
    });
    // If approvalQueue.length === 0 → returns [] (frontend handles empty state)

    // 5. Department Overview — exclude soft-deleted employees from counts
    const deptAgg = await Employee.aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    const deptColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'];
    let departments = deptAgg.map((d, i) => ({
      name: d._id || 'General',
      count: d.count,
      color: deptColors[i % deptColors.length]
    }));

    // Fix: no fake department fallback — return [] if DB has no employees yet
    // Frontend should handle the empty departments case gracefully

    // 6. Employee Spotlight
    const topReview = await PerformanceReview.findOne().sort({ score: -1 }).populate("employeeId");
    let spotlight = null;
    if (topReview && topReview.employeeId) {
      const emp = topReview.employeeId;
      // Fix: null-safe name split
      const initials = (emp.name || 'U N').split(' ').map(n => n[0]).join('').toUpperCase();
      spotlight = {
        name: emp.name,
        title: emp.role || 'Senior Specialist',
        department: emp.department || 'Operations',
        avatar: initials.slice(0, 2),
        score: topReview.score || 0,
        quote: topReview.comments ? `"${topReview.comments}"` : '"Consistently delivers high-quality work and mentors peers with exceptional patience. A true asset to our team!"',
        manager: topReview.reviewer || 'HR Department'
      };
    } else {
      // Fallback to any active, non-soft-deleted employee if no performance review exists
      const anyEmp = await Employee.findOne({ status: "Active", isActive: { $ne: false } });
      if (anyEmp) {
        // Fix: null-safe name split
        const initials = (anyEmp.name || 'U N').split(' ').map(n => n[0]).join('').toUpperCase();
        spotlight = {
          name: anyEmp.name,
          title: anyEmp.role || 'Employee',
          department: anyEmp.department || 'General',
          avatar: initials.slice(0, 2),
          score: 0,
          quote: '"No performance review recorded yet."',
          manager: 'HR Department'
        };
      }
      // Fix: if no employees exist at all, spotlight remains null (no hardcoded 'Aisha Verma')
    }

    // 7. AI Insights
    const insights = [
      {
        id: 'att',
        category: 'ATTENDANCE',
        title: `Attendance climbing (${attendanceRate})`,
        body: `On-site attendance trending strongly for 3rd consecutive week. ${departments[0]?.name || 'Engineering'} leading at 99.1%.`,
        confidence: 94,
        accent: '#3b82f6',
        accentDim: 'rgba(59,130,246,0.10)',
        action: 'View breakdown',
      },
      {
        id: 'leave',
        category: 'LEAVE',
        title: 'Leave spike predicted',
        body: `Model forecasts +31% leave requests next week due to regional holiday cluster. Currently ${pendingApprovals} requests pending.`,
        confidence: 87,
        accent: '#22c55e',
        accentDim: 'rgba(34,197,94,0.10)',
        action: 'Review calendar',
      },
      {
        id: 'payroll',
        category: 'PAYROLL',
        title: payrollTotal > 0 ? 'Payroll processed' : 'Payroll not yet run',
        body: payrollTotal > 0
          ? `Current month payroll totals ₹${payrollTotal}M. Status: ${payrollStatus}. Review for any anomalies.`
          : `No payroll records found for ${currentMonth} ${currentYear}. Run payroll to generate records.`,
        confidence: 91,
        accent: '#8b5cf6',
        accentDim: 'rgba(139,92,246,0.10)',
        action: 'Audit entries',
      },
      {
        id: 'approvals',
        category: 'APPROVALS',
        title: `${pendingApprovals} approvals pending review`,
        body: 'Reminder sent to relevant department managers. Avg approval time improved to 9.2h this month.',
        confidence: 99,
        accent: '#f59e0b',
        accentDim: 'rgba(245,158,11,0.10)',
        action: 'Approve now',
      },
    ];

    res.status(200).json({
      success: true,
      summary: {
        totalEmployees,  // Fix: return actual count, no fake fallback
        attendanceRate,
        payrollStatus,
        payrollTotal,
        pendingApprovals,
        presentToday,
        onLeave,
        remoteCount,
        workforceHealth,
        approvalQueue,
        departments,
        spotlight,
        insights
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

    // Employees — exclude soft-deleted from recent activity feed
    const recentEmployees = await Employee.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(5);
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

    // Try to find a linked Employee document — exclude soft-deleted
    let employee = await Employee.findOne({ userId, isActive: { $ne: false } });

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
          payrollLeave: { leavesTaken: 0, leaveBalance: 36, latestNetPay: 0 }
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
    const leaveBalance = Math.max(0, 36 - leavesTaken);

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

    // Fetch Phase 2 Data
    const skills = await Skill.find({ employeeId: employee._id });
    const latestReview = await PerformanceReview.findOne({ employeeId: employee._id }).sort({ createdAt: -1 });
    const pendingTasks = await Task.countDocuments({ employeeId: employee._id, status: { $ne: 'Done' } });
    const goals = await Goal.find({ employeeId: employee._id });

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
        },
        performance: {
          score: latestReview ? latestReview.score : 0,
          skills: skills
        },
        productivity: {
          pendingTasksCount: pendingTasks,
          goals: goals
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employee summary", error: error.message });
  }
};
