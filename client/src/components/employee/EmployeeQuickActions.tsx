import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, FileText, Download, UserCircle, Sparkles, Folder, Command } from 'lucide-react';

interface QuickActionItem {
  id: string;
  label: string;
  sub: string;
  path: string;
  accent: string;
  accentDim: string;
  gradient: string;
  icon: React.ReactNode;
  shortcut: string;
  recent?: string;
}

const ACTIONS: QuickActionItem[] = [
  { id: 'leave', label: 'Apply Leave', sub: 'Request time off', path: '/leave', accent: '#3b82f6', accentDim: 'rgba(59,130,246,0.15)', gradient: 'from-blue-600 to-blue-400', icon: <CalendarDays size={24} color="#ffffff" />, shortcut: 'L', recent: 'Used 2h ago' },
  { id: 'payslip', label: 'Payslip', sub: 'Download PDF', path: '/payroll', accent: '#10b981', accentDim: 'rgba(16,185,129,0.15)', gradient: 'from-emerald-600 to-emerald-400', icon: <Download size={24} color="#ffffff" />, shortcut: 'P', recent: 'Used Yesterday' },
  { id: 'attendance', label: 'Attendance', sub: 'View report', path: '/attendance', accent: '#8b5cf6', accentDim: 'rgba(139,92,246,0.15)', gradient: 'from-violet-600 to-purple-400', icon: <FileText size={24} color="#ffffff" />, shortcut: 'A', recent: 'Used Today' },
  { id: 'documents', label: 'Documents', sub: 'View files', path: '/documents', accent: '#f59e0b', accentDim: 'rgba(245,158,11,0.15)', gradient: 'from-amber-500 to-orange-400', icon: <Folder size={24} color="#ffffff" />, shortcut: 'D' },
  { id: 'profile', label: 'Update Profile', sub: 'Edit details', path: '/profile', accent: '#ec4899', accentDim: 'rgba(236,72,153,0.15)', gradient: 'from-pink-500 to-rose-400', icon: <UserCircle size={24} color="#ffffff" />, shortcut: 'U' },
  { id: 'help', label: 'Help Center', sub: 'Support & FAQs', path: '/help', accent: '#06b6d4', accentDim: 'rgba(6,182,212,0.15)', gradient: 'from-cyan-500 to-cyan-400', icon: <Sparkles size={24} color="#ffffff" />, shortcut: 'H' },
];

export default function EmployeeQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-xl hover:border-slate-300 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:hover:border-slate-700/50">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Quick Actions</h2>
          <p className="mt-0.5 text-[12px] font-semibold uppercase text-slate-500 tracking-wider dark:text-slate-400">Frequent employee operations</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          <Command size={12} />
          <span>Press</span>
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 border border-slate-300 text-[10px] text-slate-900 dark:bg-black/40 dark:border-white/10 dark:text-white">⌘</span>
          <span>+ Shortcut</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {ACTIONS.map((action, idx) => (
          <motion.button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05, duration: 0.4, ease: "easeOut" }}
            className="group relative flex flex-col items-center gap-2.5 rounded-[16px] border border-slate-100 bg-slate-50 p-4 text-center transition-all duration-300 hover:-translate-y-1.5 dark:border-white/5 dark:bg-white/[0.02]"
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = action.accentDim;
              el.style.boxShadow = `0 12px 32px ${action.accent}20`;
              el.style.borderColor = `${action.accent}40`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = '';
              el.style.boxShadow = '';
              el.style.borderColor = '';
            }}
          >
            {/* Shortcut Hint Overlay */}
            <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:block">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 border border-slate-200 text-[10px] font-extrabold text-slate-800 backdrop-blur-md dark:bg-white/10 dark:border-white/20 dark:text-white">
                {action.shortcut}
              </span>
            </div>

            {/* Icon */}
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-[16px] blur-md transition-opacity duration-300 group-hover:opacity-100 opacity-60"
                style={{ background: action.accent }}
              />
              <span
                className={`relative flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br ${action.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                style={{ boxShadow: `0 4px 16px ${action.accent}40` }}
              >
                {action.icon}
              </span>
            </div>

            <div className="flex flex-col gap-1 items-center">
              <span className="text-[14px] font-extrabold tracking-wide text-slate-800 transition-colors duration-200 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                {action.label}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">
                {action.sub}
              </span>
            </div>

            {/* Recent usage label */}
            {action.recent && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:-translate-y-4 group-hover:opacity-100 w-[90%] pointer-events-none">
                <div 
                  className="rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white uppercase shadow-md whitespace-nowrap text-center"
                  style={{ background: action.accent }}
                >
                  {action.recent}
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
