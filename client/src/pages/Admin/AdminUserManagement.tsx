import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable, { type DataTableColumn } from '../../components/common/DataTable';
import { userAPI } from '../../services/api';
import { onboardingService, type ApiOnboarding } from '../../services/hrmsApi';
import OnboardingReviewModal from '../../components/onboarding/OnboardingReviewModal';
import { useToast } from '../../context/ToastContext';
import type { User } from '../../types';

// Zod schema for adding new users (Employee or HR Manager only)
const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['employee', 'hr-manager']),
  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: 'Password must be at least 6 characters if provided',
  }),
  department: z.string().optional(),
  designation: z.string().optional(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<{ email: string; pass: string } | null>(null);

  // 2-Step Add User Wizard State
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingOtp, setPendingOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Action loading states for race-condition guarding
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Onboarding Review States
  const [pendingOnboardings, setPendingOnboardings] = useState<ApiOnboarding[]>([]);
  const [selectedOnboarding, setSelectedOnboarding] = useState<ApiOnboarding | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const toast = useToast();

  const fetchPendingOnboardings = useCallback(async () => {
    try {
      const res = await onboardingService.getPendingReviews();
      if (res.success) {
        setPendingOnboardings(res.onboardings || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending onboardings:', err);
    }
  }, []);

  useEffect(() => {
    fetchPendingOnboardings();
  }, [fetchPendingOnboardings]);

  // Countdown timer for 30s resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fetchUsers = useCallback(async (page = 1, search = '', role = 'All') => {
    setLoading(true);
    try {
      const res = await userAPI.getUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: role !== 'All' ? role : undefined,
      });
      const data = res.data;
      if (data.success) {
        setUsers(data.users || []);
        setTotalItems(data.total || 0);
        setCurrentPage(data.page || 1);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load users';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers(currentPage, searchQuery, roleFilter);
  }, [currentPage, searchQuery, roleFilter, fetchUsers]);

  // react-hook-form setup for Add User Modal
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'employee',
      password: '',
      department: '',
      designation: '',
    },
  });

  const resetModalState = useCallback(() => {
    reset();
    setAddStep(1);
    setPendingId(null);
    setPendingEmail('');
    setPendingOtp('');
    setOtpError(null);
  }, [reset]);

  // Step 1: Initiate User Creation
  const handleInitiateUser = async (data: AddUserFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await userAPI.initiateUser({
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        designation: data.designation,
      });

      if (res.data.success) {
        setPendingId(res.data.pendingId || null);
        setPendingEmail(res.data.email || data.email);
        setAddStep(2);
        setResendCooldown(30);
        toast.success(`Verification code sent to ${data.email}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to initiate user creation';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Confirm OTP & Create User
  const handleConfirmUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!pendingOtp.trim() || pendingOtp.trim().length < 6) {
      setOtpError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    const data = getValues();

    try {
      const res = await userAPI.confirmUser({
        pendingId: pendingId || undefined,
        email: pendingEmail,
        otp: pendingOtp.trim(),
        password: data.password || undefined,
      });

      if (res.data.success) {
        toast.success(`User ${pendingEmail} created successfully!`);
        setIsAddModalOpen(false);
        resetModalState();

        if (res.data.tempPassword) {
          setCreatedTempPassword({
            email: pendingEmail,
            pass: res.data.tempPassword,
          });
        }
        fetchUsers(1, searchQuery, roleFilter);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired code';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await userAPI.resendPendingOtp({
        pendingId: pendingId || undefined,
        email: pendingEmail,
      });

      if (res.data.success) {
        toast.success(`New verification code sent to ${pendingEmail}`);
        setResendCooldown(30);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend code';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNormalizedRole = (rawRole?: string) => {
    if (!rawRole) return 'employee';
    const r = String(rawRole).toLowerCase().replace(/\s+/g, '-');
    if (r === 'admin') return 'admin';
    if (r.includes('hr')) return 'hr-manager';
    return 'employee';
  };

  const handleToggleRole = async (user: User) => {
    if (actionLoadingId) return;

    const userId = user._id || (user as any).id;
    if (!userId) {
      toast.error('Cannot update role: user ID is missing.');
      return;
    }

    const normRole = getNormalizedRole(user.role);
    if (normRole === 'admin') {
      toast.error('Admin role cannot be changed');
      return;
    }

    const nextRole = normRole === 'employee' ? 'hr-manager' : 'employee';
    setActionLoadingId(userId);

    try {
      const res = await userAPI.updateRole(userId, nextRole);
      if (res.data.success) {
        toast.success(`Updated ${user.name}'s role to ${nextRole === 'hr-manager' ? 'HR Manager' : 'Employee'}`);
        const updatedUserObj = res.data.user;
        // Optimistic local state update for instant UI feedback
        setUsers((prev) =>
          prev.map((u) => {
            const uId = u._id || (u as any).id;
            if (uId === userId) {
              return updatedUserObj ? { ...u, ...updatedUserObj, role: nextRole } : { ...u, role: nextRole };
            }
            return u;
          })
        );
        fetchUsers(currentPage, searchQuery, roleFilter);
      } else {
        toast.error(res.data.message || 'Failed to update role');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update role';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete._id || userToDelete.id;
    if (!userId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await userAPI.deleteUser(userId);
      if (res.data.success) {
        toast.success(`User ${userToDelete.name} deactivated successfully!`);
        // Optimistic local state update
        setUsers((prev) => prev.filter((u) => (u._id || (u as any).id) !== userId));
        setUserToDelete(null);
        fetchUsers(currentPage, searchQuery, roleFilter);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete user';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'User Info',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-sm font-bold text-blue-400 border border-blue-500/30">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-semibold text-white">{user.name}</div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => {
        const normRole = getNormalizedRole(user.role);
        let bgClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        let label = 'Employee';

        if (normRole === 'admin') {
          bgClass = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
          label = 'System Admin';
        } else if (normRole === 'hr-manager') {
          bgClass = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
          label = 'HR Manager';
        }

        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bgClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      render: (user: User) => <span className="text-slate-300 font-medium">{user.department || 'General'}</span>,
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (user: User) => <span className="text-slate-300 font-medium">{user.designation || 'Staff'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            user.isActive !== false
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border-red-500/30'
          }`}
        >
          {user.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => {
        const userId = user._id || (user as any).id;
        const normRole = getNormalizedRole(user.role);
        const isCurrentAdmin = normRole === 'admin';
        const isLoadingThis = actionLoadingId === userId;

        if (isCurrentAdmin) {
          return <span className="text-xs font-semibold text-slate-500 italic">Protected</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleRole(user)}
              disabled={isLoadingThis}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {isLoadingThis ? '...' : normRole === 'employee' ? 'Make HR' : 'Make Employee'}
            </button>

            <button
              type="button"
              onClick={() => setUserToDelete(user)}
              disabled={isLoadingThis}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin User Management</h1>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Create, manage, and assign system access permissions across your organization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const pending = pendingOnboardings.find(o => o.reviewStatus === 'Pending Review') || pendingOnboardings[0] || null;
                setSelectedOnboarding(pending);
                setIsReviewModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 text-sm font-bold text-amber-300 shadow-lg transition hover:bg-amber-500/30"
            >
              <ShieldCheck className="h-4 w-4" />
              Onboarding Reviews ({pendingOnboardings.filter(o => o.reviewStatus === 'Pending Review').length} Pending)
            </button>

            <button
              type="button"
              onClick={() => {
                resetModalState();
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-600/40"
            >
              + Add New User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500"
            >
              <option value="All">All Roles</option>
              <option value="employee">Employee</option>
              <option value="hr-manager">HR Manager</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* ── TWO-STEP ADD USER MODAL ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => {
                setIsAddModalOpen(false);
                resetModalState();
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl z-10"
            >
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {addStep === 1 ? 'Add New User (Step 1 of 2)' : 'Confirm User Email (Step 2 of 2)'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetModalState();
                  }}
                  className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* STEP 1 FORM */}
              {addStep === 1 && (
                <form onSubmit={handleSubmit(handleInitiateUser)} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-300">Full Name *</span>
                    <input
                      {...register('name')}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                    />
                    {errors.name && (
                      <span className="mt-1 block text-xs text-red-400">{errors.name.message}</span>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-300">Email Address *</span>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="john@company.com"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                    />
                    {errors.email && (
                      <span className="mt-1 block text-xs text-red-400">{errors.email.message}</span>
                    )}
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-300">Role *</span>
                      <select
                        {...register('role')}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                      >
                        <option value="employee">Employee</option>
                        <option value="hr-manager">HR Manager</option>
                      </select>
                      {errors.role && (
                        <span className="mt-1 block text-xs text-red-400">{errors.role.message}</span>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-300">
                        Initial Password (Optional)
                      </span>
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="Auto-generated if empty"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-300">Department</span>
                      <input
                        {...register('department')}
                        placeholder="e.g. Engineering"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-300">Designation</span>
                      <input
                        {...register('designation')}
                        placeholder="e.g. Software Engineer"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        resetModalState();
                      }}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending Code…' : 'Send Verification Code →'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2 FORM */}
              {addStep === 2 && (
                <form onSubmit={handleConfirmUser} className="space-y-4">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-300">
                    A 6-digit verification OTP code was sent to <strong className="text-white">{pendingEmail}</strong>. Enter the code below to confirm and create the account.
                  </div>

                  {otpError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400 text-center">
                      {otpError}
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">6-Digit Verification OTP Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pendingOtp}
                      onChange={(e) => setPendingOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full tracking-[8px] text-center font-mono text-2xl font-bold text-blue-400 rounded-2xl border border-white/10 bg-slate-950 py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isSubmitting}
                      onClick={handleResendOtp}
                      className="font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddStep(1)}
                      className="text-slate-400 hover:text-white font-medium"
                    >
                      ← Edit User Details
                    </button>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        resetModalState();
                      }}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !pendingOtp || pendingOtp.length < 6}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating User…' : 'Confirm & Create User'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TEMP PASSWORD NOTIFICATION MODAL ── */}
      <AnimatePresence>
        {createdTempPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setCreatedTempPassword(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl z-10 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Temporary Password Generated</h3>
              <p className="mt-1 text-xs text-slate-400">
                Provide these credentials to <span className="font-bold text-white">{createdTempPassword.email}</span>.
              </p>

              <div className="my-4 rounded-xl border border-white/10 bg-slate-950 p-3.5 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-emerald-400 select-all">
                  {createdTempPassword.pass}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdTempPassword.pass);
                    toast.success('Copied password to clipboard!');
                  }}
                  className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                >
                  Copy
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCreatedTempPassword(null)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SOFT DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl z-10"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirm User Deactivation
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Are you sure you want to deactivate <span className="font-bold text-white">{userToDelete.name}</span> ({userToDelete.email})?
                This will soft-delete their account and set status to Inactive.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeleteUser}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deactivating…' : 'Yes, Deactivate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ONBOARDING REVIEW MODAL ── */}
      <OnboardingReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onboarding={selectedOnboarding}
        onReviewSubmit={() => {
          fetchPendingOnboardings();
          fetchUsers(currentPage, searchQuery, roleFilter);
        }}
      />
    </DashboardLayout>
  );
}
