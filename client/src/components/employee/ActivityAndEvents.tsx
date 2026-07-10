import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Cake, GraduationCap, PartyPopper, CheckCircle2, DollarSign, Star, Sparkles } from 'lucide-react';

import type { EmployeeSummary } from '../../services/hrmsApi';

function generateActivities(summary?: EmployeeSummary | null) {
  const dynamicActivities = [];
  
  if (summary) {
    if (summary.payrollLeave.latestNetPay > 0) {
      dynamicActivities.push({
        id: 1,
        title: 'Payroll Processed',
        desc: `Salary of ₹${summary.payrollLeave.latestNetPay.toLocaleString()} has been credited`,
        time: 'Recently',
        type: 'payroll',
        icon: <DollarSign size={14} className="text-blue-400" />,
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        avatar: summary.employee.name.charAt(0).toUpperCase(),
        filter: 'Week',
      });
    }

    if (summary.payrollLeave.leavesTaken > 0) {
      dynamicActivities.push({
        id: 2,
        title: 'Leave Update',
        desc: `You have taken ${summary.payrollLeave.leavesTaken} day(s) of leave so far`,
        time: 'Recently',
        type: 'approval',
        icon: <CheckCircle2 size={14} className="text-emerald-400" />,
        color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        avatar: summary.employee.name.charAt(0).toUpperCase(),
        filter: 'Month',
      });
    }

    const completedGoals = summary.productivity?.goals?.filter(g => g.progress === 100).length || 0;
    if (completedGoals > 0) {
      dynamicActivities.push({
        id: 3,
        title: 'Goal Achievement',
        desc: `Great job! You have completed ${completedGoals} goal(s)`,
        time: 'Recently',
        type: 'learning',
        icon: <Star size={14} className="text-purple-400" />,
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        avatar: summary.employee.name.charAt(0).toUpperCase(),
        filter: 'Month',
      });
    }
  }

  // Fallbacks if data is missing or to fill up the feed
  if (dynamicActivities.length === 0) {
    dynamicActivities.push({
      id: 4,
      title: 'Profile Active',
      desc: 'Your employee profile is fully set up and active',
      time: 'Recently',
      type: 'approval',
      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      avatar: 'HR',
      filter: 'Month',
    });
  }

  dynamicActivities.push({
    id: 5,
    title: 'Company Policy Update',
    desc: 'New guidelines for WFH added to Handbook',
    time: '2 days ago',
    type: 'learning',
    icon: <Sparkles size={14} className="text-yellow-400" />,
    color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    avatar: 'HR',
    filter: 'Month',
  });

  return dynamicActivities;
}

const events = [
  { id: 1, title: 'Independence Day', date: '15 Aug 2026', type: 'Holiday', daysLeft: 61, icon: <PartyPopper size={18} className="text-orange-500 dark:text-orange-400" />, bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-500/20 dark:to-orange-500/5', border: 'border-orange-200 dark:border-orange-500/20' },
  { id: 2, title: 'Rahul\'s Birthday', date: '22 Aug 2026', type: 'Birthday', daysLeft: 68, icon: <Cake size={18} className="text-pink-500 dark:text-pink-400" />, bg: 'bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-500/20 dark:to-pink-500/5', border: 'border-pink-200 dark:border-pink-500/20' },
  { id: 3, title: 'Work Anniversary', date: '01 Sep 2026', type: 'Anniversary', daysLeft: 78, icon: <Calendar size={18} className="text-blue-500 dark:text-blue-400" />, bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-500/5', border: 'border-blue-200 dark:border-blue-500/20' },
  { id: 4, title: 'Security Training', date: '05 Sep 2026', type: 'Training', daysLeft: 82, icon: <GraduationCap size={18} className="text-purple-500 dark:text-purple-400" />, bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/20 dark:to-purple-500/5', border: 'border-purple-200 dark:border-purple-500/20' },
];

export default function ActivityAndEvents({ summary }: { summary?: EmployeeSummary | null }) {
  const [filter, setFilter] = useState<'Today' | 'Week' | 'Month'>('Month');
  
  const activities = generateActivities(summary);

  const filteredActivities = activities.filter(a => {
    if (filter === 'Today') return a.filter === 'Today';
    if (filter === 'Week') return ['Today', 'Week'].includes(a.filter);
    return true; // Month covers all
  });

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* LEFT: Premium Linear-inspired Timeline */}
      <div className="flex h-[380px] flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-xl hover:border-slate-300 transition-colors duration-300 relative overflow-hidden dark:border-white/5 dark:bg-[#0B1121] dark:hover:border-slate-700/50">
        {/* Glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full opacity-30"
             style={{ background: "radial-gradient(circle, rgba(148,163,184,0.15) 0%, transparent 65%)" }} />

        <div className="z-10 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
          <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Recent Activity</h2>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-inner dark:border-white/5 dark:bg-white/5">
            {(['Today', 'Week', 'Month'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${tab === filter ? 'bg-white text-slate-800 shadow-sm border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.02]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar z-10">
          <div className="relative space-y-3 before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-100 before:to-transparent dark:before:from-white/20 dark:before:via-white/5 dark:before:to-transparent">
            <AnimatePresence mode="popLayout">
              {filteredActivities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pl-10 pt-4 text-[13px] font-semibold text-slate-500"
                >
                  No recent activity for this period.
                </motion.div>
              ) : (
                filteredActivities.map((act, i) => (
                  <motion.div 
                    layout
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                    className="relative pl-10 group"
                  >
                    {/* Timeline dot / Avatar */}
                    <div className="absolute left-[-1px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-[6px] ring-white transition-transform duration-300 group-hover:scale-110 dark:bg-[#0B1121] dark:ring-[#0B1121]">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm bg-slate-100 text-[10px] font-black text-slate-700 border-slate-200 relative dark:bg-slate-800 dark:text-white dark:border-white/10`}>
                        {act.avatar}
                        <div className={`absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ${act.color.split(' ')[0].replace('500/10', '100').replace('bg-', 'bg-')} border border-white dark:border-[#0B1121] dark:${act.color.split(' ')[0]}`}>
                          <div className="scale-75 text-[10px] [&>svg]:!stroke-[3px]">{act.icon}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 rounded-xl p-2.5 transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100 hover:-translate-y-0.5 dark:hover:bg-white/[0.02] dark:hover:border-white/5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800 transition-colors group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">{act.title}</h3>
                        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{act.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">{act.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT: Upcoming Events */}
      <div className="flex h-[380px] flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-xl relative overflow-hidden hover:border-orange-500/30 transition-colors duration-300 group/events dark:border-white/5 dark:bg-[#0B1121] dark:hover:border-orange-500/20">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 transition-opacity duration-500 group-hover/events:opacity-60"
             style={{ background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 65%)" }} />

        <div className="z-10 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
          <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Upcoming Events</h2>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Next 90 days</span>
        </div>

        <div className="z-10 mt-4 flex-1 space-y-2.5 overflow-y-auto pr-2 custom-scrollbar">
          {events.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
              className={`group flex items-center gap-4 rounded-[14px] border border-slate-100 bg-slate-50 p-3 transition-all duration-300 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 hover:shadow-orange-500/10 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] dark:hover:border-white/10`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${evt.bg} ${evt.border} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {evt.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-[14px] font-extrabold text-slate-800 transition-colors group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">{evt.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className={`rounded-md bg-white border border-slate-200 px-2 py-0.5 font-bold dark:bg-white/5 dark:border-white/5 ${
                    evt.type === 'Holiday' ? 'text-orange-600 dark:text-orange-400' :
                    evt.type === 'Birthday' ? 'text-pink-600 dark:text-pink-400' :
                    evt.type === 'Anniversary' ? 'text-blue-600 dark:text-blue-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`}>
                    {evt.type}
                  </span>
                  <span>·</span>
                  <span className="text-slate-500 dark:text-slate-400">{evt.date}</span>
                </div>
              </div>
              
              <div className={`flex flex-col items-center justify-center rounded-lg border px-3 py-1.5 shadow-sm transition-all duration-300 group-hover:scale-105 ${
                evt.type === 'Holiday' ? 'bg-orange-50 border-orange-200 group-hover:bg-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20 dark:group-hover:bg-orange-500/20' :
                evt.type === 'Birthday' ? 'bg-pink-50 border-pink-200 group-hover:bg-pink-100 dark:bg-pink-500/10 dark:border-pink-500/20 dark:group-hover:bg-pink-500/20' :
                evt.type === 'Anniversary' ? 'bg-blue-50 border-blue-200 group-hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:group-hover:bg-blue-500/20' :
                'bg-purple-50 border-purple-200 group-hover:bg-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 dark:group-hover:bg-purple-500/20'
              }`}>
                <div className={`text-[15px] font-black ${
                  evt.type === 'Holiday' ? 'text-orange-600 dark:text-orange-400' :
                  evt.type === 'Birthday' ? 'text-pink-600 dark:text-pink-400' :
                  evt.type === 'Anniversary' ? 'text-blue-600 dark:text-blue-400' :
                  'text-purple-600 dark:text-purple-400'
                }`}>{evt.daysLeft}d</div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mt-0.5">Left</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
