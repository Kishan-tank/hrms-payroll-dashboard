import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function ShieldCheckIcon() {
  return (
    <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 12 2 2 4-4" />
    </svg>
  );
}

const MINI_STATS = [
  { label: 'Retention',  value: '94%', accent: '#22c55e' },
  { label: 'Engagement', value: '87%', accent: '#3b82f6' },
  { label: 'Wellness',   value: '91%', accent: '#8b5cf6' },
];

export default function WorkforceHealthCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[20px] border border-blue-500/20 p-5 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(79,70,229,0.08) 100%)',
      }}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
          <ShieldCheckIcon />
        </div>
        <h2 className="text-sm font-bold text-white">Workforce Health</h2>
      </div>

      {/* Score ring + label */}
      <div className="mb-4 flex items-center gap-4">
        {/* SVG ring */}
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg viewBox="0 0 80 80" className="absolute h-full w-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="url(#health-card-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 32}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - 0.92) }}
              transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="health-card-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="relative z-10 text-center">
            <span className="text-xl font-extrabold text-white leading-none">92</span>
            <span className="block text-[10px] text-slate-500">/100</span>
          </div>
        </div>

        <div>
          <p className="text-lg font-extrabold text-white">Excellent</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
            Your org is performing in the{' '}
            <span className="font-bold text-blue-400">top 8%</span> this quarter.
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-emerald-400">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
            +5 vs last quarter
          </div>
        </div>
      </div>

      {/* Mini stat grid */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {MINI_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/5 bg-black/20 p-2 text-center"
          >
            <p className="text-base font-extrabold" style={{ color: s.accent }}>{s.value}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => navigate('/analytics')}
        className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          boxShadow: '0 0 20px rgba(37,99,235,0.35)',
        }}
      >
        View Full Report →
      </button>
    </motion.div>
  );
}
