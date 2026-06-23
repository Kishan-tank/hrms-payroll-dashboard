import { useState, useEffect } from 'react';
import {
  MapPin, Calendar, FileText, Eye, Award, Briefcase,
  UserCircle, Target, Zap, CheckCircle2, BarChart3,
  LogIn, Clock3, Coffee, LogOut,
  Flame, Wallet, Palmtree, Building, Sparkles
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import type { EmployeeSummary } from '../../services/hrmsApi';

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircularProgress({
  value, size = 64, strokeWidth = 5, color, label, sublabel,
}: {
  value: number; size?: number; strokeWidth?: number;
  color: string; label: string; sublabel: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [cur, setCur] = useState(0);
  useEffect(() => { const t = setTimeout(() => setCur(value), 150); return () => clearTimeout(t); }, [value]);
  const offset = circumference - (cur / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative group cursor-default">
        <div className="absolute inset-0 rounded-full blur-md opacity-30 transition-opacity group-hover:opacity-60"
          style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-slate-200 dark:stroke-white/10" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 5px ${color}99)`, transition: 'stroke-dashoffset 800ms ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] font-extrabold text-slate-900 leading-none dark:text-white">{value}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-slate-700 leading-none dark:text-slate-200">{label}</span>
        <span className="text-[8px] font-medium uppercase tracking-widest text-slate-500 mt-0.5 dark:text-slate-500">{sublabel}</span>
      </div>
    </div>
  );
}

// ─── Live Time ────────────────────────────────────────────────────────────────
function useLiveTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return time;
}
function getGreeting(h: number) {
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const statusCards = [
  { label: "Today's Focus",    value: 'Sprint Review', icon: <Target size={14} />, color: 'text-blue-500 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10'   },
  { label: 'Attendance Streak',value: '27 Days',       icon: <Flame size={14} />, color: 'text-orange-500 dark:text-orange-400',  bg: 'bg-orange-50 dark:bg-orange-500/10' },
  { label: 'Next Salary',      value: '1 July',        icon: <Wallet size={14} />, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10'},
  { label: 'Leave Remaining',  value: '18 Days',       icon: <Palmtree size={14} />, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10'},
  { label: 'Office Location',  value: 'Ahmedabad',     icon: <Building size={14} />, color: 'text-purple-500 dark:text-purple-400',  bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { label: 'Employment',       value: 'Full-Time',     icon: <Briefcase size={14} />, color: 'text-slate-400 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-white/5'       },
];

const sprintPills = [
  { icon: Zap,         label: 'Sprint',        value: 'Sprint 42', color: 'text-blue-500 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-500/20',    bg: 'bg-blue-50 dark:bg-blue-500/10'    },
  { icon: BarChart3,   label: 'Quarter Goal',  value: '63%',       color: 'text-purple-500 dark:text-purple-400',  border: 'border-purple-200 dark:border-purple-500/20',  bg: 'bg-purple-50 dark:bg-purple-500/10'  },
  { icon: CheckCircle2,label: "Today's Tasks", value: '4 Tasks',   color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
];

const profileDetails = [
  { icon: Briefcase,    label: 'Experience',         value: '2 Years',          color: 'text-slate-800 dark:text-slate-200'   },
  { icon: Target,       label: 'Current Project',    value: 'HRMSPro Frontend', color: 'text-slate-800 dark:text-slate-200'   },
  { icon: UserCircle,   label: 'Manager',            value: 'Priya Sharma',     color: 'text-slate-800 dark:text-slate-200'   },
  { icon: FileText,     label: 'Docs Verified',      value: '100%',             color: 'text-emerald-500 dark:text-emerald-400' },
  { icon: Award,        label: 'Last Review',        value: 'Excellent',        color: 'text-blue-500 dark:text-blue-400'    },
  { icon: CheckCircle2, label: 'Profile Completion', value: '98%',              color: 'text-purple-500 dark:text-purple-400'  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmployeeHero({ onViewProfile, summary }: { onViewProfile?: () => void; summary?: EmployeeSummary | null }) {
  const { user } = useAuthContext();
  const now = useLiveTime();
  const firstName = (user?.name ?? 'Employee').split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  const currentStatusCards = statusCards.map(card => {
    if (card.label === 'Leave Remaining' && summary) {
      return { ...card, value: `${summary.payrollLeave.leaveBalance} Days` };
    }
    return card;
  });

  return (
    <div
      className="w-full relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-[360px] w-[360px] rounded-full blur-[100px] opacity-[0.18]"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px] opacity-[0.15]"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute -right-16 -top-12 h-[260px] w-[260px] rounded-full blur-[90px] opacity-[0.12]"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)' }} />
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
           style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="relative z-10 flex flex-col lg:flex-row">

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-1 flex-col justify-between p-4 lg:p-5 min-w-0">

          {/* Row 1: Avatar + Greeting */}
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-2xl text-[30px] font-extrabold text-blue-600 bg-blue-50 dark:text-blue-500 dark:bg-blue-500/10">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-[#0b1121]"
                   style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }}>
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                {getGreeting(now.getHours())}, <span className="capitalize">{firstName}</span>{' '}
                <span className="inline-block"><Sparkles size={20} className="text-yellow-500 animate-pulse inline pb-1 dark:text-yellow-400" /></span>
              </h1>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300">
                  {summary?.employee?.role || 'Employee'}
                </span>
                <span className="text-slate-300 text-[11px] dark:text-slate-600">·</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin size={11} className="text-blue-500 shrink-0 dark:text-blue-400" />
                  {summary?.employee?.department || 'General'} Dept
                </div>
                <span className="text-slate-300 text-[11px] dark:text-slate-600">·</span>
                <span className="text-[11px] text-slate-500">Active</span>
                <span className="text-slate-300 text-[11px] dark:text-slate-600">·</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar size={10} className="shrink-0" />
                  Since 2024
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Status Cards */}
          <motion.div
            className="grid grid-cols-3 gap-1.5 mb-2"
            initial="hidden" animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          >
            {currentStatusCards.map((card, i) => (
              <motion.div key={i}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }}
                className={`group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 cursor-default
                            transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/[0.06] dark:bg-transparent dark:hover:border-white/[0.12] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${card.bg} text-[13px] transition-transform group-hover:scale-110`}>
                  {card.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5 dark:text-slate-500">{card.label}</span>
                  <span className={`text-[11.5px] font-bold leading-tight truncate ${card.color}`}>{card.value}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Row 3: Sprint Pills */}
          <motion.div
            className="flex flex-wrap gap-1.5 mb-2"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35, ease: 'easeOut' }}
          >
            {sprintPills.map((pill, i) => (
              <div key={i}
                className={`flex items-center gap-1.5 rounded-lg border ${pill.border} ${pill.bg} px-2.5 py-1
                            transition-all duration-300 hover:-translate-y-0.5 cursor-default`}
              >
                <pill.icon size={10} className={`${pill.color} shrink-0`} />
                <span className="text-[9.5px] font-medium text-slate-500 whitespace-nowrap dark:text-slate-400">{pill.label}:</span>
                <span className={`text-[9.5px] font-extrabold whitespace-nowrap ${pill.color}`}>{pill.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Row 4: Workday Strip */}
          <motion.div
            className="flex flex-wrap items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.35, ease: 'easeOut' }}
          >
            {/* Label */}
            <div className="flex items-center gap-1.5 border-r border-slate-100 px-3 py-2 shrink-0 dark:border-white/[0.08]">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse dark:bg-emerald-400"
                   style={{ boxShadow: '0 0 6px rgba(52,211,153,0.7)' }} />
              <span className="text-[8.5px] font-extrabold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Workday</span>
            </div>
            {/* Check-in */}
            <div className="flex flex-1 justify-center items-center gap-1.5 border-r border-slate-100 px-3 py-2 cursor-default hover:bg-slate-50 transition-colors dark:border-white/[0.06] dark:hover:bg-white/[0.04]">
              <LogIn size={10} className="text-emerald-500 shrink-0 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-500 leading-none dark:text-slate-600">Checked In</span>
                <span className="text-[10.5px] font-bold text-emerald-500 leading-tight dark:text-emerald-400">09:12 AM</span>
              </div>
            </div>
            {/* Today */}
            <div className="flex flex-1 justify-center items-center gap-1.5 border-r border-slate-100 px-3 py-2 cursor-default hover:bg-slate-50 transition-colors dark:border-white/[0.06] dark:hover:bg-white/[0.04]">
              <Clock3 size={10} className="text-blue-500 shrink-0 dark:text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-500 leading-none dark:text-slate-600">Today</span>
                <span className="text-[10.5px] font-bold text-blue-500 leading-tight dark:text-blue-400">7h 20m</span>
              </div>
            </div>
            {/* Next Break */}
            <div className="flex flex-1 justify-center items-center gap-1.5 border-r border-slate-100 px-3 py-2 cursor-default hover:bg-slate-50 transition-colors dark:border-white/[0.06] dark:hover:bg-white/[0.04]">
              <Coffee size={10} className="text-amber-500 shrink-0 dark:text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-500 leading-none dark:text-slate-600">Next Break</span>
                <span className="text-[10.5px] font-bold text-amber-500 leading-tight dark:text-amber-400">04:30 PM</span>
              </div>
            </div>
            {/* Shift Ends */}
            <div className="flex flex-1 justify-center items-center gap-1.5 px-3 py-2 cursor-default hover:bg-slate-50 transition-colors dark:hover:bg-white/[0.04]">
              <LogOut size={10} className="text-slate-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-500 leading-none dark:text-slate-600">Shift Ends</span>
                <span className="text-[10.5px] font-bold text-slate-700 leading-tight dark:text-slate-300">06:00 PM</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Vertical divider (desktop only) ── */}
        <div className="hidden lg:block w-px my-4 shrink-0"
             style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.08) 80%, transparent)' }} />

        {/* ── RIGHT PANEL — Profile Card ── */}
        <div className="relative flex w-full lg:w-[285px] shrink-0 flex-col justify-between p-4 lg:p-5">
          {/* Inner glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-[160px] w-[160px] opacity-25 blur-[50px]"
               style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)' }} />

          {/* Score Rings */}
          <div className="relative z-10 flex items-center justify-around rounded-xl border border-slate-200 bg-white py-2 px-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <CircularProgress value={summary?.performance?.score || 0} color="#3b82f6" label="Performance" sublabel="Score" />
            <div className="h-10 w-px bg-slate-200 dark:bg-transparent" style={{ background: 'linear-gradient(180deg, transparent, currentColor, transparent)' }} />
            <CircularProgress value={94} color="#8b5cf6" label="Attendance" sublabel="Score" />
          </div>

          {/* Detail List */}
          <div className="relative z-10 flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
            {profileDetails.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                  <d.icon size={11} className="shrink-0" />
                  <span className="text-[10.5px] truncate">{d.label}</span>
                </div>
                <span className={`text-[10.5px] font-semibold shrink-0 ${d.color}`}>{d.value}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex gap-2">
            <button
              onClick={onViewProfile}
              className="flex h-8 flex-[2] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-[10.5px] font-bold text-white
                         transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 3px 12px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.12)' }}
            >
              <Eye size={11} className="shrink-0" />
              View Profile
            </button>
            <button className="flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200
                               bg-slate-50 text-[10.5px] font-bold text-slate-600 min-w-[90px]
                               transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white">
              <FileText size={11} className="shrink-0" />
              Documents
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
