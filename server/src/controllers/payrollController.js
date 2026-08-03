import Payroll from "../models/payroll.js";
import Employee from "../models/employee.js";
import { notifyChange } from "../utils/mailer.js";

// Validate editable payroll fields
const VALID_STATUSES = ["Pending", "Processing", "Paid"];

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

    const inserted = await Payroll.insertMany(payrollRecords);

    // Audit notification for payroll run
    notifyChange({
      user: { email: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, name: "All Employees" },
      action: "PAYROLL_RUN",
      details: { month, year, recordsGenerated: inserted.length },
      actor: req.user,
    });

    res.status(201).json({ 
      success: true, 
      message: `Payroll run successfully for ${activeEmployees.length} employees`,
      recordsGenerated: inserted.length
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

    const populated = await record.populate("employeeId", "name email employeeId department");

    notifyChange({
      user: populated.employeeId || { name: "Employee" },
      action: "PAYROLL_VOID",
      details: { month: record.month, year: record.year, recordId: id },
      actor: req.user,
    });

    res.status(200).json({ success: true, message: "Payroll record voided successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to void payroll record", error: error.message });
  }
};

// PATCH /api/payroll/:id — Admin-only: edit a payroll record
export const editPayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can edit payroll records" });
    }

    const record = await Payroll.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Payroll record not found" });
    }
    if (!record.isActive) {
      return res.status(400).json({ success: false, message: "Cannot edit a voided payroll record" });
    }

    const { basicPay, deductions, netPay, status } = req.body;

    // Validate types if provided
    if (basicPay !== undefined) {
      const bp = Number(basicPay);
      if (isNaN(bp) || bp < 0) {
        return res.status(400).json({ success: false, message: "basicPay must be a non-negative number" });
      }
      record.basicPay = bp;
      // Recalculate deductions + netPay automatically if basicPay is updated
      // unless the caller is also explicitly overriding them
      if (deductions === undefined && netPay === undefined) {
        const pf = Math.round(bp * 0.12);
        const tdsRate = bp < 50000 ? 0.10 : 0.20;
        const tds = Math.round(bp * tdsRate);
        record.deductions = pf + tds;
        record.netPay = bp - record.deductions;
      }
    }

    if (deductions !== undefined) {
      const d = Number(deductions);
      if (isNaN(d) || d < 0) {
        return res.status(400).json({ success: false, message: "deductions must be a non-negative number" });
      }
      record.deductions = d;
      // Recalculate netPay if not explicitly set
      if (netPay === undefined) {
        record.netPay = record.basicPay - d;
      }
    }

    if (netPay !== undefined) {
      const np = Number(netPay);
      if (isNaN(np) || np < 0) {
        return res.status(400).json({ success: false, message: "netPay must be a non-negative number" });
      }
      record.netPay = np;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      if (status === "Paid" && !record.paidAt) {
        record.paidAt = new Date();
      }
      record.status = status;
    }

    await record.save();
    const populated = await record.populate("employeeId", "name email employeeId department");

    notifyChange({
      user: populated.employeeId || { name: "Employee" },
      action: "PAYROLL_EDIT",
      details: { month: record.month, year: record.year, basicPay: record.basicPay, deductions: record.deductions, netPay: record.netPay, status: record.status },
      actor: req.user,
    });

    res.status(200).json({ success: true, message: "Payroll record updated successfully", record: populated });

  } catch (error) {
    console.error("editPayrollRecord error:", error);
    res.status(500).json({ success: false, message: "Failed to update payroll record", error: error.message });
  }
};

// GET /api/payroll/unassigned?month=&year= — Admin/HR: employees with no payroll record for the given period
export const getUnassignedEmployees = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year are required" });
    }

    const yearNum = parseInt(year, 10);

    // All active employees
    const activeEmployees = await Employee.find({ status: { $in: ["Active", "Pending Onboarding"] }, isActive: { $ne: false } })
      .select("_id employeeId name email department role basicPay joinDate");

    if (activeEmployees.length === 0) {
      return res.status(200).json({ success: true, employees: [] });
    }

    // Employees who already have a payroll record for this period
    const assignedRecords = await Payroll.find({ month, year: yearNum, isActive: { $ne: false } })
      .select("employeeId");
    const assignedIds = new Set(assignedRecords.map(r => r.employeeId.toString()));

    // Filter out employees who already have a record
    const unassigned = activeEmployees.filter(emp => !assignedIds.has(emp._id.toString()));

    res.status(200).json({ success: true, employees: unassigned });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch unassigned employees", error: error.message });
  }
};

// POST /api/payroll/create-single — Admin/HR: create payroll record for a single employee
export const createSinglePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basicPay: overrideBasicPay, deductions: overrideDeductions } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: "employeeId, month, and year are required" });
    }

    const yearNum = parseInt(year, 10);

    // Check no existing record
    const existing = await Payroll.findOne({ employeeId, month, year: yearNum, isActive: { $ne: false } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Payroll record already exists for this employee and period" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const basicPay = overrideBasicPay !== undefined ? Number(overrideBasicPay) : (employee.basicPay || 0);
    if (!basicPay || basicPay <= 0) {
      return res.status(400).json({ success: false, message: "A valid basic pay is required to set payroll" });
    }

    let deductions;
    if (overrideDeductions !== undefined) {
      deductions = Number(overrideDeductions);
    } else {
      const pf = Math.round(basicPay * 0.12);
      const tdsRate = basicPay < 50000 ? 0.10 : 0.20;
      const tds = Math.round(basicPay * tdsRate);
      deductions = pf + tds;
    }
    const netPay = basicPay - deductions;

    const record = await Payroll.create({
      employeeId,
      month,
      year: yearNum,
      basicPay,
      deductions,
      netPay,
      status: "Pending",
      processedAt: new Date(),
    });

    const populated = await record.populate("employeeId", "name email employeeId department");

    // Also update employee's basicPay if overridden
    if (overrideBasicPay !== undefined) {
      await Employee.findByIdAndUpdate(employeeId, { basicPay: Number(overrideBasicPay) });
    }

    notifyChange({
      user: populated.employeeId || { name: "Employee" },
      action: "PAYROLL_EDIT",
      details: { month, year: yearNum, basicPay, deductions, netPay, status: "Pending", note: "First-time payroll assignment" },
      actor: req.user,
    });

    res.status(201).json({ success: true, message: "Payroll record created successfully", record: populated });
  } catch (error) {
    console.error("createSinglePayroll error:", error);
    res.status(500).json({ success: false, message: "Failed to create payroll record", error: error.message });
  }
};
