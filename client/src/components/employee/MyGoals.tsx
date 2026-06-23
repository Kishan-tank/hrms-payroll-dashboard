import { motion } from 'framer-motion';
import { Target, Rocket, CheckCircle2, Circle, Clock, TrendingUp } from 'lucide-react';
import type { EmployeeSummary } from '../../services/hrmsApi';

const mockQuarterGoals = [
  { id: 1, title: 'Ship Employee Portal V2', progress: 85, color: '#3b82f6', deadline: 'Jun 30', status: 'On Track' },
  { id: 2, title: 'Complete AWS Certification', progress: 40, color: '#8b5cf6', deadline: 'Jul 15', status: 'At Risk' },
  { id: 3, title: 'Reduce API Latency by 20%', progress: 100, color: '#10b981', deadline: 'May 30', status: 'Completed' },
];

const sprintTasks = [
  { id: 1, title: 'Design MyGoals Component', status: 'done' },
  { id: 2, title: 'Integrate API for user stats', status: 'in-progress' },
  { id: 3, title: 'Update documentation for V2', status: 'todo' },
];

function ProgressRing({ radius, stroke, progress, color }: { radius: number; stroke: number; progress: number; color: string }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          className="stroke-slate-200 dark:stroke-white/5"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-[10px] font-black text-slate-900 dark:text-white">{progress}%</span>
      </div>
    </div>
  );
}

export default function MyGoals({ summary }: { summary?: EmployeeSummary | null }) {
  const backendGoals = summary?.productivity?.goals || [];
  const quarterGoals = backendGoals.length > 0
    ? backendGoals.map((g: any, index: number) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
        const color = colors[index % colors.length];
        
        let status = 'On Track';
        if (g.progress === 100) status = 'Completed';
        else if (g.progress < 50) status = 'At Risk';
        
        let deadline = 'No date';
        if (g.dueDate) {
          deadline = new Date(g.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        return {
          id: index + 1,
          title: g.title,
          progress: g.progress,
          color: color,
          deadline: deadline,
          status: status,
        };
      })
    : mockQuarterGoals;

  const avgProgress = backendGoals.length > 0
    ? Math.round(backendGoals.reduce((sum, g: any) => sum + g.progress, 0) / backendGoals.length)
    : 68;
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {/* LEFT: Quarter Goals (Span 2) */}
      <div className="flex flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-xl xl:col-span-2 relative overflow-hidden group transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 dark:border-white/5 dark:bg-[#0B1121] dark:hover:border-blue-500/30">
        {/* Glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 dark:opacity-30 dark:group-hover:opacity-50"
             style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)" }} />

        <div className="z-10 flex items-center justify-between mb-4 border-b border-slate-100 pb-4 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-900 tracking-wide dark:text-white">Q2 Goals</h2>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mt-0.5 dark:text-slate-400">April - June 2026</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400" />
              <div className="text-[28px] font-black text-slate-900 leading-none dark:text-white">{avgProgress}%</div>
            </div>
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">Quarter Completion</div>
          </div>
        </div>

        <div className="z-10 grid gap-4 md:grid-cols-3">
          {quarterGoals.map((goal, i) => (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-3 rounded-[16px] border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-slate-100 hover:border-slate-300 relative overflow-hidden dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] dark:hover:border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <ProgressRing radius={24} stroke={4} progress={goal.progress} color={goal.color} />
                <div className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${
                  goal.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                  goal.status === 'At Risk' ? 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                  'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                }`}>
                  {goal.status}
                </div>
              </div>
              <div className="mt-1">
                <h3 className="text-[14px] font-bold text-slate-800 leading-tight dark:text-slate-200">{goal.title}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <Clock size={12} className={goal.status === 'At Risk' ? 'text-orange-500 dark:text-orange-400' : ''} />
                  <span>Due {goal.deadline}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: Sprint Tasks */}
      <div className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 dark:border-white/5 dark:bg-[#0B1121]">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500"
             style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)" }} />

        <div className="z-10 flex items-center justify-between mb-4 border-b border-slate-100 pb-4 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.1)] dark:bg-emerald-500/10 dark:text-emerald-400 dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Rocket size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Current Sprint</h2>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mt-0.5 dark:text-slate-400">Sprint 42</p>
            </div>
          </div>
          {/* Sprint Health Indicator */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Healthy
          </div>
        </div>

        <div className="z-10 flex flex-col gap-2">
          {sprintTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
            >
              <div className="mt-0.5">
                {task.status === 'done' ? (
                  <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                ) : task.status === 'in-progress' ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.2)] dark:shadow-[0_0_6px_rgba(59,130,246,0.3)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  </div>
                ) : (
                  <Circle size={16} className="text-slate-400 dark:text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <span className={`text-[13px] font-semibold ${task.status === 'done' ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {task.title}
                </span>
              </div>
            </motion.div>
          ))}
          <div className="mt-3 flex items-center justify-center pt-2 border-t border-slate-100 dark:border-white/5">
             <button className="text-[12px] font-extrabold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider flex items-center gap-1 group/btn dark:text-slate-400 dark:hover:text-white">
               View All Tasks 
               <span className="transition-transform group-hover/btn:translate-x-1">→</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
