import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import DataTable, { type DataTableColumn } from '../../components/common/DataTable';
import { userAPI } from '../../services/api';
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

  // Action loading states for race-condition guarding
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const toast = useToast();

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

  const handleCreateUser = async (data: AddUserFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await userAPI.createUser({
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password || undefined,
        department: data.department,
        designation: data.designation,
      });

      if (res.data.success) {
        toast.success(`User ${data.name} created successfully!`);
        setIsAddModalOpen(false);
        reset();

        if (res.data.tempPassword) {
          setCreatedTempPassword({
            email: data.email,
            pass: res.data.tempPassword,
          });
        }
        fetchUsers(1, searchQuery, roleFilter);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create user';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    const userId = user._id || user.id;
    if (actionLoadingId || !userId) return;

    const currentRole = String(user.role).toLowerCase();
    if (currentRole === 'admin') {
      toast.error('Admin role cannot be changed');
      return;
    }

    const nextRole = currentRole === 'employee' ? 'hr-manager' : 'employee';
    setActionLoadingId(userId);

    try {
      const res = await userAPI.updateRole(userId, nextRole);
      if (res.data.success) {
        toast.success(
          `Updated ${user.name}'s role to ${nextRole === 'hr-manager' ? 'HR Manager' : 'Employee'}`
        );
        fetchUsers(currentPage, searchQuery, roleFilter);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update user role';
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
        toast.success(`Deactivated ${userToDelete.name}`);
        setUserToDelete(null);
        fetchUsers(currentPage, searchQuery, roleFilter);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to deactivate user';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Columns for frozen DataTable consumption
  const columns: DataTableColumn<User>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'User',
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-3">
            <img
              src={
                row.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=2563eb&color=fff`
              }
              alt={row.name}
              className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-white/10"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {row.designation || row.department || 'General'}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{row.email}</span>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        render: (row) => {
          const r = String(row.role).toLowerCase();
          if (r === 'admin') {
            return (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-400">
                <svg className="h-3.5 w-3.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                </svg>
                System Admin
              </span>
            );
          }
          if (['hr-manager', 'hr manager', 'hr'].includes(r)) {
            return (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                <svg className="h-3.5 w-3.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
                HR Manager
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Employee
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => {
          const active = row.isActive !== false;
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  active ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              {active ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) => {
          const userId = row._id || row.id;
          const r = String(row.role).toLowerCase();
          const isAdmin = r === 'admin';
          const isLoadingAction = actionLoadingId === userId;

          if (isAdmin) {
            return (
              <span className="text-xs font-semibold text-slate-500 italic">Protected Admin</span>
            );
          }

          return (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isLoadingAction}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleRole(row);
                }}
                className="rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
              >
                {isLoadingAction
                  ? 'Updating…'
                  : r === 'employee'
                  ? 'Promote to HR'
                  : 'Demote to Employee'}
              </button>

              <button
                type="button"
                disabled={isLoadingAction}
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToDelete(row);
                }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          );
        },
      },
    ],
    [actionLoadingId]
  );

  return (
    <DashboardLayout title="User Management" userRole="System Admin">
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
              System User Directory
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Admin control panel: Create accounts, manage roles, and enforce security policies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:scale-[1.02] hover:shadow-blue-500/40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>

        {/* Role Filter & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Role:</span>
            {['All', 'employee', 'hr-manager'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                  roleFilter === r
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r === 'All' ? 'All Roles' : r === 'hr-manager' ? 'HR Managers' : 'Employees'}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-400">
            Total Users: <span className="text-white font-bold">{totalItems}</span>
          </div>
        </div>

        {/* DataTable - Consumed as-is without touching internals */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchable
          searchPlaceholder="Search users by name or email…"
          onSearch={(query) => setSearchQuery(query)}
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={10}
          onPageChange={(page) => setCurrentPage(page)}
          rowKey={(row, idx) => row._id || row.id || idx}
        />
      </div>

      {/* ── ADD USER MODAL ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
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
                  Add New User Account
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
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
                    {errors.password && (
                      <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span>
                    )}
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
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating…' : 'Create User'}
                  </button>
                </div>
              </form>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 2-2 2m-2-2 2 2m7 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
    </DashboardLayout>
  );
}
