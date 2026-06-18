import { useNavigate } from 'react-router-dom';

function ShieldCheckIcon() {
  return (
    <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function WorkforceHealthWidget() {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.10) 100%)',
        borderColor: 'rgba(59,130,246,0.25)',
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheckIcon />
        <h2 className="font-semibold" style={{ color: 'var(--dash-text)' }}>
          Workforce Health
        </h2>
      </div>

      {/* Score ring */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg viewBox="0 0 56 56" className="h-16 w-16 -rotate-90">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="22"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - 0.92)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <span
            className="absolute text-sm font-bold"
            style={{ color: 'var(--dash-text)' }}
          >
            92
          </span>
        </div>

        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--dash-text)' }}>
            Excellent
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--dash-muted)' }}>
            Your org is performing in the<br />
            <span className="font-semibold" style={{ color: '#60a5fa' }}>top 8%</span> this quarter.
          </p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Retention', value: '94%', color: '#22c55e' },
          { label: 'Engagement', value: '87%', color: '#3b82f6' },
          { label: 'Wellness',   value: '91%', color: '#8b5cf6' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-2 text-center"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <p className="text-base font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => navigate('/reports')}
        className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        View report
      </button>
    </div>
  );
}
