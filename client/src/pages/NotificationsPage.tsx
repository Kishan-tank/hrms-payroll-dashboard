import { useMemo, useState } from 'react';
import { CalendarCheck, IndianRupee, Clock, FileText, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useNotifications, formatTimestamp } from '../context/NotificationContext';
import type { NotificationType, Notification } from '../context/NotificationContext';
import EmptyState from '../components/common/EmptyState';

// ─── Icon helper ─────────────────────────────────────────────────────────────

function getIconForType(type: NotificationType) {
  switch (type) {
    case 'document':   return { icon: <FileText className="h-5 w-5" />,      color: 'text-blue-500   bg-blue-50   dark:bg-blue-500/20'   };
    case 'leave':      return { icon: <CalendarCheck className="h-5 w-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20' };
    case 'payroll':    return { icon: <IndianRupee className="h-5 w-5" />,   color: 'text-violet-500  bg-violet-50  dark:bg-violet-500/20'  };
    case 'attendance': return { icon: <Clock className="h-5 w-5" />,         color: 'text-amber-500   bg-amber-50   dark:bg-amber-500/20'   };
    case 'system':     return { icon: <Bell className="h-5 w-5" />,          color: 'text-pink-500    bg-pink-50    dark:bg-pink-500/20'     };
    default:           return { icon: <Bell className="h-5 w-5" />,          color: 'text-slate-500   bg-slate-100  dark:bg-slate-500/20'   };
  }
}

// ─── Label map ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  document:   'Document',
  leave:      'Leave',
  payroll:    'Payroll',
  attendance: 'Attendance',
  system:     'System',
};

type CombinedFilter = 'all' | 'unread' | 'approvals' | 'payroll' | 'system';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<CombinedFilter>('all');
  const navigate = useNavigate();
  const toast = useToast();

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      if (filter === 'approvals') return n.type === 'leave';
      if (filter === 'payroll') return n.type === 'payroll';
      if (filter === 'system') return n.type === 'system';
      return true;
    });
  }, [notifications, filter]);

  const filterTabs: { label: string; value: CombinedFilter }[] = [
    { label: 'All',       value: 'all' },
    { label: 'Unread',    value: 'unread' },
    { label: 'Approvals', value: 'approvals' },
    { label: 'Payroll',   value: 'payroll' },
    { label: 'System',    value: 'system' },
  ];

  const handleAction = (e: React.MouseEvent, action: string, n?: Notification) => {
    e.stopPropagation();
    if (action === 'coming_soon') {
      toast.info('Action endpoint coming soon');
      return;
    }
    if (action === 'mark_read' && n) {
      markAsRead(n.id);
      return;
    }
    navigate(action);
  };

  const renderActions = (n: Notification) => {
    switch (n.type) {
      case 'leave':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={(e) => handleAction(e, '/leave', n)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">View Leave</button>
            <button onClick={(e) => handleAction(e, 'coming_soon', n)} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400">Approve</button>
            <button onClick={(e) => handleAction(e, 'coming_soon', n)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400">Reject</button>
          </div>
        );
      case 'payroll':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={(e) => handleAction(e, '/payroll', n)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">View Payroll</button>
            <button onClick={(e) => handleAction(e, '/payroll', n)} className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400">View Payslip</button>
          </div>
        );
      case 'document':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={(e) => handleAction(e, '/documents', n)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">Open Documents</button>
          </div>
        );
      case 'attendance':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={(e) => handleAction(e, '/attendance', n)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">Open Attendance</button>
          </div>
        );
      case 'system':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={(e) => handleAction(e, 'mark_read', n)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">Mark as read</button>
          </div>
        );
      default:
        return null;
    }
  };

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
        <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                filter === tab.value
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
              {tab.value === 'unread' && unreadCount > 0 && (
                <span className={`ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold ${filter === tab.value ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-blue-500 text-white'}`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notification List ── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title="No notifications"
            description="No notifications match your current filters. Try adjusting the read status or type filter."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h2 className="font-bold text-slate-950 dark:text-white">
                Notifications
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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => markAsRead(n.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') markAsRead(n.id); }}
                      className="group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer"
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
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-block rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                            {TYPE_LABELS[n.type] ?? n.type}
                          </span>
                        </div>
                        {renderActions(n)}
                      </span>

                      {/* Unread dot */}
                      {!n.read && (
                        <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                      )}
                    </div>
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
