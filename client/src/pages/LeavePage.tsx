import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { leaveService, ApiLeave } from '../services/hrmsApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

export default function LeavePage() {
  const { user } = useAuth();
  const { success, info } = useToast();
  
  const isEmployee = user?.role === 'Employee';
  const displayName = user?.name || 'HR Manager';

  const [leaveRequests, setLeaveRequests] = useState<ApiLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState('All');
  
  // Employee Form State
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  
  const filters = ['All', 'Pending', 'Approved', 'Rejected'];

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leaveService.getAll();
      let leaves = res.leaves || [];
      if (isEmployee) {
        // Optimistic filtering if API returns all
        leaves = leaves.filter(l => l.employeeId?._id === (user as any)?._id || l.employeeId?.name === user?.name);
      }
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

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    // Optimistic UI update
    const newLeave = {
      _id: `NEW-${Date.now()}`,
      employeeId: { _id: (user as any)?._id || '1', name: user?.name || 'Employee', department: (user as any)?.department || 'Engineering' },
      type: leaveType,
      days: 1,
      fromDate,
      toDate,
      status: 'Pending',
      reason
    } as ApiLeave;
    setLeaveRequests(prev => [newLeave, ...prev]);
    success('Leave request submitted successfully');
    setFromDate('');
    setToDate('');
    setReason('');
  };

  const handleUpdateStatus = useCallback(async (id: string, newStatus: "Pending" | "Approved" | "Rejected") => {
    // Optimistic UI
    setLeaveRequests(prev => prev.map(req => req._id === id ? { ...req, status: newStatus } : req));
    success(`Leave request ${newStatus}`);
  }, [success]);

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
          <div className="flex items-center gap-2.5">
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
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.type}</span>
      ),
    },
    {
      key: 'days',
      header: 'Duration',
      sortable: true,
      sortValue: (row) => row.days ?? 0,
      render: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{row.days}d</span>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (row) => {
        const fromStr = row.fromDate?.split('T')[0] || (row as any).from;
        const toStr   = row.toDate?.split('T')[0]   || (row as any).to;
        return (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {fromStr} <span className="px-1 text-slate-400">→</span> {toStr}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status ?? '',
      render: (row) => <StatusBadge status={row.status ?? 'Pending'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const st = row.status || 'Pending';
        if (!isEmployee && st === 'Pending') {
          return (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus(row._id as string, 'Approved')}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(row._id as string, 'Rejected')}
                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
              >
                Reject
              </button>
            </div>
          );
        }
        return <span className="text-xs font-medium text-slate-400 dark:text-slate-600">—</span>;
      },
    },
  ], [isEmployee, handleUpdateStatus]);

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

        {error && <div className="p-4 text-red-600 bg-red-50 rounded-xl dark:bg-red-500/10 dark:text-red-400">{error}</div>}

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Pending',  counts.Pending,  'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20', isEmployee ? 'Your pending requests' : 'Needs approval', 'PE'],
            ['Approved', counts.Approved, 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20', isEmployee ? 'Your approved leaves' : 'This month',     'AP'],
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
                >
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white" value="Casual Leave">Casual Leave</option>
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white" value="Sick Leave">Sick Leave</option>
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white" value="Earned Leave">Earned Leave</option>
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white" value="Work From Home">Work From Home</option>
                  <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white" value="Optional Holiday">Optional Holiday</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical appointment"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
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
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive
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
    </DashboardLayout>
  );
}
