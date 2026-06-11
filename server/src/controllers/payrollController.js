import Payroll from "../models/payroll.js";
import Employee from "../models/employee.js";

// Run payroll for a specific month/year
export const runPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required" });
    }

    // Check if payroll already run for this period
    const existingPayroll = await Payroll.findOne({ month, year });
    if (existingPayroll) {
      return res.status(400).json({ success: false, message: `Payroll for ${month} ${year} already exists` });
    }

    // Fetch all active employees
    const activeEmployees = await Employee.find({ status: "Active" });

    if (activeEmployees.length === 0) {
      return res.status(400).json({ success: false, message: "No active employees found to run payroll" });
    }

    const payrollRecords = activeEmployees.map(emp => {
      // Simplified deductions logic (e.g., 10% tax/provident fund)
      const deductions = Math.round(emp.basicPay * 0.10);
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
    const { month, year, status } = req.query;

    const query = {};
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

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
    
    const query = {};
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
