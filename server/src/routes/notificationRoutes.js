import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require a valid JWT
router.use(verifyToken);

// ── Any logged-in user ────────────────────────────────────────────────────────
router.get('/', getNotifications);                     // GET  /api/notifications
router.put('/mark-all-read', markAllAsRead);           // PUT  /api/notifications/mark-all-read
router.delete('/clear-read', clearReadNotifications);  // DELETE /api/notifications/clear-read
router.put('/:id/read', markAsRead);                   // PUT  /api/notifications/:id/read
router.delete('/:id', deleteNotification);             // DELETE /api/notifications/:id

// ── HR Manager only ───────────────────────────────────────────────────────────
router.post('/', requireRole('hr-manager'), createNotification); // POST /api/notifications

export default router;
