import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getOnboardingState,
  updateOnboardingState,
  resetOnboardingState,
} from '../controllers/onboardingController.js';
import multer from 'multer';
import path from 'path';
import {
  saveProfile,
  saveBank,
  uploadDocuments,
} from '../controllers/onboardingController.js';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

// All onboarding routes require a valid JWT
router.use(verifyToken);

router.get('/', getOnboardingState);            // GET /api/onboarding
router.put('/', updateOnboardingState);         // PUT /api/onboarding
router.post('/reset', resetOnboardingState);    // POST /api/onboarding/reset

router.post('/profile', saveProfile);
router.post('/bank', saveBank);
router.post('/documents', upload.fields([
  { name: 'govId', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]), uploadDocuments);

export default router;
