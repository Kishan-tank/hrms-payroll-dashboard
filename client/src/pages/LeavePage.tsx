import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { leaveService, ApiLeave } from '../services/hrmsApi';
import { useAuth } from '../hooks/useAuth';

// Status badge colors — dual-theme safe
const statusStyle: Record<string, { light: string; dark: string; dot: string }> = {
  Pending:  { light: 'bg-amber-50 text-amber-600 border border-amber-200',     dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',     dot: 'bg-amber-500 dark:bg-amber-400' },
  Approved: { light: 'bg-emerald-50 text-emerald-600 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Rejected: { light: 'bg-red-50 text-red-600 border border-red-200',           dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',           dot: 'bg-red-500 dark:bg-red-400' },
};

export default function LeavePage() {
  const { user } = useAuth();
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
      setLeaveRequests(res.leaves);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeaves();
  }, [fetchLeaves]);

  const filtered = useMemo(() => (filter === 'All' ? leaveRequests : leaveRequests.filter((item) => item.status === filter)), [filter, leaveRequests]);
  
  const counts = {
    Pending: leaveRequests.filter((item) => item.status === 'Pending').length,
    Approved: leaveRequests.filter((item) => item.status === 'Approved').length,
    Rejected: leaveRequests.filter((item) => item.status === 'Rejected').length,
  };

  return (
    <DashboardLayout title="Leave Management" userName={user?.name || "Employee"} userRole={user?.role || "Employee"}>
      <div className="space-y-5">
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

        {error && <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>}

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

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Employee', 'Leave Type', 'Duration', 'Dates', 'Status', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">No leave requests found.</td></tr>
              ) : filtered.map((request, index) => (
                <tr key={request._id} className={index < filtered.length - 1 ? 'border-b border-slate-100 hover:bg-slate-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{request.employeeId?.name?.charAt(0) || '?'}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{request.employeeId?.name || 'Unknown'}</span>
                        <span className="block text-xs text-slate-400">{request.employeeId?.department || '-'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{request.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{request.days}d</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{request.fromDate?.split('T')[0]} - {request.toDate?.split('T')[0]}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[request.status] || 'bg-slate-50 text-slate-600'}`}>{request.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">Approve</button>
                      <button type="button" className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">Reject</button>
                    </div>
                  </td>
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
