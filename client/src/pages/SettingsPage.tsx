import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';

type TabId = 'profile' | 'security' | 'notifications' | 'theme' | 'permissions';

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'profile', label: 'Profile Settings', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'theme', label: 'Theme', icon: 'palette' },
  { id: 'permissions', label: 'Role Permissions', icon: 'shield' },
];

const notificationSettings = [
  { label: 'New leave requests', desc: 'Get notified when employees apply for leave', enabled: true },
  { label: 'Payroll processed', desc: 'Receive alerts when payroll cycle completes', enabled: true },
  { label: 'Attendance alerts', desc: 'Get notified for late arrivals or absences', enabled: false },
  { label: 'New employee joined', desc: 'Receive onboarding notifications', enabled: true },
  { label: 'Performance reviews due', desc: 'Reminders for upcoming review cycles', enabled: false },
  { label: 'System maintenance', desc: 'Platform maintenance and downtime alerts', enabled: true },
];

const rolePermissions = [
  { role: 'HR Manager', permissions: ['View All Employees', 'Approve Leaves', 'Run Payroll', 'Generate Reports', 'Manage Settings', 'View Analytics'] },
  { role: 'Employee', permissions: ['View Own Profile', 'Apply Leave', 'View Payslip', 'Update Attendance'] },
  { role: 'Payroll Admin', permissions: ['View All Employees', 'Run Payroll', 'Generate Reports', 'View Analytics'] },
  { role: 'Department Head', permissions: ['View Team Employees', 'Approve Leaves', 'View Analytics'] },
];

function Icon({ name }: { name: string }) {
  const common = { className: 'h-4 w-4', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'user') return <svg {...common}><path d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (name === 'palette') return <svg {...common}><path d="M12 22a10 10 0 1 1 10-10 3 3 0 0 1-3 3h-1.5a1.5 1.5 0 0 0 0 3H18a4 4 0 0 1-4 4z" /><circle cx="7.5" cy="10.5" r=".5" /><circle cx="10.5" cy="7.5" r=".5" /><circle cx="14.5" cy="7.5" r=".5" /><circle cx="16.5" cy="11.5" r=".5" /></svg>;
  if (name === 'save') return <svg {...common}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>;
  return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
}

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(notificationSettings);

  const userName = user?.name || 'Unknown User';
  const userRole = user?.role === 'hr' ? 'HR Manager' : 'Employee';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <DashboardLayout title="Settings" userName={userName} userRole={userRole}>
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-slate-950 dark:text-white">Settings</h1>

        <div className="flex flex-col gap-5 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-56">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
              {tabs.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  type="button"
                  className={[
                    'flex w-full items-center gap-3 border-l-[3px] px-4 py-3 text-left text-sm font-medium transition',
                    activeTab === id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
                  ].join(' ')}
                >
                  <Icon name={icon} />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
            {activeTab === 'profile' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Profile Settings</h2>
                <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-white/10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">{initial}</div>
                  <div>
                    <div className="font-semibold text-slate-950 dark:text-white">{userName}</div>
                    <div className="text-sm text-slate-400">{userRole} - HRMSPro</div>
                    <button type="button" className="mt-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">Change Photo</button>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    ['Full Name', userName],
                    ['Email Address', user?.email || 'N/A'],
                    ['Phone Number', user?.phone || 'N/A'],
                    ['Employee ID', user?.employeeId || 'N/A'],
                    ['Department', user?.department || 'N/A'],
                    ['Designation', user?.designation || 'N/A'],
                    ['Location', user?.location || 'N/A'],
                    ['Joining Date', user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'],
                  ].map(([label, value]) => (
                    <label key={label} className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                      <input defaultValue={value} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-300 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500" />
                    </label>
                  ))}
                </div>
                <button type="button" className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">
                  <Icon name="save" /> Save Changes
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Security Settings</h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Change Password</h3>
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                      <label key={label} className="mb-4 block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                        <input type="password" placeholder="********" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500" />
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4 dark:border-white/10">
                    <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/50">
                      <div>
                        <div className="text-sm font-medium text-slate-950 dark:text-white">Authenticator App</div>
                        <div className="text-xs text-slate-400">Use an app like Google Authenticator</div>
                      </div>
                      <span className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white">Enabled</span>
                    </div>
                  </div>
                  <button type="button" className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"><Icon name="save" /> Update Security</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Notification Preferences</h2>
                <div className="space-y-4">
                  {notifications.map((item, index) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/50">
                      <div>
                        <div className="text-sm font-medium text-slate-950 dark:text-white">{item.label}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications((items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, enabled: !entry.enabled } : entry))}
                        className={`relative h-6 w-11 rounded-full transition ${item.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${item.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Theme Preferences</h2>
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  {['light', 'dark', 'system'].map((item) => (
                    <button key={item} type="button" onClick={() => setTheme(item)} className={`rounded-2xl border-2 p-4 text-center transition ${theme === item ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-500/10' : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/50'}`}>
                      <div className="mb-3 h-16 rounded-xl border border-slate-200 dark:border-white/10" style={{ background: item === 'dark' ? '#0F172A' : item === 'system' ? 'linear-gradient(135deg,#fff 50%,#0F172A 50%)' : '#fff' }} />
                      <p className={`text-sm font-medium ${theme === item ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{item === 'system' ? 'System Default' : `${item.charAt(0).toUpperCase() + item.slice(1)} Mode`}</p>
                    </button>
                  ))}
                </div>
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Accent Color</h3>
                <div className="flex gap-3">
                  {['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#059669', '#D97706'].map((color) => <button key={color} type="button" className="h-8 w-8 rounded-full border-2" style={{ background: color, borderColor: color === '#2563EB' ? '#0F172A' : 'transparent' }} />)}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Role Permissions</h2>
                <div className="space-y-4">
                  {rolePermissions.map(({ role, permissions }) => (
                    <div key={role} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/50">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400"><Icon name="shield" /></span>
                        <span className="text-sm font-semibold text-slate-950 dark:text-white">{role}</span>
                        <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{permissions.length} permissions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((permission) => <span key={permission} className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-500 dark:bg-green-500/10 dark:text-green-400">{permission}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
