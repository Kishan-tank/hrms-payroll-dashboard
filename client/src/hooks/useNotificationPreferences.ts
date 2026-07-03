import { useState, useEffect } from 'react';

export interface NotificationPreference {
  label: string;
  desc: string;
  enabled: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationPreference[] = [
  { label: 'New leave requests', desc: 'Get notified when employees apply for leave', enabled: true },
  { label: 'Payroll processed', desc: 'Receive alerts when payroll cycle completes', enabled: true },
  { label: 'Attendance alerts', desc: 'Get notified for late arrivals or absences', enabled: false },
  { label: 'New employee joined', desc: 'Receive onboarding notifications', enabled: true },
  { label: 'Performance reviews due', desc: 'Reminders for upcoming review cycles', enabled: false },
  { label: 'System maintenance', desc: 'Platform maintenance and downtime alerts', enabled: true },
];

export function useNotificationPreferences(userId?: string) {
  const STORAGE_KEY = `hrms_notification_prefs_${userId ?? 'default'}`;

  const [notifications, setNotifications] = useState<NotificationPreference[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as NotificationPreference[];
      }
    } catch (err) {
      console.error('Failed to parse notification preferences from local storage', err);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications, STORAGE_KEY]);

  return {
    notifications,
    setNotifications,
  };
}
