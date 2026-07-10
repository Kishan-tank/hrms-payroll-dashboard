import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { settingsService } from '../services/hrmsApi';
import { useToast } from '../context/ToastContext';
import { useAuthContext } from '../context/AuthContext';
import { useTheme, Theme } from '../context/ThemeContext';

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
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="10" /></svg>;
}

const THEME_OPTIONS: Theme[] = ['light', 'dark', 'system'];

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [notifications, setNotifications] = useState(defaultNotifications);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profileName, setProfileName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  // Keep profileName in sync if user loads later
  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res.success && res.settings) {
        // Theme is managed by ThemeContext via localStorage — do not override it here.
        // Calling setTheme() from fetchSettings would overwrite the user's saved
        // local preference with the backend value on every page load.
        setAccentColor(res.settings.accentColor || '#2563EB');
        setNotifications(res.settings.notifications || defaultNotifications);
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
      const res = await settingsService.updateSettings({
        theme,
        accentColor,
        notifications
      });
      if (res.success) {
        toast.success('Settings updated successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof defaultNotifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleUpdateProfileName = async () => {
    if (!profileName.trim()) return;
    try {
      const res = await settingsService.updateProfile(profileName);
      if (res.success) {
        toast.success('Profile updated. Reloading...');
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      const res = await settingsService.changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await settingsService.uploadPhoto(formData);
      if (res.success) {
        toast.success('Photo uploaded. Reloading...');
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" userName={user?.name || "Employee"} userRole={user?.role || "User"}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Settings</h1>
          <button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="save" /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

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
                  <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-950 dark:text-white">{user?.name || 'Employee Name'}</div>
                    <div className="text-sm capitalize text-slate-400">{user?.role || 'Employee'}</div>
                    <button onClick={() => fileInputRef.current?.click()} type="button" className="mt-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">Change Photo</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</span>
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} onBlur={handleUpdateProfileName} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-300 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</span>
                    <input disabled value={user?.email || ''} className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-400" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Security Settings</h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Change Password</h3>
                    <label className="mb-4 block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Current Password</span>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="********" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500" />
                    </label>
                    <label className="mb-4 block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">New Password</span>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500" />
                    </label>
                    <label className="mb-4 block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Confirm New Password</span>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:focus:border-blue-500" />
                    </label>
                    <button type="button" onClick={handlePasswordChange} className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">Update Password</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'newLeaveRequests', label: 'New leave requests', desc: 'Get notified when employees apply for leave' },
                    { key: 'payrollProcessed', label: 'Payroll processed', desc: 'Receive alerts when payroll cycle completes' },
                    { key: 'attendanceAlerts', label: 'Attendance alerts', desc: 'Get notified for late arrivals or absences' },
                    { key: 'newEmployeeJoined', label: 'New employee joined', desc: 'Receive onboarding notifications' },
                    { key: 'performanceReviewsDue', label: 'Performance reviews due', desc: 'Reminders for upcoming review cycles' },
                    { key: 'systemMaintenance', label: 'System maintenance', desc: 'Platform maintenance and downtime alerts' }
                  ].map((item) => {
                    const isEnabled = notifications[item.key as keyof typeof defaultNotifications];
                    return (
                      <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/50">
                        <div>
                          <div className="text-sm font-medium text-slate-950 dark:text-white">{item.label}</div>
                          <div className="text-xs text-slate-400">{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleNotification(item.key as keyof typeof defaultNotifications)}
                          className={`relative h-6 w-11 rounded-full transition ${isEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${isEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Theme Preferences</h2>
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  {THEME_OPTIONS.map((item) => (
                    <button key={item} type="button" onClick={() => setTheme(item)} className={`rounded-2xl border-2 p-4 text-center transition ${theme === item ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-500/10' : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/50'}`}>
                      <div className="mb-3 h-16 rounded-xl border border-slate-200 dark:border-white/10" style={{ background: item === 'dark' ? '#0F172A' : item === 'system' ? 'linear-gradient(135deg,#fff 50%,#0F172A 50%)' : '#fff' }} />
                      <p className={`text-sm font-medium ${theme === item ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{item === 'system' ? 'System Default' : `${item.charAt(0).toUpperCase() + item.slice(1)} Mode`}</p>
                    </button>
                  ))}
                </div>
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Accent Color</h3>
                <div className="flex gap-3">
                  {['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#059669', '#D97706'].map((color) => (
                    <button 
                      key={color} 
                      type="button" 
                      onClick={() => setAccentColor(color)}
                      className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110" 
                      style={{ background: color, borderColor: accentColor === color ? '#0F172A' : 'transparent' }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h2 className="mb-6 text-lg font-semibold text-slate-950 dark:text-white">Role Permissions</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {rolePermissions.map(({ role, permissions }) => {
                      const normalizedUserRole = user?.role?.toLowerCase() || '';
                      const isHrUser = ['hr', 'hr-manager', 'hr manager'].includes(normalizedUserRole);
                      const isMatch = (role === 'HR Manager' && isHrUser) || 
                                      (role.toLowerCase() === normalizedUserRole);

                      return (
                        <div key={role} className={`rounded-2xl border ${isMatch ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/50'} p-4`}>
                          <div className="mb-3 flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isMatch ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                              <Icon name="shield" />
                            </div>
                            <span className={`font-medium ${isMatch ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>{role}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {permissions.map((permission) => (
                              <span key={permission} className={`rounded-full px-2.5 py-1 text-xs ${isMatch ? 'bg-blue-100 text-blue-700 dark:bg-blue-800/40 dark:text-blue-300' : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}