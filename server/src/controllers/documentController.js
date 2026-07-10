import Document from "../models/Document.js";
import path from "path";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, type, employeeId } = req.body;
    
    // Validate type against enum if needed, here we just save
    const newDoc = await Document.create({
      employeeId: employeeId || null, // Optional, can be global policy if null
      title: title || req.file.originalname,
      type: type || 'Other',
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    res.status(201).json({ success: true, document: newDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload document", error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.query;
    let query = {};
    
    // If an employee is logged in, show their docs + global policies. 
    // If HR/Admin is logged in, they can see all or filter by employee.
    if ((req.user.role || '').toLowerCase() === 'employee') {
      query = { $or: [{ employeeId: req.user.id }, { type: 'Policy' }] };
    } else if (employeeId) {
      query.employeeId = employeeId;
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });
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
    
    await document.deleteOne();
    // (Optional) Remove file from disk using fs.unlink
    res.status(200).json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete document", error: error.message });
  }
};
