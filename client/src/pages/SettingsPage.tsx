import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { settingsService, type ApiSettings } from '../services/hrmsApi';
import { useToast } from '../context/ToastContext';
import { useAuthContext } from '../context/AuthContext';

type TabId = 'profile' | 'security' | 'notifications' | 'theme' | 'permissions';

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'profile', label: 'Profile Settings', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'theme', label: 'Theme', icon: 'palette' },
  { id: 'permissions', label: 'Role Permissions', icon: 'shield' },
];

const defaultNotifications = {
  newLeaveRequests: true,
  payrollProcessed: true,
  attendanceAlerts: false,
  newEmployeeJoined: true,
  performanceReviewsDue: false,
  systemMaintenance: true,
};

const rolePermissions = [
  {
    role: 'HR Manager',
    permissions: ['View All Employees', 'Approve Leaves', 'Run Payroll', 'Generate Reports', 'Manage Settings', 'View Analytics'],
  },
  { role: 'Employee', permissions: ['View Own Profile', 'Apply Leave', 'View Payslip', 'Update Attendance'] },
  { role: 'Payroll Admin', permissions: ['View All Employees', 'Run Payroll', 'Generate Reports', 'View Analytics'] },
  { role: 'Department Head', permissions: ['View Team Employees', 'Approve Leaves', 'View Analytics'] },
];

function Icon({ name }: { name: string }) {
  const common = {
    className: 'h-4 w-4',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 24 24',
  };

  if (name === 'user') return <svg {...common}><path d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (name === 'palette') return <svg {...common}><path d="M12 22a10 10 0 1 1 10-10 3 3 0 0 1-3 3h-1.5a1.5 1.5 0 0 0 0 3H18a4 4 0 0 1-4 4z" /><circle cx="7.5" cy="10.5" r=".5" /><circle cx="10.5" cy="7.5" r=".5" /><circle cx="14.5" cy="7.5" r=".5" /><circle cx="16.5" cy="11.5" r=".5" /></svg>;
  if (name === 'save') return <svg {...common}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;

  return <svg {...common}><circle cx="12" cy="12" r="10" /></svg>;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthContext();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [theme, setTheme] = useState<ApiSettings['theme']>('light');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    designation: user?.designation || '',
    department: user?.department || '',
    phone: user?.phone || '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.name) {
      setProfile((prev) => ({ ...prev, name: user.name, email: user.email || prev.email }));
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();

      if (res.success && res.settings) {
        setTheme(res.settings.theme || 'light');
        setAccentColor(res.settings.accentColor || '#2563EB');
        setNotifications(res.settings.notifications || defaultNotifications);
        if (res.profile) {
          setProfile((prev) => ({ ...prev, ...res.profile }));
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setProfileError(null);

      if (!profile.name.trim()) {
        setProfileError('Name is required.');
        return;
      }

      if (currentPassword || newPassword || confirmNewPassword) {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          setProfileError('Please fill all password fields to change your password.');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setProfileError('New passwords do not match.');
          return;
        }
      }

      const res = await settingsService.updateSettings({
        theme,
        accentColor,
        notifications,
        profile,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success) {
        if (res.profile) updateUser(res.profile);
        toast.success('Settings saved successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(res.message || 'Unable to save settings.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof defaultNotifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-center text-sm text-slate-500">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Settings</h2>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === tab.id ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon name={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Account Settings</h1>
              <p className="text-sm text-slate-500">Manage your profile, security preferences, and app settings.</p>
            </div>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="save" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {profileError ? <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{profileError}</div> : null}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Name
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Designation
                  <input
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Department
                  <input
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Phone
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Update your password and enhance account security.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Current Password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  New Password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Confirm New Password
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Choose how and when you want to receive notifications.</p>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationToggle(key as keyof typeof defaultNotifications)}
                      className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Customize the application theme and accent color.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Theme
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ApiSettings['theme'])}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Accent Color
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Review role permission templates for team members.</p>
              <div className="space-y-4">
                {rolePermissions.map((role) => (
                  <div key={role.role} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">{role.role}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {role.permissions.map((permission) => (
                        <li key={permission} className="flex items-center gap-2">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-900" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
