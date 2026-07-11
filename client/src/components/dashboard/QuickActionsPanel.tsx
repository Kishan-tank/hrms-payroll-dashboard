import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickActionItem {
  id: string;
  label: string;
  sub: string;
  path: string;
  accent: string;
  accentDim: string;
  gradient: string;
  icon: React.ReactNode;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UserPlusIcon({ c }: { c: string }) {
  return <svg className="h-5 w-5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" /></svg>;
}
function PlayIcon({ c }: { c: string }) {
  return <svg className="h-5 w-5" fill="none" stroke={c} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.8} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 8l6 4-6 4V8z" /></svg>;
}
function CheckCircleIcon({ c }: { c: string }) {
  return <svg className="h-5 w-5" fill="none" stroke={c} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={1.8} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 12 2 2 4-4" /></svg>;
}
function DownloadIcon({ c }: { c: string }) {
  return <svg className="h-5 w-5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>;
}
function MegaphoneIcon({ c }: { c: string }) {
  return <svg className="h-5 w-5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}

const ACTIONS: QuickActionItem[] = [
  { id: 'add', label: 'Add Employee', sub: 'Onboard new hire', path: '/employees', accent: '#3b82f6', accentDim: 'rgba(59,130,246,0.12)', gradient: 'from-blue-600 to-blue-500', icon: <UserPlusIcon c="currentColor" /> },
  { id: 'payroll', label: 'Run Payroll', sub: 'Process this cycle', path: '/payroll', accent: '#22c55e', accentDim: 'rgba(34,197,94,0.12)', gradient: 'from-emerald-600 to-green-500', icon: <PlayIcon c="currentColor" /> },
  { id: 'leave', label: 'Approve Leave', sub: '18 pending', path: '/leave', accent: '#8b5cf6', accentDim: 'rgba(139,92,246,0.12)', gradient: 'from-violet-600 to-purple-500', icon: <CheckCircleIcon c="currentColor" /> },
  { id: 'reports', label: 'Export Reports', sub: 'Download analytics', path: '/analytics', accent: '#f59e0b', accentDim: 'rgba(245,158,11,0.12)', gradient: 'from-amber-500 to-orange-400', icon: <DownloadIcon c="currentColor" /> },
  { id: 'announce', label: 'Broadcast', sub: 'Notify all staff', path: '/settings', accent: '#ec4899', accentDim: 'rgba(236,72,153,0.12)', gradient: 'from-pink-500 to-rose-400', icon: <MegaphoneIcon c="currentColor" /> },
];

export default function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Frequent HR operations</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
        {ACTIONS.map((action, idx) => (
          <motion.button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.06, duration: 0.4 }}
            className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-2 py-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              const isDark = document.documentElement.classList.contains('dark');
              el.style.background = isDark ? action.accentDim : action.accentDim.replace('0.12', '0.08');
              el.style.boxShadow = `0 8px 24px ${action.accent}20`;
              el.style.borderColor = `${action.accent}30`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = '';
              el.style.boxShadow = '';
              el.style.borderColor = '';
            }}
          >
            {/* Icon */}
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 mb-1"
              style={{ background: action.accentDim, color: action.accent }}
            >
              {action.icon}
            </span>
            <span className="text-[11px] font-bold leading-tight text-slate-600 group-hover:text-slate-900 transition-colors duration-150 dark:text-slate-400 dark:group-hover:text-white">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
