// The three exports below remain in use by ExecutiveOverview, AttendanceAnalytics, and LeaveAnalytics.
// Their corresponding backend endpoints (getAttritionRisk, getAttendanceHeatmap, getLeaveApprovalTrend)
// return equally-fake data (hardcoded rows or Math.random() scores) — wiring them frontend-side
// would not be a genuine improvement over these static values.
// Flagged for backend fix (real DB aggregation) before frontend wiring is worth doing.

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


// 6. Approval Rate Trend
export const mockApprovalRateTrend = [
  { month: 'Jan', approvalRate: 92 },
  { month: 'Feb', approvalRate: 94 },
  { month: 'Mar', approvalRate: 91 },
  { month: 'Apr', approvalRate: 96 },
  { month: 'May', approvalRate: 95 },
  { month: 'Jun', approvalRate: 98 },
];
