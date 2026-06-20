import { useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';

const initialLeaveRequests = [
  { id: 'LR-001', employeeId: 'emp-001', name: 'John Doe',    department: 'Engineering', type: 'Casual Leave',   days: 2, from: '2026-06-12', to: '2026-06-13', reason: 'Family event', status: 'Pending' },
  { id: 'LR-002', employeeId: 'emp-002', name: 'Priya Nair',  department: 'Marketing',   type: 'Sick Leave',     days: 1, from: '2026-06-10', to: '2026-06-10', reason: 'Fever', status: 'Approved' },
  { id: 'LR-003', employeeId: 'emp-003', name: 'Rahul Mehta', department: 'Sales',       type: 'Earned Leave',   days: 3, from: '2026-06-18', to: '2026-06-20', reason: 'Vacation', status: 'Pending' },
  { id: 'LR-004', employeeId: 'emp-004', name: 'Sneha Rao',   department: 'HR',          type: 'Work From Home', days: 1, from: '2026-06-09', to: '2026-06-09', reason: 'Doctor appointment', status: 'Rejected' },
  { id: 'LR-005', employeeId: 'emp-005', name: 'Anil Kumar',  department: 'Engineering', type: 'Optional Holiday', days: 1, from: '2026-06-21', to: '2026-06-21', reason: 'Festival', status: 'Approved' },
];

// Status badge colors — dual-theme safe
const statusStyle: Record<string, { light: string; dark: string; dot: string }> = {
  Pending:  { light: 'bg-amber-50 text-amber-600 border border-amber-200',     dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',     dot: 'bg-amber-500 dark:bg-amber-400' },
  Approved: { light: 'bg-emerald-50 text-emerald-600 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Rejected: { light: 'bg-red-50 text-red-600 border border-red-200',           dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',           dot: 'bg-red-500 dark:bg-red-400' },
};

export default function LeavePage() {
  const { user } = useAuthContext();
  const toast = useToast();
  const displayName = user?.name ?? 'HR Manager';
  const isEmployee = user?.role === 'employee';

  const getCurrentEmployeeId = () => {
    return (user as any)?.employeeId || user?.id || (user as any)?._id || "";
  };
  const currentEmployeeId = getCurrentEmployeeId();

  // Local state for optimistic updates
  const [requests, setRequests] = useState(() => {
    // Assign the first two mock requests to the logged-in employee so they always have data to see
    return initialLeaveRequests.map((req, i) => {
      if (isEmployee && (i === 0 || i === 1)) {
        return { ...req, name: user?.name || 'Employee', employeeId: currentEmployeeId || 'emp-fallback' };
      }
      return req;
    });
  });
  const [filter, setFilter] = useState('All');
  
  // Employee Form State
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  
  const filters = ['All', 'Pending', 'Approved', 'Rejected'];
  
  // Base requests based on role
  const roleRequests = useMemo(() => {
    if (isEmployee) {
      return requests.filter(
        (request) =>
          request.employeeId &&
          currentEmployeeId &&
          request.employeeId === currentEmployeeId
      );
    }
    return requests;
  }, [requests, isEmployee, currentEmployeeId]);

  const filtered = useMemo(() => {
    return filter === 'All' ? roleRequests : roleRequests.filter((item) => item.status === filter);
  }, [filter, roleRequests]);

  const counts = useMemo(() => ({
    Pending: roleRequests.filter((item) => item.status === 'Pending').length,
    Approved: roleRequests.filter((item) => item.status === 'Approved').length,
    Rejected: roleRequests.filter((item) => item.status === 'Rejected').length,
  }), [roleRequests]);

  const totalRequests = roleRequests.length;

  const handleUpdateStatus = (id: string, newStatus: string) => {
    // TODO: wire real leave-approval API
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    if (newStatus === 'Approved') toast.success('Leave request approved.');
    if (newStatus === 'Rejected') toast.error('Leave request rejected.');
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return;
    
    if (!currentEmployeeId) {
      toast.error('Unable to identify employee session. Please login again.');
      return;
    }
    
    // Calculate naive days
    const fDate = new Date(fromDate);
    const tDate = new Date(toDate);
    const diffTime = Math.abs(tDate.getTime() - fDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
      id: `LR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      employeeId: currentEmployeeId,
      name: user?.name || 'Employee',
      department: user?.department ?? 'Engineering', // Fallback
      type: leaveType,
      days,
      from: fromDate,
      to: toDate,
      reason,
      status: 'Pending'
    };

    // TODO: wire real leave-application API
    setRequests(prev => [newRequest, ...prev]);
    setFromDate('');
    setToDate('');
    setReason('');
    toast.success('Leave application submitted successfully.');
  };

  return (
    <DashboardLayout title="Leave Management">
      {/* Ambient glows — only visible in dark mode */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
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
              onClick={() => toast.info('Create Policy is coming soon.')}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              Create Policy
            </button>
          )}
        </div>

        {/* ── KPI Summary Cards ── */}
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
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${classes}`}
                >
                  {abbr}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${classes}`}
                >
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
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                }}
              >
                Submit Request
              </button>
            </div>
          </form>
        )}

        {/* ── Filters ── */}
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
                    ? 'border-transparent text-blue-700 bg-blue-50 dark:text-white'
                    : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121] dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))',
                        boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)',
                      }
                    : {}
                }
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* ── Requests Table ── */}
        <div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]">
                  {['Employee', 'Leave Type', 'Duration', 'Dates', 'Reason', 'Status', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-white/[0.03] ${
                      index < filtered.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''
                    }`}
                  >
                    {/* Employee name + Dept */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                          }}
                        >
                          {request.name.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">{request.name}</span>
                          <span className="block text-xs text-slate-500">{request.department}</span>
                        </span>
                      </div>
                    </td>

                    {/* Leave Type */}
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{request.type}</td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{request.days}d</td>

                    {/* Dates */}
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {request.from} <span className="text-slate-400 dark:text-slate-600 px-1">→</span> {request.to}
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-[150px] truncate" title={request.reason}>
                      {request.reason || '—'}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[request.status].light} ${statusStyle[request.status].dark}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle[request.status].dot}`} />
                        {request.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {!isEmployee && request.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(request.id, 'Approved')}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No leave requests found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
