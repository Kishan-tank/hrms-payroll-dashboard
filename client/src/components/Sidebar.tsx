import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

type IconName = 'dashboard' | 'employees' | 'attendance' | 'leave' | 'payroll' | 'reports' | 'settings' | 'logout' | 'building' | 'chevron';

const navItems: Array<{ label: string; path: string; icon: IconName }> = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Employees', path: '/employees', icon: 'employees' },
  { label: 'Attendance', path: '/attendance', icon: 'attendance' },
  { label: 'Leave Management', path: '/leave', icon: 'leave' },
  { label: 'Payroll', path: '/payroll', icon: 'payroll' },
  { label: 'Reports', path: '/reports', icon: 'reports' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
];

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  switch (name) {
    case 'building':
      return <svg {...common}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
    case 'dashboard':
      return <svg {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>;
    case 'employees':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'attendance':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'leave':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h.01M12 15h.01M16 15h.01" /></svg>;
    case 'payroll':
      return <svg {...common}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>;
    case 'reports':
      return <svg {...common}><path d="M4 19V5M9 19V9M14 19V7M19 19v-5M3 19h18" /></svg>;
    case 'settings':
      return <svg {...common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 20.4 8a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.1.4 1.7 1.7 0 0 0-.6 1Z" /></svg>;
    case 'logout':
      return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
    case 'chevron':
      return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
    default:
      return null;
  }
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950 shadow-xl lg:inset-y-0 lg:left-0 lg:border-r lg:border-t-0"
      style={{ width: collapsed ? 72 : 256 }}
    >
      <div className="hidden h-full flex-col lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white"
            aria-label="Go home"
          >
            <Icon name="building" className="h-6 w-6" />
          </button>
          {!collapsed && (
            <div>
              <p className="text-lg font-bold leading-tight text-white">HRMSPro</p>
              <p className="text-sm text-slate-400">Enterprise Suite</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-400 transition hover:bg-white/15 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Icon name="chevron" className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-3 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  'flex h-[52px] items-center gap-4 rounded-2xl px-4 text-lg font-semibold transition',
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' : 'text-slate-400 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-[52px] w-full items-center gap-4 rounded-2xl px-4 text-left text-lg font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <Icon name="logout" className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-3 lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold',
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300',
              ].join(' ')
            }
          >
            <Icon name={item.icon} className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
