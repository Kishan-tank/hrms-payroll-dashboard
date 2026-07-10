import Employee from "../models/employee.js";

// Add new employee
export const addEmployee = async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json({ success: true, employee: newEmployee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Employee ID or Email already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to add employee", error: error.message });
  }
};

// Get all employees with pagination, search and filters
export const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    if (department && department !== "All") {
      query.department = department;
    }
    
    if (status && status !== "All") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userRoleLower = req.user ? (req.user.role || "").toLowerCase() : "";
    const isHR = req.user && ["admin", "hr", "hr-manager"].includes(userRoleLower);
    const selectFields = isHR ? "" : "-basicPay -phone -joinDate -status";

    const employees = await Employee.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      employees,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employees", error: error.message });
  }
};

// Get logged-in user's employee profile
export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email }) || await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employee", error: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update employee", error: error.message });
  }
};

// Delete/Deactivate employee
export const deleteEmployee = async (req, res) => {
  try {
    // Soft delete by updating status to Inactive
    const employee = await Employee.findByIdAndUpdate(req.params.id, { status: "Inactive" }, { new: true });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, message: "Employee deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete employee", error: error.message });
  }
};

export const bulkDeactivate = async (req, res) => {
  try {
    const { employeeIds } = req.body;
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid employee IDs provided" });
    }

    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $set: { status: "Inactive" } }
    );

    res.status(200).json({ success: true, message: `${result.modifiedCount} employees deactivated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to bulk deactivate employees", error: error.message });
  }
};

export const bulkChangeDepartment = async (req, res) => {
  try {
    const { employeeIds, department } = req.body;
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0 || !department) {
      return res.status(400).json({ success: false, message: "Invalid payload provided" });
    }

    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $set: { department } }
    );

    res.status(200).json({ success: true, message: `Department updated for ${result.modifiedCount} employees` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to bulk change department", error: error.message });
  }
};
