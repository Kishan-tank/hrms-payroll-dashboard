import { NavLink } from 'react-router-dom';

interface SidebarLink {
  label: string;
  path: string;
  icon: string;
}

const sidebarLinks: SidebarLink[] = [
  { label: 'Employee Dashboard', path: '/employee-dashboard', icon: 'ED' },
  { label: 'HR Dashboard', path: '/hr-dashboard', icon: 'HR' },
  { label: 'Leaves', path: '/employee-dashboard', icon: 'LV' },
  { label: 'Payroll', path: '/hr-dashboard', icon: 'PR' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white lg:inset-y-0 lg:left-0 lg:w-72 lg:border-r lg:border-t-0">
      <div className="hidden h-16 items-center border-b border-gray-200 px-6 lg:flex">
        <div>
          <p className="text-xl font-bold text-gray-950">HRMS Payroll</p>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            Automation Dashboard
          </p>
        </div>
      </div>

      {/* Navigation links are horizontal on mobile and vertical on desktop */}
      <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:p-4">
        {sidebarLinks.map((link) => (
          <NavLink
            key={`${link.label}-${link.path}`}
            to={link.path}
            className={({ isActive }) =>
              [
                'flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950',
              ].join(' ')
            }
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-700">
              {link.icon}
            </span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
