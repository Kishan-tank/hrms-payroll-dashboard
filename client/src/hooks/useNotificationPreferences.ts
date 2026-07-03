
import { useLocalStorage } from './useLocalStorage';

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

  const [notifications, setNotifications] = useLocalStorage<NotificationPreference[]>(STORAGE_KEY, DEFAULT_NOTIFICATION_SETTINGS);

  return {
    notifications,
    setNotifications,
  };
}
