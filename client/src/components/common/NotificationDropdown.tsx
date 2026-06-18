import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CalendarCheck, IndianRupee, Clock, FileText, Bell } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'employee' | 'leave' | 'payroll' | 'attendance' | 'policy';
  text: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', type: 'leave', text: 'Leave Approved: Annual Vacation', time: '12m ago', unread: true },
  { id: '2', type: 'payroll', text: 'Payslip Generated for August', time: '1h ago', unread: true },
  { id: '3', type: 'employee', text: 'Training Assigned: Security 101', time: '2h ago', unread: true },
  { id: '4', type: 'policy', text: 'Goal Completed: Q3 Deliverables', time: '5h ago', unread: false },
  { id: '5', type: 'employee', text: 'Profile Updated Successfully', time: '1d ago', unread: false },
];

function getIconForType(type: string) {
  switch (type) {
    case 'employee': return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'leave': return <CalendarCheck className="h-5 w-5 text-emerald-500" />;
    case 'payroll': return <IndianRupee className="h-5 w-5 text-violet-500" />;
    case 'attendance': return <Clock className="h-5 w-5 text-amber-500" />;
    case 'policy': return <FileText className="h-5 w-5 text-pink-500" />;
    default: return <Bell className="h-5 w-5 text-slate-500" />;
  }
}

export default function NotificationDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => n.unread).length;

  const displayed = notifications.filter(n => filter === 'all' ? true : n.unread);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 py-2 shadow-[0_20px_80px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1121]/95 dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
              <h3 className="text-[15px] font-extrabold tracking-wide text-slate-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-5 border-b border-slate-100 px-5 pt-3 dark:border-white/5">
              <button
                onClick={() => setFilter('all')}
                className={`border-b-2 pb-2 text-[12px] font-extrabold uppercase tracking-wider transition-colors ${filter === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`border-b-2 pb-2 text-[12px] font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${filter === 'unread'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                Unread {unreadCount > 0 && <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">{unreadCount}</span>}
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto py-2 custom-scrollbar">
              {displayed.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-2xl shadow-inner">🎉</div>
                  <p className="text-[14px] font-bold text-slate-600 dark:text-slate-400">You're all caught up!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {displayed.map((item) => (
                    <motion.button
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => markAsRead(item.id)}
                      className={`group relative flex w-full gap-4 px-5 py-3.5 text-left transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-lg dark:hover:bg-white/[0.04] ${item.unread ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''}`}
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-[16px] shadow-sm">
                        {getIconForType(item.type)}
                      </span>
                      <span className="flex-1 min-w-0 pr-4">
                        <span className={`block text-[14px] leading-relaxed ${item.unread ? 'font-extrabold text-slate-900 dark:text-white' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                          {item.text}
                        </span>
                        <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">{item.time}</span>
                      </span>
                      {item.unread && (
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-white/5 p-3 text-center bg-slate-50/50 dark:bg-[#0B1121]/50 rounded-b-[24px]">
              <button className="text-[12px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                View all notifications →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
