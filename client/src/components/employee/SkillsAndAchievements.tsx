
import { motion } from 'framer-motion';
import { Sparkles, Code2, Database, Layout, Server, Trophy, Star, Flame, GraduationCap, Zap, Gem } from 'lucide-react';

const achievements = [
  {
    icon: <Trophy size={20} strokeWidth={2} color="currentColor" />,
    title: "Employee Of The Month",
    desc: "June 2026",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.3)",
    border: "rgba(245,158,11,0.4)",
    tag: "Latest",
    tagColor: "#f59e0b",
  },
  {
    icon: <Star size={20} strokeWidth={2} color="currentColor" />,
    title: "Top Performer",
    desc: "Q2 2026 · 96% Score",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glow: "rgba(59,130,246,0.3)",
    border: "rgba(59,130,246,0.4)",
    tag: "Q2",
    tagColor: "#3b82f6",
  },
  {
    icon: <Flame size={20} strokeWidth={2} color="currentColor" />,
    title: "Attendance Champion",
    desc: "42-Day Best Streak",
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    glow: "rgba(239,68,68,0.3)",
    border: "rgba(239,68,68,0.4)",
    tag: "Record",
    tagColor: "#ef4444",
  },
  {
    icon: <GraduationCap size={20} strokeWidth={2} color="currentColor" />,
    title: "Training Completed",
    desc: "React Advanced · 40hrs",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    glow: "rgba(139,92,246,0.3)",
    border: "rgba(139,92,246,0.4)",
    tag: "Certified",
    tagColor: "#8b5cf6",
  },
  {
    icon: <Zap size={20} strokeWidth={2} color="currentColor" />,
    title: "Sprint Champion",
    desc: "5 sprints delivered on time",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    glow: "rgba(6,182,212,0.3)",
    border: "rgba(6,182,212,0.4)",
    tag: "Team",
    tagColor: "#06b6d4",
  },
  {
    icon: <Gem size={20} strokeWidth={2} color="currentColor" />,
    title: "Peer Recognition",
    desc: "Voted by 14 teammates",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.3)",
    border: "rgba(16,185,129,0.4)",
    tag: "May 2026",
    tagColor: "#10b981",
  },
];

const skills = [
  { name: 'React', level: 'Expert', icon: Code2, color: '#3b82f6', bg: 'bg-blue-100 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', badgeText: 'text-blue-700 dark:text-blue-400', pct: 95 },
  { name: 'TypeScript', level: 'Advanced', icon: Database, color: '#8b5cf6', bg: 'bg-purple-100 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-600 dark:text-purple-400', badgeText: 'text-purple-700 dark:text-purple-400', pct: 85 },
  { name: 'Tailwind CSS', level: 'Expert', icon: Layout, color: '#06b6d4', bg: 'bg-white dark:bg-cyan-500/10', border: 'border-slate-800 dark:border-cyan-500/20', text: 'text-slate-900 dark:text-cyan-400', badgeText: 'text-slate-900 dark:text-cyan-400', pct: 92 },
  { name: 'Node.js', level: 'Intermediate', icon: Server, color: '#10b981', bg: 'bg-emerald-100 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', badgeText: 'text-emerald-700 dark:text-emerald-400', pct: 70 },
];

export default function SkillsAndAchievements() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {/* LEFT: Skills Section (Col span 1) */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] xl:col-span-1 hover:border-blue-500/30 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-blue-500/20">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold tracking-wide text-slate-900 dark:text-white">Professional Skills</h2>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-500/10">
            <Sparkles size={14} className="text-yellow-600 dark:text-yellow-500" />
          </div>
        </div>

        <div className="mt-2 flex flex-1 flex-col justify-center gap-4">
          {skills.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group flex flex-col gap-3 rounded-[14px] border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
              style={{ hover: { boxShadow: `0 8px 24px ${s.color}20` } } as any}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} border ${s.border}`}>
                    <s.icon size={14} className={`${s.text}`} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 tracking-wide dark:text-slate-200">{s.name}</span>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border ${s.bg} ${s.border} ${s.badgeText}`}>
                  {s.level}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                  className="h-full rounded-full transition-all"
                  style={{
                    background: `linear-gradient(90deg, ${s.color}60, ${s.color})`,
                    boxShadow: `0 0 10px ${s.color}80`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] xl:col-span-2 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-extrabold tracking-wide text-slate-900 dark:text-white">Achievements</h2>
            <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">6 earned this year</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: "easeOut" }}
              className="group relative flex flex-col cursor-default overflow-hidden rounded-[18px] border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(59,130,246,0.10)] dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-white/20"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 20px 40px ${a.glow}`;
                el.style.borderColor = a.border;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '';
                el.style.borderColor = '';
              }}
            >
              {/* Premium Glass Overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-br from-slate-100 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />

              {/* Glow background */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)` }}
              />

              <div className="relative z-10 flex flex-col">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-[12px] shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: a.tagColor ? a.tagColor + '15' : a.gradient,
                        color: a.tagColor,
                      }}
                    >
                      {a.icon}
                    </div>
                    <span
                      className="rounded-md border px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider"
                      style={{
                        background: a.tagColor + "15",
                        color: a.tagColor,
                        borderColor: `${a.tagColor}30`,
                      }}
                    >
                      {a.tag}
                    </span>
                  </div>

                  <div>
                    <div className="text-[13.5px] font-extrabold tracking-wide text-slate-900 dark:text-white">{a.title}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{a.desc}</div>
                  </div>
                </div>

                {/* Animated Shine Line */}
                <div className="mt-3 relative h-[1.5px] w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                  <div
                    className="absolute left-0 top-0 h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[200%] group-hover:opacity-50"
                    style={{ background: `linear-gradient(90deg, transparent, ${a.tagColor}, transparent)` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
