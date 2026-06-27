import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { notificationService, ApiNotification } from '../services/hrmsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'leave' | 'payroll' | 'attendance' | 'document' | 'system';

// We keep the local Notification type compatible with the page & dropdown
export interface Notification {
  id: string;       // mapped from _id
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string; // mapped from createdAt
  link?: string | null;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearReadNotifications: () => void;
  refresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapApiToLocal(n: ApiNotification): Notification {
  return {
    id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    timestamp: n.createdAt,
    link: n.link,
  };
}

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

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getAll();
      if (res.success) {
        setNotifications(res.notifications.map(mapApiToLocal));
      }
    } catch (err) {
      // Silently fail — notifications are non-critical
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationService.markAsRead(id);
    } catch {
      // Revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      void fetchNotifications(); // Revert by re-fetching
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationService.delete(id);
    } catch {
      void fetchNotifications(); // Revert by re-fetching
    }
  }, [fetchNotifications]);

  const clearReadNotifications = useCallback(async () => {
    // Optimistic remove all read
    setNotifications((prev) => prev.filter((n) => !n.read));
    try {
      await notificationService.clearRead();
    } catch {
      void fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
        refresh: fetchNotifications,
      }}
    >
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