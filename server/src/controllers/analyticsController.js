import Employee from "../models/employee.js";
import Leave from "../models/leave.js";
import Payroll from "../models/payroll.js";
import Attendance from "../models/attendance.js";

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
    const depts = await Employee.aggregate([
      { 
        $group: { 
          _id: "$department", 
          empCount: { $sum: 1 }, 
          avgTenureMs: { $avg: { $subtract: [new Date(), "$joinDate"] } } 
        } 
      }
    ]);
    
    const leaves = await Leave.populate(await Leave.find(), { path: 'employeeId', select: 'department' });
    const leaveMap = {};
    leaves.forEach(l => {
      if (l.employeeId && l.employeeId.department) {
        const d = l.employeeId.department;
        leaveMap[d] = (leaveMap[d] || 0) + 1;
      }
    });

    let riskData = depts.map(d => {
      const deptName = d._id;
      const tenureYears = (d.avgTenureMs || 0) / (1000 * 60 * 60 * 24 * 365);
      
      const totalLeaves = leaveMap[deptName] || 0;
      const leaveFrequency = d.empCount > 0 ? (totalLeaves / d.empCount) : 0;
      
      let riskScore = 10 + (leaveFrequency * 2) - (tenureYears * 2);
      riskScore = Math.max(5, Math.min(95, Math.round(riskScore)));
      
      return {
        department: deptName,
        riskScore,
        factors: {
          leaveFrequency: Math.round(leaveFrequency),
          tenure: Math.round(tenureYears * 10) / 10
        }
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
