import Employee from "../models/employee.js";
import Payroll from "../models/payroll.js";

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
      { $limit: 6 }
    ]);

    // Format the data for the frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let cumulative = 200; // Base headcount to start trend, in a real app this would be calculated from all time
    
    const formattedTrend = trend.map(t => {
      cumulative += t.count;
      return [monthNames[t._id.month - 1], cumulative];
    });

    // If no real data, return dummy shape so frontend doesn't break
    const finalData = formattedTrend.length > 0 ? formattedTrend : [
      ['Jan', 220], ['Feb', 228], ['Mar', 235], ['Apr', 242], ['May', 251], ['Jun', 256]
    ];

    res.status(200).json({ success: true, trend: finalData });
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
      // Simplified sort for month strings
      { $limit: 6 }
    ]);

    const formattedTrend = trend.map(t => [t._id.month.substring(0, 3), Math.round(t.total / 100000)]); // Format to Lakhs

    const finalData = formattedTrend.length > 0 ? formattedTrend : [
      ['Jan', 42], ['Feb', 43], ['Mar', 45], ['Apr', 46], ['May', 48], ['Jun', 49]
    ];

    res.status(200).json({ success: true, trend: finalData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll trend", error: error.message });
  }
};

// These two will be fully implemented when Team Member finishes Attendance/Leave models
export const getLeaveBreakdown = async (req, res) => {
  res.status(200).json({
    success: true,
    breakdown: [
      ['Casual', 38, '#2563EB'],
      ['Sick', 24, '#22C55E'],
      ['Earned', 20, '#F59E0B'],
      ['WFH', 18, '#8B5CF6']
    ]
  });
};

export const getDeptAttendance = async (req, res) => {
  res.status(200).json({
    success: true,
    attendance: [
      ['Engineering', 96],
      ['Marketing', 92],
      ['Sales', 89],
      ['HR', 98],
      ['Finance', 94]
    ]
  });
};
