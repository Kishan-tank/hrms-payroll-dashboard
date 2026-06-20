import { useMemo, useState } from 'react';
import { UserPlus, CalendarCheck, IndianRupee, Clock, FileText, Bell, CheckCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useNotifications, formatTimestamp } from '../context/NotificationContext';
import type { NotificationType } from '../context/NotificationContext';

// ─── Icon helper ─────────────────────────────────────────────────────────────

function getIconForType(type: NotificationType) {
  switch (type) {
    case 'employee':   return { icon: <UserPlus className="h-5 w-5" />,      color: 'text-blue-500   bg-blue-50   dark:bg-blue-500/20'   };
    case 'leave':      return { icon: <CalendarCheck className="h-5 w-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20' };
    case 'payroll':    return { icon: <IndianRupee className="h-5 w-5" />,   color: 'text-violet-500  bg-violet-50  dark:bg-violet-500/20'  };
    case 'attendance': return { icon: <Clock className="h-5 w-5" />,         color: 'text-amber-500   bg-amber-50   dark:bg-amber-500/20'   };
    case 'policy':     return { icon: <FileText className="h-5 w-5" />,      color: 'text-pink-500    bg-pink-50    dark:bg-pink-500/20'     };
    default:           return { icon: <Bell className="h-5 w-5" />,          color: 'text-slate-500   bg-slate-100  dark:bg-slate-500/20'   };
  }
}

// ─── Label map ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  employee:   'Employee',
  leave:      'Leave',
  payroll:    'Payroll',
  attendance: 'Attendance',
  policy:     'Policy',
};

type ReadFilter = 'all' | 'unread' | 'read';
type TypeFilter = 'all' | NotificationType;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [readFilter, setReadFilter]   = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter]   = useState<TypeFilter>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const passRead = readFilter === 'all'
        ? true
        : readFilter === 'unread'
          ? !n.read
          : n.read;
      const passType = typeFilter === 'all' ? true : n.type === typeFilter;
      return passRead && passType;
    });
  }, [notifications, readFilter, typeFilter]);

  const readFilterTabs: { label: string; value: ReadFilter }[] = [
    { label: 'All',    value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read',   value: 'read' },
  ];

  const typeFilterOptions: { label: string; value: TypeFilter }[] = [
    { label: 'All Types',  value: 'all' },
    { label: 'Leave',      value: 'leave' },
    { label: 'Payroll',    value: 'payroll' },
    { label: 'Attendance', value: 'attendance' },
    { label: 'Employee',   value: 'employee' },
    { label: 'Policy',     value: 'policy' },
  ];

  return (
    <DashboardLayout title="Notifications">
      {/* Ambient glows — dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
                : 'You\'re all caught up — no unread notifications.'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          {/* Read state tabs */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {readFilterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setReadFilter(tab.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  readFilter === tab.value
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
                {tab.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type filter dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          >
            {typeFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#111827]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Notification List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-3xl">
              🎉
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              Nothing here
            </h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              No notifications match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h2 className="font-bold text-slate-950 dark:text-white">
                {readFilter === 'all' ? 'All' : readFilter === 'unread' ? 'Unread' : 'Read'} Notifications
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                {filtered.length} item{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <ul>
              {filtered.map((n, index) => {
                const { icon, color } = getIconForType(n.type);
                return (
                  <li
                    key={n.id}
                    className={`${index < filtered.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''} ${!n.read ? 'bg-blue-50/40 dark:bg-blue-500/[0.06]' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className="group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      {/* Icon */}
                      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                        {icon}
                      </span>

                      {/* Content */}
                      <span className="flex-1 min-w-0">
                        <span className="flex items-start justify-between gap-2">
                          <span className={`block text-sm font-bold leading-snug ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            {formatTimestamp(n.timestamp)}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {n.message}
                        </span>
                        <span className="mt-1.5 inline-block rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-500">
                          {TYPE_LABELS[n.type] ?? n.type}
                        </span>
                      </span>

                      {/* Unread dot */}
                      {!n.read && (
                        <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
