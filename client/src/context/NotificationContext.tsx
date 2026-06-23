import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'leave' | 'payroll' | 'attendance' | 'document' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string; // ISO string
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    type: 'leave',
    title: 'Leave Approved',
    message: 'Your Annual Vacation leave request for Jun 12–13 has been approved.',
    read: false,
    timestamp: minsAgo(12),
  },
  {
    id: 'n-002',
    type: 'payroll',
    title: 'Payslip Generated',
    message: 'Your payslip for June 2026 is ready. Tap to download.',
    read: false,
    timestamp: hoursAgo(1),
  },
  {
    id: 'n-003',
    type: 'document',
    title: 'Document Uploaded',
    message: 'A new tax document has been uploaded to your profile.',
    read: false,
    timestamp: hoursAgo(2),
  },
  {
    id: 'n-004',
    type: 'attendance',
    title: 'Late Check-In Flagged',
    message: 'Your check-in on Jun 10 was recorded at 09:45 AM. Please add a remark.',
    read: false,
    timestamp: hoursAgo(5),
  },
  {
    id: 'n-005',
    type: 'system',
    title: 'System Maintenance',
    message: 'HRMSPro will be down for maintenance on Jul 1 from 02:00 AM to 04:00 AM.',
    read: false,
    timestamp: hoursAgo(8),
  },
  {
    id: 'n-006',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your profile information was successfully updated.',
    read: true,
    timestamp: daysAgo(1),
  },
  {
    id: 'n-007',
    type: 'payroll',
    title: 'Payroll Processing',
    message: 'May 2026 payroll has been processed. Net pay credited to your account.',
    read: true,
    timestamp: daysAgo(2),
  },
  {
    id: 'n-008',
    type: 'leave',
    title: 'Leave Balance Reset',
    message: 'Your annual leave balance has been reset for FY 2026–27.',
    read: true,
    timestamp: daysAgo(5),
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
