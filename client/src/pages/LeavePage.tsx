import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DashboardLayout from '../layouts/DashboardLayout';
import { leaveService, ApiLeave } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ContextMenu from '../components/common/ContextMenu';
import { useContextMenu } from '../hooks/useContextMenu';
import LeaveApprovalModal from '../components/leave/LeaveApprovalModal';

const leaveSchema = z.object({
  leaveType: z.string().min(1),
  fromDate: z.string().min(1, 'Start date is required'),
  toDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(3, 'Please provide a reason (min 3 characters)'),
}).refine(
  (data) => !data.fromDate || !data.toDate || new Date(data.toDate) >= new Date(data.fromDate),
  { message: 'End date must be on or after start date', path: ['toDate'] }
);

type LeaveFormData = z.infer<typeof leaveSchema>;

export default function LeavePage() {
  const { user } = useAuthContext();
  const { success, info, error: toastError } = useToast();
  // Safely check role regardless of casing
  const normalizedRole = user?.role?.toLowerCase() || '';
  const isEmployee = !['hr', 'hr-manager', 'admin'].includes(normalizedRole);
  const displayName = user?.name || 'HR Manager';

  const { menuProps, handleContextMenu } = useContextMenu();
  const contextTargetRef = useRef<ApiLeave | null>(null);

  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [pendingApproval, setPendingApproval] = useState<{
    leave: ApiLeave;
    action: 'Approved' | 'Rejected';
  } | null>(null);

  function requestApproval(leave: ApiLeave, action: 'Approved' | 'Rejected') {
    setPendingApproval({ leave, action });
  }

  function confirmApproval() {
    if (!pendingApproval) return;
    void handleUpdateStatus(pendingApproval.leave._id as string, pendingApproval.action);
  }

  function buildLeaveMenuItems(row: ApiLeave) {
    const isPending = row.status === 'Pending';
    const items: any[] = [
      { label: 'View details', icon: 'eye', onClick: () => { /* no-op */ } },
    ];
    if (!isEmployee && isPending) {
      items.push(
        { label: 'Approve', icon: 'circle-check', onClick: () => requestApproval(row, 'Approved') },
        { label: 'Reject', icon: 'circle-x', variant: 'danger', onClick: () => requestApproval(row, 'Rejected') }
      );
    }
    return items;
  }

  const [leaveRequests, setLeaveRequests] = useState<ApiLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState('All');

  // Employee Form State
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' }
  });

  const [isFormLeaveTypeOpen, setIsFormLeaveTypeOpen] = useState(false);
  const leaveTypeOptions = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Work From Home', 'Optional Holiday'];
  const filters = ['All', 'Pending', 'Approved', 'Rejected'];

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leaveService.getAll();
      let leaves = res.leaves || [];
      setLeaveRequests(leaves);
      setError('');
    } catch (err: any) {
      // Mock data fallback if API fails
      setLeaveRequests([
        { _id: 'LR-001', employeeId: { name: 'John Doe', department: 'Engineering' }, type: 'Casual Leave', days: 2, fromDate: '2026-06-12', toDate: '2026-06-13', status: 'Pending' },
        { _id: 'LR-002', employeeId: { name: 'Priya Nair', department: 'Marketing' }, type: 'Sick Leave', days: 1, fromDate: '2026-06-10', toDate: '2026-06-10', status: 'Approved' },
        { _id: 'LR-003', employeeId: { name: 'Rahul Mehta', department: 'Sales' }, type: 'Earned Leave', days: 3, fromDate: '2026-06-18', toDate: '2026-06-20', status: 'Pending' },
      ] as any[]);
    } finally {
      setLoading(false);
    }
  }, [isEmployee, user]);

  useEffect(() => {
    void fetchLeaves();
  }, [fetchLeaves]);

  const filtered = useMemo(() => (filter === 'All' ? leaveRequests : leaveRequests.filter((item) => item.status === filter)), [filter, leaveRequests]);

  const counts = {
    Pending: leaveRequests.filter((item) => item.status === 'Pending').length,
    Approved: leaveRequests.filter((item) => item.status === 'Approved').length,
    Rejected: leaveRequests.filter((item) => item.status === 'Rejected').length,
  };

  const totalRequests = leaveRequests.length;

  const handleApplyLeave = handleSubmit(async (data: LeaveFormData) => {
    try {
      // Calculate days
      const start = new Date(data.fromDate);
      const end = new Date(data.toDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

      await leaveService.apply({
        type: data.leaveType,
        fromDate: data.fromDate,
        toDate: data.toDate,
        days,
        reason: data.reason
      });

      success('Leave request submitted successfully');
      reset();
      
      // Refetch from backend to get the real saved data
      await fetchLeaves();
    } catch (err: any) {
      setError(err.message || 'Failed to apply for leave');
    }
  });

  const handleUpdateStatus = useCallback(async (id: string, newStatus: "Pending" | "Approved" | "Rejected") => {
    setApprovingIds(prev => new Set(prev).add(id));
    try {
      await leaveService.updateStatus(id, newStatus);
      setLeaveRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
      success(`Leave request ${newStatus.toLowerCase()}.`);
    } catch (err: any) {
      console.error('Leave status update failed:', err);
      toastError(err.response?.data?.message || 'Failed to update leave status');
      setLeaveRequests(prev => prev.map(req => req._id === id ? { ...req } : req));
    } finally {
      setApprovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setPendingApproval(null);
    }
  }, [success, toastError]);

  // ── Columns defined inside component — Actions column closes over
  //    isEmployee and handleUpdateStatus. Dep array: [isEmployee, handleUpdateStatus].
  const columns = useMemo<DataTableColumn<ApiLeave>[]>(() => [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      sortValue: (row) => row.employeeId?.name ?? '',
      render: (row) => {
        const empName = row.employeeId?.name || (row as any).name || 'Unknown';
        const empDept = row.employeeId?.department || (row as any).department || 'Engineering';
        return (
          <div className="flex h-full w-full items-center gap-2.5" onMouseEnter={() => { contextTargetRef.current = row; }}>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
            >
              {empName.charAt(0)}
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900 dark:text-white">{empName}</span>
              <span className="block text-xs text-slate-500">{empDept}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Leave Type',
      sortable: true,
      render: (row) => (
        <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.type}</span>
        </div>
      ),
    },
    {
      key: 'days',
      header: 'Duration',
      sortable: true,
      sortValue: (row) => row.days ?? 0,
      render: (row) => (
        <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}>
          <span className="text-sm text-slate-500 dark:text-slate-400">{row.days}d</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (row) => {
        const fromStr = row.fromDate?.split('T')[0] || (row as any).from;
        const toStr = row.toDate?.split('T')[0] || (row as any).to;
        return (
          <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {fromStr} <span className="px-1 text-slate-400">→</span> {toStr}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status ?? '',
      render: (row) => (
        <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}>
          <StatusBadge status={row.status ?? 'Pending'} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const st = row.status || 'Pending';
        const isApproving = approvingIds.has(row._id as string);
        
        if (!isEmployee && st === 'Pending') {
          return (
            <div className="flex h-full w-full items-center gap-2" 
                 onMouseEnter={() => { contextTargetRef.current = row; }}>
              <button
                type="button"
                disabled={isApproving}
                onClick={() => requestApproval(row, 'Approved')}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 
                           text-xs font-bold text-emerald-600 transition 
                           hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed
                           dark:border-emerald-500/30 dark:bg-emerald-500/20 
                           dark:text-emerald-400 dark:hover:bg-emerald-500/30"
              >
                {isApproving ? (
                  <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                ) : 'Approve'}
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={() => requestApproval(row, 'Rejected')}
                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 
                           text-xs font-bold text-red-600 transition 
                           hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed
                           dark:border-red-500/30 dark:bg-red-500/20 
                           dark:text-red-400 dark:hover:bg-red-500/30"
              >
                {isApproving ? (
                  <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                ) : 'Reject'}
              </button>
            </div>
          );
        }
        return (
          <div className="flex h-full w-full items-center" 
               onMouseEnter={() => { contextTargetRef.current = row; }}>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-600">—</span>
          </div>
        );
      },
    },
  ], [isEmployee, handleUpdateStatus, approvingIds]);

  return (
    <DashboardLayout title="Leave Management" userName={user?.name || "Employee"} userRole={user?.role || "Employee"}>
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Leave Management</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{displayName}</span> — {isEmployee ? 'apply for leave and track your requests.' : 'review requests, approve leave, and monitor workforce availability.'}
            </p>
          </div>
          {!isEmployee && (
            <button
              type="button"
              onClick={() => info('Create Policy is coming soon')}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              Create Policy
            </button>
          )}
        </div>

        {error && (
          <ErrorState
            size="sm"
            description={error}
          />
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Pending', counts.Pending, 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20', isEmployee ? 'Your pending requests' : 'Needs approval', 'PE'],
            ['Approved', counts.Approved, 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20', isEmployee ? 'Your approved leaves' : 'This month', 'AP'],
            ['Rejected', counts.Rejected, 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-500/20', isEmployee ? 'Your rejected leaves' : 'Policy conflicts', 'RJ'],
          ].map(([label, value, classes, sub, abbr]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-white/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${classes}`}>
                  {abbr}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${classes}`}>
                  {totalRequests > 0 ? Math.round((Number(value) / totalRequests) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Employee Apply Leave Form ── */}
        {isEmployee && (
          <form
            onSubmit={handleApplyLeave}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Apply for Leave</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leave Type</label>
                <div className="block relative">
                  <button
                    type="button"
                    onClick={() => setIsFormLeaveTypeOpen(!isFormLeaveTypeOpen)}
                    className={`flex items-center justify-between gap-2 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none dark:bg-[#111827] dark:text-white ${errors.leaveType ? 'border-red-300' : 'border-slate-200 dark:border-white/10 focus:border-blue-500'}`}
                  >
                    <span className={watch('leaveType') ? '' : 'text-slate-400 dark:text-slate-500'}>
                      {watch('leaveType') || 'Select Leave Type'}
                    </span>
                    <svg className={`h-4 w-4 text-slate-400 transition-transform dark:text-slate-500 ${isFormLeaveTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {isFormLeaveTypeOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFormLeaveTypeOpen(false)} />
                      <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-48 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-none">
                        {leaveTypeOptions.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => { setValue('leaveType', type, { shouldValidate: true, shouldDirty: true }); setIsFormLeaveTypeOpen(false); }}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                              watch('leaveType') === type
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {errors.leaveType && <span className="mt-1 block text-xs text-red-500">{errors.leaveType.message}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  {...register('fromDate')}
                  className={`rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:bg-[#111827] dark:text-white [color-scheme:light] dark:[color-scheme:dark] ${errors.fromDate ? 'border-red-300' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.fromDate && <span className="mt-1 text-xs text-red-500">{errors.fromDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  {...register('toDate')}
                  className={`rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:bg-[#111827] dark:text-white [color-scheme:light] dark:[color-scheme:dark] ${errors.toDate ? 'border-red-300' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.toDate && <span className="mt-1 text-xs text-red-500">{errors.toDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Medical appointment"
                  {...register('reason')}
                  className={`rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:bg-[#111827] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${errors.reason ? 'border-red-300' : 'border-slate-200 dark:border-white/10'}`}
                />
                {errors.reason && <span className="mt-1 text-xs text-red-500">{errors.reason.message}</span>}
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                Submit Request
              </button>
            </div>
          </form>
        )}

        {/* ── Filters — unchanged, stay outside DataTable ── */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => {
            const isActive = filter === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${isActive
                  ? 'border-transparent text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121] dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white'
                  }`}
                style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)' } : {}}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* ── Leave Requests DataTable ── */}
        {/* data={filtered} — receives the pill-filtered slice, not raw leaveRequests */}
        {/* Table - Desktop */}
        <div className="hidden md:block" onContextMenu={(e) => {
          if (!contextTargetRef.current) return;
          handleContextMenu(e, buildLeaveMenuItems(contextTargetRef.current));
        }}>
          <DataTable<ApiLeave>
            columns={columns}
            data={filtered}
            rowKey={(row, i) => row._id ?? i}
            loading={loading}
            searchable
            searchPlaceholder="Search by name, department, or leave type…"
            getSearchText={(row) =>
              [
                row.employeeId?.name,
                row.employeeId?.department,
                row.type,
                row.status,
              ]
                .filter(Boolean)
                .join(' ')
            }
            pageSize={10}
            minWidth={900}
            emptyState={
              <EmptyState
                icon={
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                title="No leave requests found"
                description={
                  filter === 'All'
                    ? 'No leave requests have been submitted yet.'
                    : `No ${filter.toLowerCase()} requests found.`
                }
              />
            }
          />
        </div>

        {/* Mobile Cards View */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.map((leave, i) => {
            const empName = leave.employeeId?.name || (leave as any).name || 'Unknown';
            const empDept = leave.employeeId?.department || (leave as any).department || 'Engineering';
            const fromStr = leave.fromDate?.split('T')[0] || (leave as any).from;
            const toStr   = leave.toDate?.split('T')[0]   || (leave as any).to;
            const st = leave.status || 'Pending';

            return (
              <div 
                key={leave._id ?? i} 
                className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
                    >
                      {empName.charAt(0)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{empName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{empDept}</p>
                    </div>
                  </div>
                  <StatusBadge status={st} />
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
                  <div>
                    <p className="text-slate-400">Leave Type</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{leave.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{leave.days}d</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400">Dates</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {fromStr} <span className="text-slate-400 mx-1">&rarr;</span> {toStr}
                    </p>
                  </div>
                </div>

                {!isEmployee && st === 'Pending' && (
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(leave._id as string, 'Approved')}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(leave._id as string, 'Rejected')}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
              <p className="text-sm font-semibold text-slate-500">No leave requests found.</p>
            </div>
          )}
        </div>

      </div>
      <LeaveApprovalModal
        open={pendingApproval !== null}
        action={pendingApproval?.action ?? null}
        leave={pendingApproval?.leave ?? null}
        onConfirm={confirmApproval}
        onCancel={() => setPendingApproval(null)}
        loading={pendingApproval ? approvingIds.has(pendingApproval.leave._id as string) : false}
      />
      <ContextMenu {...menuProps} />
    </DashboardLayout>
  );
}
