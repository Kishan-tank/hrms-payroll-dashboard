import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import CommandPalette from './common/CommandPalette';

function useLiveTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}
import ThemeToggle from './common/ThemeToggle';
import NotificationDropdown from './common/NotificationDropdown';

interface NavbarProps {
  title: string;
  userName?: string;
  userRole?: string;
}

/* ── tiny svg helpers ─────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
    </svg>
  );
}


export default function Navbar({ title, userName, userRole }: NavbarProps) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const rawDisplayName = user?.name ?? userName ?? 'User';
  const displayName = rawDisplayName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const normalizedRole = user?.role?.toLowerCase() || '';
  const fallbackRole = ['hr-manager', 'hr manager', 'hr', 'manager'].includes(normalizedRole) ? 'HR Manager' : 'Employee';
  const displayRole = userRole || fallbackRole;

  const now = useLiveTime();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  /* Ctrl+K shortcut */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <header
        className="sticky top-0 z-40 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/80 px-4 pl-6 lg:pl-8 backdrop-blur-xl transition-colors duration-300 sm:px-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:border-white/5 dark:bg-slate-950/70 dark:shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
      >
        {/* SR-only page title */}
        <div className="sr-only"><h1>{title}</h1></div>

        {/* ── Search / Command Palette trigger ── */}
        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          className="group flex h-12 flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-slate-800 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-100 hover:border-blue-500/30 focus:border-blue-500/30 focus:outline-none focus:shadow-[0_0_0_4px_rgba(59,130,246,.12)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] md:max-w-[520px] xl:max-w-[600px]"
        >
          <span className="text-slate-400 transition-all duration-300 group-hover:text-blue-500 group-focus:text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] group-focus:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:group-hover:text-blue-400 dark:group-focus:text-blue-400 dark:group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:group-focus:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"><SearchIcon /></span>
          <span className="flex-1 truncate text-[13px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis tracking-wide dark:text-slate-400">Search attendance, leaves, payslips...</span>
          <span className="hidden items-center gap-1 text-slate-400 transition-colors group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 sm:flex">
            <kbd className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold dark:border-white/10 dark:bg-white/5">⌘ K</kbd>
          </span>
        </button>

        {/* ── Right actions ── */}
        <div className="ml-auto flex items-center gap-2">
          
          <div className="hidden h-10 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur-md sm:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <span className="text-slate-900 dark:text-white">{timeStr}</span>
            <span className="h-3 w-px bg-slate-300 dark:bg-white/20" />
            <span className="text-slate-500 dark:text-slate-400">{dateStr}</span>
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowNotifications(true); setShowProfile(false); }}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-50/50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(59,130,246,0.6)] ring-2 ring-white dark:ring-slate-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown open={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowProfile((v) => !v); setShowNotifications(false); }}
              className="group flex h-10 items-center gap-2 rounded-xl px-2 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-100 dark:hover:bg-white/8"
            >
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff`} alt="Avatar" className="h-8 w-8 rounded-full object-cover shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.4)] dark:shadow-[0_0_12px_rgba(37,99,235,0.4)] dark:group-hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]" />
              <span className="text-slate-400 transition-colors group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"><ChevronIcon /></span>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_20px_80px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{displayRole}</p>
                </div>
                {[
                  ['My Profile', '/profile'],
                  ['Documents',  '/documents'],
                  ['Settings',   '/settings'],
                ].map(([label, path]) => (
                  <button key={label} type="button" onClick={() => navigate(path)}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
                    {label}
                  </button>
                ))}
                <div className="mt-1 border-t border-slate-100 pt-1 dark:border-white/10">
                  <button type="button" onClick={logout} className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
