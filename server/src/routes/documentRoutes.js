import express from "express";
import multer from "multer";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getDocuments,
  deleteDocument
} from "../controllers/documentController.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.use(verifyToken); // Requires login

router.get("/", getDocuments);
// Allow HR/Admin to upload and delete documents
router.post("/upload", requireRole("hr", "admin", "hr-manager"), upload.single('file'), uploadDocument);
router.delete("/:id", requireRole("hr", "admin", "hr-manager"), deleteDocument);

export default router;
