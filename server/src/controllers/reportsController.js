import Employee from "../models/employee.js";
import Payroll from "../models/payroll.js";
import Leave from "../models/leave.js";
import Attendance from "../models/attendance.js";

export const getHeadcountTrend = async (req, res) => {
  try {
    const trend = await Employee.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$joinDate" },
            month: { $month: "$joinDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let cumulative = 0;
    
    const formattedTrend = trend.map(t => {
      cumulative += t.count;
      return [monthNames[t._id.month - 1], cumulative];
    });

    res.status(200).json({ success: true, trend: formattedTrend });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch headcount trend", error: error.message });
  }
};

export const getPayrollTrend = async (req, res) => {
  try {
    const trend = await Payroll.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          total: { $sum: "$netPay" }
        }
      },
      { $limit: 12 }
    ]);

    const formattedTrend = trend.map(t => [String(t._id.month).substring(0, 3), Math.round(t.total / 100000)]);

    res.status(200).json({ success: true, trend: formattedTrend });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll trend", error: error.message });
  }
};

export const getLeaveBreakdown = async (req, res) => {
  try {
    const leaveData = await Leave.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: "$days" }
        }
      }
    ]);
    
    const colors = {
      "Casual Leave": "#2563EB",
      "Sick Leave": "#22C55E",
      "Earned Leave": "#F59E0B",
      "Work From Home": "#8B5CF6",
      "Optional Holiday": "#EF4444"
    };

    const breakdown = leaveData.map(l => {
      const shortType = l._id === "Work From Home" ? "WFH" : l._id.replace(" Leave", "");
      return [shortType, l.count, colors[l._id] || "#94A3B8"];
    });

    res.status(200).json({ success: true, breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch leave breakdown", error: error.message });
  }
};

export const getDeptAttendance = async (req, res) => {
  try {
    const deptData = await Attendance.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $group: {
          _id: "$employee.department",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] }
          }
        }
      }
    ]);

    const attendance = deptData.map(d => {
      const percentage = Math.round((d.present / d.total) * 100);
      return [d._id, percentage];
    });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch department attendance", error: error.message });
  }
};

export const generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    await new Promise(resolve => setTimeout(resolve, 500));

    res.status(200).json({ 
      success: true, 
      message: "Monthly report generated successfully", 
      downloadUrl: `/api/reports/download?month=${month}&year=${year}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate report", error: error.message });
  }
};
