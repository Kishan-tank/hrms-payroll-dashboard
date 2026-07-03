import { useMemo, useState, type MouseEvent } from 'react';
import { CalendarCheck, IndianRupee, Clock, FileText, Bell, CheckCheck, Inbox, Mail, CheckCircle, Coins, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useNotifications, formatTimestamp } from '../context/NotificationContext';
import type { NotificationType, Notification } from '../context/NotificationContext';
import EmptyState from '../components/common/EmptyState';
import { leaveService } from '../services/hrmsApi';

// ─── Icon helper ─────────────────────────────────────────────────────────────

function getIconForType(type: NotificationType) {
  switch (type) {
    case 'document': return { icon: <FileText className="h-5 w-5" />, color: 'text-blue-500   bg-blue-50   dark:bg-blue-500/20' };
    case 'leave': return { icon: <CalendarCheck className="h-5 w-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20' };
    case 'payroll': return { icon: <IndianRupee className="h-5 w-5" />, color: 'text-violet-500  bg-violet-50  dark:bg-violet-500/20' };
    case 'attendance': return { icon: <Clock className="h-5 w-5" />, color: 'text-amber-500   bg-amber-50   dark:bg-amber-500/20' };
    case 'system': return { icon: <Bell className="h-5 w-5" />, color: 'text-pink-500    bg-pink-50    dark:bg-pink-500/20' };
    default: return { icon: <Bell className="h-5 w-5" />, color: 'text-slate-500   bg-slate-100  dark:bg-slate-500/20' };
  }
}

// ─── Label map ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  document: 'Document',
  leave: 'Leave',
  payroll: 'Payroll',
  attendance: 'Attendance',
  system: 'System',
};

type CombinedFilter = 'all' | 'unread' | 'approvals' | 'payroll' | 'system';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
<<<<<<< HEAD
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearReadNotifications, dismiss } = useNotifications();
=======
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
>>>>>>> origin/main
  const [filter, setFilter] = useState<CombinedFilter>('all');
  const [pendingConfirm, setPendingConfirm] = useState<{ notifId: string; action: 'Approved' | 'Rejected' } | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
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

  const filterTabs = [
    { label: 'All',       value: 'all',       icon: Inbox },
    { label: 'Unread',    value: 'unread',    icon: Mail },
    { label: 'Approvals', value: 'approvals', icon: CheckCircle },
    { label: 'Payroll',   value: 'payroll',   icon: Coins },
    { label: 'System',    value: 'system',    icon: Monitor },
  ] as const;

  function requestLeaveAction(
    e: MouseEvent<HTMLButtonElement>,
    notifId: string,
    action: 'Approved' | 'Rejected'
  ) {
    e.stopPropagation();
    // Toggle off if already showing confirm for same notification + action
    if (pendingConfirm?.notifId === notifId && pendingConfirm.action === action) {
      setPendingConfirm(null);
      return;
    }
    setPendingConfirm({ notifId, action });
  }

  async function confirmLeaveAction() {
    if (!pendingConfirm) return;
    const { notifId, action } = pendingConfirm;
    const notif = notifications.find((n) => n.id === notifId);
    if (!notif?.leaveId) {
      toast.info('No leave record linked to this notification');
      setPendingConfirm(null);
      return;
    }
    setProcessingIds((prev) => new Set(prev).add(notifId));
    setPendingConfirm(null);
    try {
      await leaveService.updateStatus(notif.leaveId, action);
      markAsRead(notifId);
      toast.success(`Leave request ${action.toLowerCase()}.`);
      // Brief delay so user sees the success state before dismiss
      setTimeout(() => deleteNotification(notifId), 800);
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action.toLowerCase()} leave request`);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(notifId);
        return next;
      });
    }
  }

  function handleSimpleAction(e: MouseEvent<HTMLButtonElement>, action: string, n: Notification) {
    e.stopPropagation();
    if (action === 'mark_read') {
      markAsRead(n.id);
      return;
    }
    markAsRead(n.id);
    navigate(action);
  }

  const renderActions = (n: Notification) => {
    const isProcessing = processingIds.has(n.id);
    const isConfirming = pendingConfirm?.notifId === n.id;

    switch (n.type) {
      case 'leave':
        return (
          <div className="mt-3 space-y-2">
            {/* Inline confirm banner */}
            {isConfirming && (
              <div
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Confirm {pendingConfirm!.action.toLowerCase()} this leave request?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void confirmLeaveAction(); }}
                    className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-amber-600"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPendingConfirm(null); }}
                    className="rounded-lg border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:text-amber-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(e) => handleSimpleAction(e, '/leave', n)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                View Leave
              </button>
              {/* Only show Approve/Reject if notification has a leaveId */}
              {n.leaveId && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => requestLeaveAction(e, n.id, 'Approved')}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400"
                  >
                    {isProcessing ? (
                      <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                    ) : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => requestLeaveAction(e, n.id, 'Rejected')}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400"
                  >
                    {isProcessing ? (
                      <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                    ) : 'Reject'}
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => handleSimpleAction(e, '/payroll', n)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              View Payslip
            </button>
          </div>
        );

      case 'document':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => handleSimpleAction(e, '/documents', n)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Open Documents
            </button>
          </div>
        );

      case 'attendance':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => handleSimpleAction(e, '/attendance', n)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Open Attendance
            </button>
          </div>
        );

      case 'system':
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Mark as read
            </button>
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
          <div className="flex items-center gap-2 self-start flex-wrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
            )}
            {notifications.some(n => n.read) && (
              <button
                type="button"
                onClick={clearReadNotifications}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value as CombinedFilter)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    filter === tab.value
                      ? 'bg-slate-900 text-white shadow-md dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-none'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                  {tab.value === 'unread' && unreadCount > 0 && (
                    <span className={`ml-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${filter === tab.value ? 'bg-white/20 text-white dark:bg-blue-500/20 dark:text-blue-400' : 'bg-blue-500 text-white'}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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
                    className={`${index < filtered.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''} ${!n.read ? 'bg-blue-50/40 dark:bg-blue-500/[0.06]' : ''} ${n.priority === 'high' ? 'border-l-2 border-l-amber-400 dark:border-l-amber-500' : ''}`}
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
                          {n.priority === 'high' && (
                            <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                              High Priority
                            </span>
                          )}
                        </div>
                        {renderActions(n)}
                      </span>

                      {/* Right side actions: unread dot + delete */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Delete notification"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
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
