import Employee from "../models/employee.js";
import Leave from "../models/leave.js";
import Payroll from "../models/payroll.js";
import Attendance from "../models/attendance.js";

// Returns Attendance Heatmap data
export const getAttendanceHeatmap = async (req, res) => {
  try {
    const mockAttendanceHeatmap = [
      { time: '9:00 AM', Mon: 85, Tue: 88, Wed: 92, Thu: 85, Fri: 80 },
      { time: '10:00 AM', Mon: 95, Tue: 96, Wed: 98, Thu: 94, Fri: 90 },
      { time: '11:00 AM', Mon: 98, Tue: 97, Wed: 99, Thu: 96, Fri: 92 },
      { time: '12:00 PM', Mon: 90, Tue: 92, Wed: 95, Thu: 88, Fri: 85 },
      { time: '1:00 PM', Mon: 60, Tue: 65, Wed: 70, Thu: 62, Fri: 55 },
      { time: '2:00 PM', Mon: 85, Tue: 88, Wed: 90, Thu: 86, Fri: 82 },
      { time: '3:00 PM', Mon: 92, Tue: 95, Wed: 96, Thu: 90, Fri: 85 },
      { time: '4:00 PM', Mon: 88, Tue: 90, Wed: 92, Thu: 85, Fri: 80 },
      { time: '5:00 PM', Mon: 75, Tue: 78, Wed: 80, Thu: 72, Fri: 65 },
      { time: '6:00 PM', Mon: 40, Tue: 45, Wed: 42, Thu: 38, Fri: 30 }
    ];
    res.status(200).json({ success: true, heatmap: mockAttendanceHeatmap });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch attendance heatmap", error: error.message });
  }
};

export const getAttritionRisk = async (req, res) => {
  try {
    const depts = await Employee.aggregate([
      { $group: { _id: "$department", avgBasicPay: { $avg: "$basicPay" } } }
    ]);
    
    let riskData = depts.map(d => {
      return {
        department: d._id,
        riskScore: Math.floor(Math.random() * 40) + 10,
        factors: {
          leaveFrequency: Math.floor(Math.random() * 30) + 5,
          performanceDrop: Math.floor(Math.random() * 20) + 5,
          tenure: Math.floor(Math.random() * 25) + 10
        }
      };
    });

    if(riskData.length === 0) {
      riskData = [
        { department: 'Engineering', riskScore: 35, factors: { leaveFrequency: 20, performanceDrop: 15, tenure: 25 } },
        { department: 'Marketing', riskScore: 42, factors: { leaveFrequency: 25, performanceDrop: 10, tenure: 30 } },
        { department: 'Sales', riskScore: 28, factors: { leaveFrequency: 15, performanceDrop: 8, tenure: 40 } },
        { department: 'HR', riskScore: 15, factors: { leaveFrequency: 5, performanceDrop: 5, tenure: 50 } }
      ];
    }
    res.status(200).json({ success: true, attritionRisk: riskData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch attrition risk", error: error.message });
  }
};

export const getLeaveApprovalTrend = async (req, res) => {
  try {
    const trend = [
      { month: 'Jan', approvalRate: 92 },
      { month: 'Feb', approvalRate: 94 },
      { month: 'Mar', approvalRate: 88 },
      { month: 'Apr', approvalRate: 95 },
      { month: 'May', approvalRate: 91 },
      { month: 'Jun', approvalRate: 96 }
    ];
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
      salaryDistribution: salaryDistribution.length && salaryDistribution.some(s => s.count > 0) ? salaryDistribution : [
        { range: '<30k', count: 12 }, { range: '30k-50k', count: 35 }, { range: '50k-80k', count: 28 }, { range: '80k-120k', count: 15 }, { range: '>120k', count: 5 }
      ], 
      departmentPayrollCost: departmentPayrollCost.length ? departmentPayrollCost : [
        { department: 'Engineering', cost: 1200000 }, { department: 'Marketing', cost: 600000 }, { department: 'Sales', cost: 800000 }, { department: 'HR', cost: 400000 }, { department: 'Finance', cost: 500000 }
      ], 
      compensationBreakdown 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll distribution", error: error.message });
  }
};
