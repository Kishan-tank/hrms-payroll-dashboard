import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getFAQs, seedFAQs } from '../controllers/helpCenterController.js';

const router = express.Router();

router.use(verifyToken);
router.get('/faqs', getFAQs);
router.post('/seed', seedFAQs);

export default router;
