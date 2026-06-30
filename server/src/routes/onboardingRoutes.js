import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getOnboardingState,
  updateOnboardingState,
  resetOnboardingState,
} from '../controllers/onboardingController.js';

const router = express.Router();

// All onboarding routes require a valid JWT
router.use(verifyToken);

router.get('/', getOnboardingState);            // GET /api/onboarding
router.put('/', updateOnboardingState);         // PUT /api/onboarding
router.post('/reset', resetOnboardingState);    // POST /api/onboarding/reset

export default router;
