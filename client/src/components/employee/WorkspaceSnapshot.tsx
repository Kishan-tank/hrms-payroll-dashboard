import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { Clock, Umbrella, DollarSign, CheckSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function CountUp({ end, suffix = "", prefix = "" }: { end: number | string, suffix?: string, prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (typeof end === 'number' && ref.current) {
      const controls = animate(0, end, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = prefix + Math.floor(value) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [end, suffix, prefix]);

  if (typeof end === 'string') return <span>{end}</span>;
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

interface KpiCardProps {
  icon: React.ReactNode;
  iconGradient: string;
  glowColor: string;
  label: string;
  value: string | number;
  suffix?: string;
  sub: string;
  indicator?: 'up' | 'down' | 'neutral';
  badge?: string;
  badgeColor?: string;
  progress: number;
  sparklineData?: number[];
}

function MiniSparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 40;
    const y = 14 - ((val - min) / range) * 14;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="40" height="14" className="overflow-visible opacity-50">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({ icon, iconGradient, glowColor, label, value, suffix, sub, indicator, badge, badgeColor, progress, sparklineData }: KpiCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] dark:border-white/5 dark:bg-white/[0.02] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]"
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `0 12px 40px ${glowColor}, 0 8px 30px rgba(59,130,246,0.2)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = '';
      }}
    >
      {/* Premium gradient border overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-br from-slate-100 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
      
      {/* Hover ambient glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-50"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: iconGradient, boxShadow: `0 4px 16px ${glowColor}` }}
        >
          {icon}
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          {badge && (
            <span
              className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: badgeColor + '20', color: badgeColor, border: `1px solid ${badgeColor}30` }}
            >
              {badge}
            </span>
          )}
          {indicator === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
          {indicator === 'down' && <TrendingDown size={14} className="text-red-500" />}
          {indicator === 'neutral' && <Minus size={14} className="text-slate-500" />}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-0.5 relative z-10">
        <div className="text-[22px] font-extrabold leading-none text-slate-900 tracking-tight dark:text-white">
          <CountUp end={value} suffix={suffix} />
        </div>
        <div className="text-[12px] font-bold text-slate-700 mt-0.5 dark:text-slate-300">
          {label}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="text-[11px] text-slate-500 font-medium">
            {sub}
          </div>
          {sparklineData && badgeColor && (
            <div className="hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
              <MiniSparkline data={sparklineData} color={badgeColor} />
            </div>
          )}
        </div>
      </div>

      {/* Mini progress bar with premium styling */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner relative z-10 dark:bg-slate-800/50">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%`, background: iconGradient, boxShadow: `0 0 10px ${glowColor}` }}
        />
      </div>
    </div>
  );
}

export default function WorkspaceSnapshot() {
  const cards: KpiCardProps[] = [
    {
      icon: <Clock size={18} className="text-white" />,
      iconGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      glowColor: "rgba(59,130,246,0.3)",
      label: "Attendance Rate",
      value: 94,
      suffix: "%",
      sub: "This month · 22 of 23 days",
      indicator: "up",
      progress: 94,
      badgeColor: "#3b82f6",
      sparklineData: [88, 90, 89, 92, 94, 94, 94],
    },
    {
      icon: <Umbrella size={18} className="text-white" />,
      iconGradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      glowColor: "rgba(139,92,246,0.3)",
      label: "Leave Balance",
      value: 18,
      sub: "Days remaining · Annual",
      badge: "Healthy",
      badgeColor: "#10b981",
      progress: 50,
      sparklineData: [22, 22, 20, 20, 18, 18],
    },
    {
      icon: <DollarSign size={18} className="text-white" />,
      iconGradient: "linear-gradient(135deg, #10b981, #059669)",
      glowColor: "rgba(16,185,129,0.3)",
      label: "Payroll Status",
      value: "✓",
      sub: "Last updated Jun 1 · On time",
      badge: "Updated",
      badgeColor: "#10b981",
      progress: 100,
    },
    {
      icon: <CheckSquare size={18} className="text-white" />,
      iconGradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      glowColor: "rgba(245,158,11,0.3)",
      label: "Pending Tasks",
      value: 4,
      sub: "2 due today · 2 this week",
      badge: "Action",
      badgeColor: "#f59e0b",
      progress: 75,
      sparklineData: [8, 7, 5, 6, 4, 4],
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide dark:text-white">Workspace Snapshot</h2>
          <p className="mt-0.5 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">June 2026</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * idx, ease: "easeOut" }}
          >
            <KpiCard {...card} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
