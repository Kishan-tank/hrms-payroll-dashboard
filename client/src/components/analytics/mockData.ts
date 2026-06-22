// TODO: Replace with API when backend analytics endpoint exists

// 1. Attrition Risk
export const mockAttritionRisk = [
  { department: 'Engineering', riskScore: 12, safe: 88 },
  { department: 'Sales', riskScore: 24, safe: 76 },
  { department: 'Marketing', riskScore: 18, safe: 82 },
  { department: 'HR', riskScore: 5, safe: 95 },
  { department: 'Operations', riskScore: 15, safe: 85 },
];

// 2. Attendance Heatmap
// Shows average attendance percentage across the week
export const mockAttendanceHeatmap = [
  { day: 'Mon', 'Engineering': 96, 'Sales': 92, 'Marketing': 94, 'HR': 98, 'Operations': 95 },
  { day: 'Tue', 'Engineering': 95, 'Sales': 90, 'Marketing': 92, 'HR': 97, 'Operations': 94 },
  { day: 'Wed', 'Engineering': 94, 'Sales': 95, 'Marketing': 96, 'HR': 99, 'Operations': 96 },
  { day: 'Thu', 'Engineering': 97, 'Sales': 94, 'Marketing': 91, 'HR': 98, 'Operations': 95 },
  { day: 'Fri', 'Engineering': 88, 'Sales': 85, 'Marketing': 89, 'HR': 95, 'Operations': 92 },
];

// 3. Compensation Breakdown
export const mockCompensationBreakdown = [
  { name: 'Base Salary', value: 75, color: '#3b82f6' }, // Blue
  { name: 'Bonuses', value: 15, color: '#10b981' }, // Emerald
  { name: 'Benefits', value: 7, color: '#8b5cf6' }, // Purple
  { name: 'Equity', value: 3, color: '#f59e0b' }, // Amber
];

// 4. Department Payroll Cost
export const mockDepartmentPayrollCost = [
  { department: 'Engineering', cost: 1250000 },
  { department: 'Sales', cost: 850000 },
  { department: 'Marketing', cost: 420000 },
  { department: 'Operations', cost: 680000 },
  { department: 'HR', cost: 250000 },
];

// 5. Salary Distribution
export const mockSalaryDistribution = [
  { range: '< 5L', count: 12 },
  { range: '5L-10L', count: 45 },
  { range: '10L-15L', count: 32 },
  { range: '15L-20L', count: 18 },
  { range: '> 20L', count: 8 },
];

// 6. Approval Rate Trend
export const mockApprovalRateTrend = [
  { month: 'Jan', approvalRate: 92 },
  { month: 'Feb', approvalRate: 94 },
  { month: 'Mar', approvalRate: 91 },
  { month: 'Apr', approvalRate: 96 },
  { month: 'May', approvalRate: 95 },
  { month: 'Jun', approvalRate: 98 },
];
