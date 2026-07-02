import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

type IconName =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'reports'
  | 'settings'
  | 'logout'
  | 'building'
  | 'chevron'
  | 'briefcase'
  | 'checklist'
  | 'performance'
  | 'companyHub';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  roles?: Array<'EMPLOYEE' | 'HR_MANAGER'>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard', path: '/employee-dashboard', icon: 'dashboard', roles: ['EMPLOYEE'] },
      { label: 'Onboarding', path: '/onboarding', icon: 'checklist', roles: ['EMPLOYEE'] },
      { label: 'Tasks', path: '/tasks', icon: 'checklist', roles: ['EMPLOYEE'] },
      { label: 'Dashboard', path: '/hr-dashboard', icon: 'dashboard', roles: ['HR_MANAGER'] },
      { label: 'Attendance', path: '/attendance', icon: 'attendance' },
      { label: 'Leave Management', path: '/leave', icon: 'leave' },
    ]
  },
  {
    group: 'Team & Organization',
    items: [
      { label: 'Employees', path: '/employees', icon: 'employees', roles: ['HR_MANAGER'] },
      { label: 'Payroll', path: '/payroll', icon: 'payroll' },
      { label: 'Reports', path: '/reports', icon: 'reports', roles: ['HR_MANAGER'] },
    ]
  },
  {
    group: 'Manage',
    items: [
      { label: 'Settings', path: '/settings', icon: 'settings' },
    ]
  }
];

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const c = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.8, viewBox: '0 0 24 24' };
  switch (name) {
    case 'building': return <svg {...c}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
    case 'dashboard': return <svg {...c}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>;
    case 'employees': return <svg {...c}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'attendance': return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'leave': return <svg {...c}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h.01M12 15h.01M16 15h.01" /></svg>;
    case 'payroll': return <svg {...c}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>;
    case 'reports': return <svg {...c}><path d="M4 19V5M9 19V9M14 19V7M19 19v-5M3 19h18" /></svg>;
    case 'settings':
      return (
        <svg {...c}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 20.4 8a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.1.4 1.7 1.7 0 0 0-.6 1Z" />
        </svg>
      );
    case 'logout': return <svg {...c}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
    case 'chevron': return <svg {...c}><path d="m15 18-6-6 6-6" /></svg>;
    case 'briefcase': return <svg {...c}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
    case 'checklist': return <svg {...c}><path d="M9.615 20H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8M14 19l2 2 4-4M9 8h4M9 12h2" /></svg>;
    default: return null;
  }
}



export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const onToggleCollapse = () => setCollapsed(!collapsed);

  const { user, logout } = useAuthContext();

  const normalizedRole = user?.role?.toLowerCase() || '';
  const userRole = ['hr-manager', 'hr manager', 'hr', 'manager'].includes(normalizedRole)
    ? 'HR_MANAGER'
    : 'EMPLOYEE';


  return (
    <aside
      className={`fixed inset-x-0 bottom-0 z-40 lg:relative lg:shrink-0 transition-all duration-300 ease-in-out bg-white border-r border-slate-200 dark:bg-[#0B1121] dark:border-white/5 shadow-sm overflow-visible ${collapsed ? 'lg:w-20' : 'lg:w-[280px]'}`}
    >
      {/* ── Desktop ── */}
      <div className="hidden h-screen sticky top-0 flex-col lg:flex">
        {/* Premium Branding Section */}
        <div className={`relative flex h-[96px] w-full items-center border-b border-slate-200 py-6 dark:border-white/5 shrink-0 transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>

          <div className={`group relative flex items-center gap-4 min-w-0 transition-all duration-300`}>
            {/* Subtle blue background glow on hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute -left-1 top-1 h-12 w-12 rounded-full bg-blue-500/10 blur-xl dark:bg-blue-500/20" />
            </div>

            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-sm ring-1 ring-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-500/30">
              <Icon name="building" className="h-6 w-6" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
            </div>

            {!collapsed && (
              <div className="flex flex-col justify-center min-w-0">
                <p className="truncate text-[22px] font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                  HRMS<span className="text-blue-500">Pro</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
                    {userRole === 'HR_MANAGER' ? 'ENTERPRISE SUITE' : 'WORKSPACE'}
                  </p>
                  {userRole === 'EMPLOYEE' && (
                    <div className="inline-flex shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-1 py-[0.5px] text-[7px] font-bold uppercase tracking-widest text-blue-400">
                      PORTAL
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(item => {
              if (!item.roles) return true;
              if (!user) return false;
              return item.roles.includes(userRole);
            });

            if (visibleItems.length === 0) return null;

            // Determine correct section label
            let sectionLabel = group.group;
            if (sectionLabel === 'Team & Organization' && userRole === 'EMPLOYEE') {
              sectionLabel = 'EMPLOYEE SERVICES';
            }

            return (
              <div key={group.group}>
                {!collapsed && (
                  <h3 className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
                    {sectionLabel}
                  </h3>
                )}
                <nav id={`sidebar-nav-${group.group.replace(/\s+/g, '-').toLowerCase()}`} className="flex flex-col gap-1.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        [
                          `group relative flex h-10 items-center text-sm font-semibold transition-all duration-300 ${collapsed ? 'justify-center w-12 mx-auto px-0 rounded-xl' : 'px-3 gap-3 w-full rounded-xl hover:translate-x-1'}`,
                          isActive
                            ? 'bg-blue-600/15 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)] border border-blue-500/30 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1.5 before:rounded-full before:bg-blue-500 before:shadow-[0_0_12px_rgba(59,130,246,0.9)]'
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-slate-200',
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon name={item.icon} className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                          {!collapsed && <span className="truncate tracking-wide">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 dark:border-white/5 pt-3 pb-4 px-3 flex flex-col gap-2">
          
          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            aria-expanded={!collapsed}
            className={`hidden lg:flex h-10 items-center text-sm font-semibold transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 border border-transparent dark:hover:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-200 ${collapsed ? 'justify-center w-12 mx-auto px-0 rounded-xl' : 'w-full gap-3 rounded-xl px-3 hover:translate-x-1'}`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <div className={`shrink-0 flex items-center justify-center transition-transform duration-300 transform ${collapsed ? 'rotate-180' : ''}`}>
              <Icon name="chevron" className="h-5 w-5" />
            </div>
            {!collapsed && <span className="tracking-wide">Collapse Sidebar</span>}
          </button>


          <button
            type="button"
            onClick={logout}
            aria-label="Logout"
            className={`flex h-10 items-center text-sm font-semibold transition-all duration-300 hover:bg-red-50 hover:border-red-100 hover:text-red-600 border border-transparent dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:text-slate-400 dark:hover:text-red-400 ${collapsed ? 'justify-center w-12 mx-auto px-0 rounded-xl' : 'w-full gap-3 rounded-xl px-3 hover:translate-x-1'}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <Icon name="logout" className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="tracking-wide">Logout</span>}
          </button>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="flex h-[60px] items-center justify-around border-t border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 lg:hidden">
        {NAV_GROUPS.flatMap(g => g.items)
          .filter(i => (!i.roles || (user && i.roles.includes(userRole))))
          .slice(0, 4)
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon name={item.icon} className="h-5 w-5" />
            </NavLink>
          ))}
      </div>
    </aside>
  );
}
