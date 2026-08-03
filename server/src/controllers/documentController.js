import Document from "../models/Document.js";
import Employee from "../models/employee.js";
import { notifyChange } from "../utils/mailer.js";
import fs from "fs";
import path from "path";

const VALID_TYPES = ['Offer Letter', 'Payslip', 'Policy', 'Other', 'ID Proof'];

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, type, employeeId } = req.body;
    const userRole = req.user?.role ? String(req.user.role).toLowerCase() : 'employee';
    const isHrOrAdmin = userRole === 'admin' || userRole.includes('hr');

    let targetEmployeeId = null;

    if (!isHrOrAdmin) {
      // Employee uploading their own document — resolve their Employee ID
      const employee = await Employee.findOne({
        $or: [{ userId: req.user.id }, { email: req.user.email }]
      });
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee profile not found" });
      }
      targetEmployeeId = employee._id;
    } else if (employeeId && employeeId.trim() !== '') {
      // HR/Admin uploading on behalf of an employee
      const employee = await Employee.findById(employeeId);
      if (employee) {
        targetEmployeeId = employee._id;
      }
    }

    const docType = VALID_TYPES.includes(type) ? type : 'Other';
    const docTitle = title && title.trim() !== '' ? title.trim() : req.file.originalname;

    const newDoc = await Document.create({
      employeeId: targetEmployeeId,
      title: docTitle,
      type: docType,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    const targetEmp = targetEmployeeId ? await Employee.findById(targetEmployeeId) : null;
    notifyChange({
      user: targetEmp || { name: "All Staff", email: process.env.ADMIN_EMAIL },
      action: "DOCUMENT_MUTATION",
      details: { fileName: newDoc.title, type: newDoc.type, actionType: "Uploaded" },
      actor: req.user,
    });

    res.status(201).json({ success: true, document: newDoc, message: "Document uploaded successfully" });

  } catch (error) {
    console.error("uploadDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to upload document", error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const userRole = req.user?.role ? String(req.user.role).toLowerCase() : 'employee';
    const isHrOrAdmin = userRole === 'admin' || userRole.includes('hr');

    let query = {};

    if (!isHrOrAdmin) {
      // Employees see: documents assigned to them, documents uploaded by them, or global policies
      const employee = await Employee.findOne({
        $or: [{ userId: req.user.id }, { email: req.user.email }]
      });
      
      const empId = employee ? employee._id : null;
      query = {
        $or: [
          { employeeId: empId },
          { uploadedBy: req.user.id },
          { type: 'Policy' },
          { employeeId: null }
        ]
      };
    } else if (employeeId && employeeId.trim() !== '') {
      query = { employeeId };
    }

    const documents = await Document.find(query)
      .populate("employeeId", "name department email")
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch documents", error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const userRole = req.user?.role ? String(req.user.role).toLowerCase() : 'employee';
    const isHrOrAdmin = userRole === 'admin' || userRole.includes('hr');

    // Permission check: Admin/HR can delete any doc; Employees can delete docs uploaded by themselves
    if (!isHrOrAdmin && String(document.uploadedBy) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only delete documents you uploaded" });
    }

    // Try to remove physical file from disk
    if (document.fileUrl) {
      const filename = document.fileUrl.replace(/^\/uploads\//, '');
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error("Failed to delete file from disk:", unlinkErr);
        }
      }
    }

    await document.deleteOne();

    const targetEmp = document.employeeId ? await Employee.findById(document.employeeId) : null;
    notifyChange({
      user: targetEmp || { name: "All Staff", email: process.env.ADMIN_EMAIL },
      action: "DOCUMENT_MUTATION",
      details: { fileName: document.title, type: document.type, actionType: "Deleted" },
      actor: req.user,
    });

    res.status(200).json({ success: true, message: "Document deleted successfully" });

  } catch (error) {
    console.error("deleteDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to delete document", error: error.message });
  }
};
