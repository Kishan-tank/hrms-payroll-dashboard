import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Employee from "../models/employee.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Normalise a raw role string coming from the request body into one
 * of the three valid enum values: 'admin' | 'hr-manager' | 'employee'.
 */
const normaliseRole = (rawRole) => {
  if (!rawRole) return "employee";
  const r = String(rawRole).toLowerCase().replace(/\s+/g, "-");
  if (r === "admin") return "admin";
  if (r.includes("hr")) return "hr-manager";
  return "employee";
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalise role before storing so it always matches the enum
    const storedRole = normaliseRole(role);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: storedRole,
      department: department || "",
      designation: designation || "",
    });

    // Automatically create a linked Employee profile so check-in/out and attendance work
    await Employee.create({
      employeeId: `EMP-${Date.now()}`,
      name,
      email,
      department: department || "General",
      role: storedRole,
      joinDate: new Date(),
      basicPay: 0, // Start at 0; set properly via payroll management
      userId: user._id
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};