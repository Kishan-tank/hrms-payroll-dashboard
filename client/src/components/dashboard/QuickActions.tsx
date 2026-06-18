import { useNavigate } from 'react-router-dom';

interface QuickAction {
  label: string;
  sublabel: string;
  accent: string;
  dimBg: string;
  path: string;
  icon: React.ReactNode;
}

function UserPlusIcon({ color }: { color: string }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" />
    </svg>
  );
}
function PlayCircleIcon({ color }: { color: string }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 8l6 4-6 4V8z" />
    </svg>
  );
}
function CheckCircleIcon({ color }: { color: string }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m9 12 2 2 4-4" />
    </svg>
  );
}
function DownloadIcon({ color }: { color: string }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}
function MegaphoneIcon({ color }: { color: string }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Add Employee',
    sublabel: 'Onboard new hire',
    accent: '#3b82f6',
    dimBg: 'rgba(59,130,246,0.12)',
    path: '/employees',
    icon: <UserPlusIcon color="#3b82f6" />,
  },
  {
    label: 'Run Payroll',
    sublabel: 'Process this cycle',
    accent: '#22c55e',
    dimBg: 'rgba(34,197,94,0.12)',
    path: '/payroll',
    icon: <PlayCircleIcon color="#22c55e" />,
  },
  {
    label: 'Approve Leave',
    sublabel: 'Pending requests',
    accent: '#8b5cf6',
    dimBg: 'rgba(139,92,246,0.12)',
    path: '/leave',
    icon: <CheckCircleIcon color="#8b5cf6" />,
  },
  {
    label: 'Export Reports',
    sublabel: 'Download analytics',
    accent: '#f59e0b',
    dimBg: 'rgba(245,158,11,0.12)',
    path: '/reports',
    icon: <DownloadIcon color="#f59e0b" />,
  },
  {
    label: 'Send Announcement',
    sublabel: 'Notify all staff',
    accent: '#ec4899',
    dimBg: 'rgba(236,72,153,0.12)',
    path: '/settings',
    icon: <MegaphoneIcon color="#ec4899" />,
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="dash-card p-5">
      <h2 className="mb-4 font-semibold" style={{ color: 'var(--dash-text)' }}>
        Quick Actions
      </h2>

      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.path)}
            className="group flex flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all duration-200"
            style={{
              background: 'var(--dash-card-elevated)',
              borderColor: 'var(--dash-border)',
              minWidth: '80px',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = action.accent + '50';
              el.style.background = action.dimBg;
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = `0 8px 24px ${action.accent}20`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'var(--dash-border)';
              el.style.background = 'var(--dash-card-elevated)';
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = 'none';
            }}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
              style={{ background: action.dimBg }}
            >
              {action.icon}
            </span>
            <span className="text-xs font-semibold leading-tight" style={{ color: 'var(--dash-text)' }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
