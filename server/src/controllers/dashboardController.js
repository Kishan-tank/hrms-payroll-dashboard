import Employee from "../models/employee.js";
import Payroll from "../models/payroll.js";
// Assuming Leave model will be created by the team member
// import Leave from "../models/leave.js";

export const getHrSummary = async (req, res) => {
  try {
    // 1. Total Employees
    const totalEmployees = await Employee.countDocuments({ status: "Active" });

    // 2. Attendance Rate (Mocked for now since Attendance model isn't built yet)
    // Normally we'd query the Attendance collection for today's records
    const attendanceRate = "94.2%";

    // 3. Payroll Status (for current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const payrollRecords = await Payroll.countDocuments({ month: currentMonth, year: currentYear });
    let payrollStatus = "Not Started";
    if (payrollRecords > 0) {
      const paidRecords = await Payroll.countDocuments({ month: currentMonth, year: currentYear, status: "Paid" });
      payrollStatus = `${Math.round((paidRecords / payrollRecords) * 100)}%`;
    }

    // 4. Pending Approvals (Mocked for now since Leave model isn't built yet)
    // Normally: await Leave.countDocuments({ status: "Pending" })
    const pendingApprovals = 14;

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
    // Mock data until all models (Leave, Attendance) are fully functional
    const activities = [
      { action: 'Leave Approved', name: 'John Doe', dept: 'Engineering', time: '5m ago' },
      { action: 'Employee Added', name: 'Priya Nair', dept: 'Marketing', time: '1h ago' },
      { action: 'Payroll Processed', name: 'Finance Team', dept: 'Finance', time: '3h ago' },
      { action: 'Attendance Alert', name: 'Rahul Mehta', dept: 'Sales', time: '4h ago' }
    ];

    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch recent activity", error: error.message });
  }
};
