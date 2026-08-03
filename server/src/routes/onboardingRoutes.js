import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getOnboardingState,
  updateOnboardingState,
  resetOnboardingState,
  saveProfile,
  saveBank,
  uploadDocuments,
  savePolicy,
  completeOnboarding,
  getPendingReviews,
  reviewOnboarding,
} from '../controllers/onboardingController.js';

// Configure multer storage for onboarding documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = express.Router();

router.use(verifyToken);

router.get('/', getOnboardingState);                           // GET /api/onboarding
router.put('/', updateOnboardingState);                        // PUT /api/onboarding
router.post('/reset', resetOnboardingState);                   // POST /api/onboarding/reset

router.post('/profile', saveProfile);
router.post('/bank', saveBank);
router.post('/policy', savePolicy);
router.post('/complete', completeOnboarding);

router.post('/documents', upload.fields([
  { name: 'govId', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]), uploadDocuments);

// HR / Admin Review Endpoints
router.get('/pending-reviews', requireRole("hr", "admin", "hr-manager"), getPendingReviews);
router.patch('/:id/review-status', requireRole("hr", "admin", "hr-manager"), reviewOnboarding);

export default router;
