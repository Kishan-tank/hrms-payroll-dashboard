import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', getSettings);
router.put('/', updateSettings);

import multer from 'multer';
import path from 'path';
import { updateProfile, changePassword, uploadPhoto } from '../controllers/settingsController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/photo', upload.single('photo'), uploadPhoto);

export default router;
