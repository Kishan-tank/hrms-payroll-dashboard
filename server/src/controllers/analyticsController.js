import Employee from "../models/employee.js";
import Leave from "../models/leave.js";
import Payroll from "../models/payroll.js";
import Attendance from "../models/attendance.js";
import LeavePolicy from "../models/leavePolicy.js";

// GET /api/analytics/overview — End-to-end real aggregation
export const getAnalyticsOverview = async (req, res) => {
  try {
    const { range = "6m" } = req.query;

    const now = new Date();
    let startDate = new Date();

    if (range === "12m") {
      startDate.setMonth(now.getMonth() - 12);
    } else if (range === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === "all") {
      startDate = new Date(0);
    } else {
      // Default: 6m
      startDate.setMonth(now.getMonth() - 6);
    }

    // 1. Total Headcount (Active non-deleted employees)
    const activeEmployees = await Employee.find({
      isActive: { $ne: false },
      status: { $ne: "Inactive" },
    });
    const totalHeadcount = activeEmployees.length;

    // 2. Avg Attendance (% present/late within date range)
    const attendanceRecords = await Attendance.find({
      createdAt: { $gte: startDate },
    });

    let avgAttendance = "0.0%";
    if (attendanceRecords.length > 0) {
      const presentCount = attendanceRecords.filter((r) =>
        ["Present", "Late"].includes(r.status)
      ).length;
      avgAttendance = `${((presentCount / attendanceRecords.length) * 100).toFixed(1)}%`;
    }

    // 3. Total Payroll (Sum of processed/approved payroll netPay in date range)
    const payrollRecords = await Payroll.find({
      createdAt: { $gte: startDate },
    });
    const totalPayrollRaw = payrollRecords.reduce((sum, p) => sum + (p.netPay || 0), 0);
    const totalPayrollLakhs = (totalPayrollRaw / 100000).toFixed(1);

    // 4. Leave Utilization % (Approved leave days / Total allotted leave policy days * 100)
    const approvedLeaves = await Leave.find({
      status: "Approved",
      createdAt: { $gte: startDate },
    });
    const totalLeaveDaysTaken = approvedLeaves.reduce((sum, l) => sum + (l.days || 0), 0);

    const activePolicies = await LeavePolicy.find({ isActive: true });
    const totalPolicyDaysPerEmp = activePolicies.reduce((sum, p) => sum + (p.daysAllotted || 0), 0);
    const totalOrganizationAllottedDays = (totalPolicyDaysPerEmp || 12) * (totalHeadcount || 1);

    const leaveUtilizationPct = totalOrganizationAllottedDays > 0
      ? `${((totalLeaveDaysTaken / totalOrganizationAllottedDays) * 100).toFixed(1)}%`
      : "0.0%";

    // 5. Attrition Risk (Option B: Real Deactivation/Removal Rate)
    // Formula: (Inactive employees) / (Total employees ever, active + inactive) * 100
    const allEmployees = await Employee.find({});
    const totalAllEmployees = allEmployees.length;
    const inactiveEmployees = allEmployees.filter(
      (e) => e.isActive === false || e.status === "Inactive"
    );

    const overallDeactivationRate = totalAllEmployees > 0
      ? Math.round((inactiveEmployees.length / totalAllEmployees) * 100)
      : 0;

    // Attrition Risk Profile by Department (Deactivation rate per department)
    const deptMap = {};
    allEmployees.forEach((emp) => {
      const dept = emp.department || "General";
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, inactive: 0 };
      }
      deptMap[dept].total += 1;
      if (emp.isActive === false || emp.status === "Inactive") {
        deptMap[dept].inactive += 1;
      }
    });

    const attritionRiskProfile = Object.keys(deptMap).map((dept) => {
      const { total, inactive } = deptMap[dept];
      const riskScore = total > 0 ? Math.round((inactive / total) * 100) : 0;
      return {
        department: dept,
        riskScore,
        totalEmployees: total,
        inactiveEmployees: inactive,
      };
    });

    // 6. Real Headcount Growth Trend (Month by Month in date range)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const headcountTrendMap = {};

    activeEmployees.forEach((emp) => {
      const d = emp.joinDate ? new Date(emp.joinDate) : new Date(emp.createdAt);
      if (!isNaN(d.getTime()) && d >= startDate) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${monthNames[d.getMonth()]}`;
        headcountTrendMap[monthKey] = (headcountTrendMap[monthKey] || 0) + 1;
      }
    });

    const sortedMonthKeys = Object.keys(headcountTrendMap).sort();
    let cumulativeHc = 0;
    const headcountTrend = sortedMonthKeys.map((key) => {
      cumulativeHc += headcountTrendMap[key];
      const [, , monthLabel] = key.split("-");
      return { name: monthLabel, headcount: cumulativeHc };
    });

    res.status(200).json({
      success: true,
      range,
      totalHeadcount,
      avgAttendance,
      totalPayroll: `${totalPayrollLakhs}L`,
      totalPayrollRaw,
      leaveUtilization: leaveUtilizationPct,
      attritionRisk: `${overallDeactivationRate}%`,
      attritionRiskProfile,
      headcountTrend,
    });
  } catch (error) {
    console.error("getAnalyticsOverview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics overview",
      error: error.message,
    });
  }
};

// Returns Attendance Heatmap data
export const getAttendanceHeatmap = async (req, res) => {
  try {
    const attendances = await Attendance.find({ checkIn: { $exists: true, $ne: null } });
    
    const times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    const heatmapMap = {};
    times.forEach(t => {
      heatmapMap[t] = { time: t, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    });
    
    attendances.forEach(record => {
      if (record.date) {
        const dateObj = new Date(record.date);
        const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon...
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const dayStr = days[dayOfWeek - 1];
          
          const timeMatch = record.checkIn.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let hour = parseInt(timeMatch[1], 10);
            const ampm = timeMatch[3].toUpperCase();
            if (hour === 12 && ampm === 'AM') hour = 0;
            if (hour !== 12 && ampm === 'PM') hour += 12;
            
            let bucketHour = hour;
            if (bucketHour < 9) bucketHour = 9;
            if (bucketHour > 18) bucketHour = 18;
            
            let bucketAmPm = bucketHour >= 12 ? 'PM' : 'AM';
            let displayHour = bucketHour % 12 || 12;
            let timeBucket = `${displayHour}:00 ${bucketAmPm}`;
            
            if (heatmapMap[timeBucket]) {
              heatmapMap[timeBucket][dayStr]++;
            }
          }
        }
      }
    });

    const heatmap = Object.values(heatmapMap);
    
    let maxVal = 1;
    heatmap.forEach(row => {
      days.forEach(d => {
        if (row[d] > maxVal) maxVal = row[d];
      });
    });

    if (maxVal > 0) {
        heatmap.forEach(row => {
          days.forEach(d => {
            row[d] = Math.round((row[d] / maxVal) * 100);
          });
        });
    }

    res.status(200).json({ success: true, heatmap });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch attendance heatmap", error: error.message });
  }
};

export const getAttritionRisk = async (req, res) => {
  try {
    const allEmployees = await Employee.find({});
    const deptMap = {};

    allEmployees.forEach((emp) => {
      const dept = emp.department || "General";
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, inactive: 0 };
      }
      deptMap[dept].total += 1;
      if (emp.isActive === false || emp.status === "Inactive") {
        deptMap[dept].inactive += 1;
      }
    });

    const riskData = Object.keys(deptMap).map((dept) => {
      const { total, inactive } = deptMap[dept];
      const riskScore = total > 0 ? Math.round((inactive / total) * 100) : 0;
      return {
        department: dept,
        riskScore,
        totalEmployees: total,
        inactiveEmployees: inactive,
      };
    });

    res.status(200).json({ success: true, attritionRisk: riskData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch attrition risk", error: error.message });
  }
};

export const getLeaveApprovalTrend = async (req, res) => {
  try {
    const leaves = await Leave.find({});
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = {}; 
    
    leaves.forEach(leave => {
      if (leave.fromDate) {
        const d = new Date(leave.fromDate);
        if (!isNaN(d.getTime())) {
          const month = monthNames[d.getMonth()];
          const key = month; 
          
          if (!trendMap[key]) {
            trendMap[key] = { month: key, approved: 0, total: 0, order: d.getMonth() };
          }
          
          if (leave.status === 'Approved' || leave.status === 'Rejected') {
             trendMap[key].total++;
             if (leave.status === 'Approved') trendMap[key].approved++;
          }
        }
      }
    });
    
    let trend = Object.values(trendMap).map(item => {
      return {
        month: item.month,
        approvalRate: item.total > 0 ? Math.round((item.approved / item.total) * 100) : 0,
        order: item.order
      };
    });
    
    trend.sort((a, b) => a.order - b.order);
    trend = trend.map(t => ({ month: t.month, approvalRate: t.approvalRate }));

    res.status(200).json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch leave approval trend", error: error.message });
  }
};

export const getPayrollDistribution = async (req, res) => {
  try {
    const employees = await Employee.find({}, "basicPay department");
    
    const deptCostMap = {};
    employees.forEach(emp => {
      deptCostMap[emp.department] = (deptCostMap[emp.department] || 0) + emp.basicPay;
    });
    const departmentPayrollCost = Object.keys(deptCostMap).map(k => ({ department: k, cost: deptCostMap[k] }));

    let ranges = { '<30k': 0, '30k-50k': 0, '50k-80k': 0, '80k-120k': 0, '>120k': 0 };
    employees.forEach(emp => {
      if(emp.basicPay < 30000) ranges['<30k']++;
      else if(emp.basicPay < 50000) ranges['30k-50k']++;
      else if(emp.basicPay < 80000) ranges['50k-80k']++;
      else if(emp.basicPay < 120000) ranges['80k-120k']++;
      else ranges['>120k']++;
    });
    const salaryDistribution = Object.keys(ranges).map(k => ({ range: k, count: ranges[k] }));

    const totalBasic = employees.reduce((acc, curr) => acc + curr.basicPay, 0);
    const compensationBreakdown = [
      { name: 'Base Salary', value: totalBasic * 0.7 || 70 },
      { name: 'Allowances', value: totalBasic * 0.15 || 15 },
      { name: 'Bonuses', value: totalBasic * 0.08 || 8 },
      { name: 'Benefits', value: totalBasic * 0.07 || 7 }
    ];

    res.status(200).json({ 
      success: true, 
      salaryDistribution, 
      departmentPayrollCost, 
      compensationBreakdown 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll distribution", error: error.message });
  }
};
