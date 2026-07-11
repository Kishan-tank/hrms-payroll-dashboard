import Payroll from "../models/payroll.js";
import Employee from "../models/employee.js";

// Run payroll for a specific month/year
export const runPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required" });
    }

    const validMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (!validMonths.includes(month)) {
      return res.status(400).json({ success: false, message: "Invalid month. Must be a full month name (e.g. January)." });
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({ success: false, message: "Invalid year. Must be between 2020 and 2030." });
    }

    // Check if payroll already run for this period
    const existingPayroll = await Payroll.findOne({ month, year });
    if (existingPayroll) {
      return res.status(400).json({ success: false, message: `Payroll for ${month} ${year} already exists` });
    }

    // Fetch only active, non-soft-deleted employees for payroll
    const activeEmployees = await Employee.find({ status: "Active", isActive: { $ne: false } });

    if (activeEmployees.length === 0) {
      return res.status(400).json({ success: false, message: "No active employees found to run payroll" });
    }

    const payrollRecords = activeEmployees
      .filter(emp => emp.basicPay && emp.basicPay > 0)
      .map(emp => {
        const pf = Math.round(emp.basicPay * 0.12);
        const tdsRate = emp.basicPay < 50000 ? 0.10 : 0.20;
        const tds = Math.round(emp.basicPay * tdsRate);
        const deductions = pf + tds;
        const netPay = emp.basicPay - deductions;

        return {
          employeeId: emp._id,
          month,
          year,
          basicPay: emp.basicPay,
          deductions,
          netPay,
          status: "Processing",
          processedAt: new Date()
        };
      });

    if (payrollRecords.length === 0) {
      return res.status(400).json({ success: false, message: "No active employees with a valid basic pay found" });
    }

    const result = await Payroll.insertMany(payrollRecords);

    res.status(201).json({ 
      success: true, 
      message: `Payroll run successfully for ${activeEmployees.length} employees`,
      recordsGenerated: result.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to run payroll", error: error.message });
  }
};

// Get payroll records
export const getPayrollRecords = async (req, res) => {
  try {
    const { month, year, status, employeeId } = req.query;

    // Only return active (non-voided) payroll records
    const query = { isActive: { $ne: false } };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const userRole = req.user?.role;

    if (userRole === "employee") {
      const userId = req.user?._id || req.user?.id;
      const userEmail = req.user?.email;
      
      const employee = await Employee.findOne({
        $or: [{ userId }, { email: userEmail }]
      });

      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }

      // Force the query to only fetch this specific employee's records
      // This strips and ignores any malicious ?employeeId= query params
      query.employeeId = employee._id;
    } else if (["admin", "hr", "hr-manager"].includes(userRole)) {
      // HR and Admin can query any employee
      if (employeeId) query.employeeId = employeeId;
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const records = await Payroll.find(query)
      .populate("employeeId", "name employeeId department")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll records", error: error.message });
  }
};

// Get payroll summary
export const getPayrollSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Only include non-voided records in summary aggregation
    const query = { isActive: { $ne: false } };
    if (month) query.month = month;
    if (year) query.year = parseInt(year);

    const summary = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$netPay" },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] }
          },
          processingCount: {
            $sum: { $cond: [{ $eq: ["$status", "Processing"] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      summary: summary.length > 0 ? summary[0] : { totalAmount: 0, paidCount: 0, processingCount: 0, pendingCount: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll summary", error: error.message });
  }
};
// Void (soft-delete) a payroll record — HR/Admin only
export const voidPayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (!["admin", "hr", "hr-manager"].includes(userRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const record = await Payroll.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Payroll record not found" });
    }
    if (!record.isActive) {
      return res.status(400).json({ success: false, message: "Payroll record is already voided" });
    }
    // Prevent voiding a record that has already been paid out
    if (record.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot void a Paid payroll record. Contact a system administrator."
      });
    }

    record.isActive = false;
    record.deletedAt = new Date();
    await record.save();

    res.status(200).json({ success: true, message: "Payroll record voided successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to void payroll record", error: error.message });
  }
};
