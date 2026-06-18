import type { Activity } from '../../services/hrmsApi';

interface ActivityTimelineProps {
  activities: Activity[];
  loading: boolean;
}

type EventType = 'join' | 'leave' | 'payroll' | 'attendance' | 'policy' | 'default';

function getEventConfig(action: string): {
  type: EventType;
  accent: string;
  dimBg: string;
  icon: React.ReactNode;
} {
  const lower = action.toLowerCase();

  if (lower.includes('employee') || lower.includes('joined') || lower.includes('added')) {
    return {
      type: 'join',
      accent: '#3b82f6',
      dimBg: 'rgba(59,130,246,0.12)',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" />
        </svg>
      ),
    };
  }
  if (lower.includes('leave') || lower.includes('approved')) {
    return {
      type: 'leave',
      accent: '#22c55e',
      dimBg: 'rgba(34,197,94,0.12)',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M16 3v4M8 3v4M3 11h18M9 16l2 2 4-4" />
        </svg>
      ),
    };
  }
  if (lower.includes('payroll') || lower.includes('salary') || lower.includes('paid')) {
    return {
      type: 'payroll',
      accent: '#8b5cf6',
      dimBg: 'rgba(139,92,246,0.12)',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    };
  }
  if (lower.includes('attendance') || lower.includes('absent') || lower.includes('alert')) {
    return {
      type: 'attendance',
      accent: '#f59e0b',
      dimBg: 'rgba(245,158,11,0.12)',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 2" />
        </svg>
      ),
    };
  }
  if (lower.includes('policy') || lower.includes('update') || lower.includes('published')) {
    return {
      type: 'policy',
      accent: '#ec4899',
      dimBg: 'rgba(236,72,153,0.12)',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="#ec4899" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
        </svg>
      ),
    };
  }

  return {
    type: 'default',
    accent: '#6b7280',
    dimBg: 'rgba(107,114,128,0.12)',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4M12 16h.01" />
      </svg>
    ),
  };
}

// Static fallback data matching V0 design
const FALLBACK_ACTIVITIES: Activity[] = [
  { action: 'New employee added',   name: 'Priya Sharma',  dept: 'Product Designer', time: '12m ago' },
  { action: 'Leave approved',       name: 'Marcus Lee',    dept: 'Engineering',      time: '48m ago' },
  { action: 'Payroll processed',    name: 'August cycle',  dept: '1,284 employees paid', time: '2h ago' },
  { action: 'Attendance alert',     name: 'Support Team',  dept: 'Late check-ins above threshold', time: '5h ago' },
  { action: 'Policy updated',       name: 'Remote work v3.2', dept: 'Published',    time: '1d ago' },
];

export default function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const items = activities.length > 0 ? activities : FALLBACK_ACTIVITIES;

  return (
    <div className="dash-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: 'var(--dash-text)' }}>
          Recent Activity
        </h2>
        <button
          type="button"
          className="text-xs font-semibold transition-colors duration-150"
          style={{ color: 'var(--dash-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dash-blue)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dash-muted)'; }}
        >
          View all
        </button>
      </div>

      {/* Timeline items */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="dark-skeleton h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="dark-skeleton h-3.5 w-3/4" />
                <div className="dark-skeleton h-3 w-1/2" />
              </div>
              <div className="dark-skeleton h-3 w-12 shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((act, idx) => {
            const cfg = getEventConfig(act.action);
            return (
              <div
                key={`${act.action}-${idx}`}
                className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150"
                style={{ cursor: 'default' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--dash-card-elevated)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                {/* Icon badge */}
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: cfg.dimBg }}
                >
                  {cfg.icon}
                </span>

                {/* Content */}
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-sm font-semibold leading-tight"
                    style={{ color: 'var(--dash-text)' }}
                  >
                    {act.action}
                  </span>
                  <span
                    className="mt-0.5 block truncate text-xs"
                    style={{ color: 'var(--dash-muted)' }}
                  >
                    {act.name} {act.dept ? `— ${act.dept}` : ''}
                  </span>
                </span>

                {/* Time */}
                <span
                  className="shrink-0 text-xs"
                  style={{ color: 'var(--dash-muted)' }}
                >
                  {act.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
