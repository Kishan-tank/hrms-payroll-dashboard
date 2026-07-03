import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
