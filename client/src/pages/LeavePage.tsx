import { useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const initialLeaveRequests = [
  { id: 'LR-001', name: 'John Doe',    department: 'Engineering', type: 'Casual Leave',   days: 2, from: '2026-06-12', to: '2026-06-13', status: 'Pending' },
  { id: 'LR-002', name: 'Priya Nair',  department: 'Marketing',   type: 'Sick Leave',     days: 1, from: '2026-06-10', to: '2026-06-10', status: 'Approved' },
  { id: 'LR-003', name: 'Rahul Mehta', department: 'Sales',       type: 'Earned Leave',   days: 3, from: '2026-06-18', to: '2026-06-20', status: 'Pending' },
  { id: 'LR-004', name: 'Sneha Rao',   department: 'HR',          type: 'Work From Home', days: 1, from: '2026-06-09', to: '2026-06-09', status: 'Rejected' },
  { id: 'LR-005', name: 'Anil Kumar',  department: 'Engineering', type: 'Optional Holiday', days: 1, from: '2026-06-21', to: '2026-06-21', status: 'Approved' },
];

// Status badge colors — dark-theme safe
const statusStyle: Record<string, { text: string; bg: string; dot: string }> = {
  Pending:  { text: 'text-amber-400',   bg: 'bg-amber-500/10  border border-amber-500/20',   dot: 'bg-amber-400'   },
  Approved: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20', dot: 'bg-emerald-400' },
  Rejected: { text: 'text-red-400',     bg: 'bg-red-500/10    border border-red-500/20',      dot: 'bg-red-400'     },
};

export default function LeavePage() {
  const { user } = useAuthContext();
  const displayName = user?.name ?? 'HR Manager';
  const isEmployee = user?.role === 'employee';

  // Local state for optimistic updates
  const [requests, setRequests] = useState(initialLeaveRequests);
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
      return requests.filter(req => req.name === user?.name || req.id === user?.id);
    }
    return requests;
  }, [requests, isEmployee, user?.name, user?.id]);

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
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return;
    
    // Calculate naive days
    const fDate = new Date(fromDate);
    const tDate = new Date(toDate);
    const diffTime = Math.abs(tDate.getTime() - fDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
      id: `LR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: displayName,
      department: user?.department ?? 'Engineering', // Fallback
      type: leaveType,
      days,
      from: fromDate,
      to: toDate,
      status: 'Pending'
    };

    // TODO: wire real leave-application API
    setRequests(prev => [newRequest, ...prev]);
    setFromDate('');
    setToDate('');
    setReason('');
  };

  return (
    <DashboardLayout title="Leave Management">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Leave Management</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Welcome, <span className="font-semibold text-slate-300">{displayName}</span> — {isEmployee ? 'apply for leave and track your requests.' : 'review requests, approve leave, and monitor workforce availability.'}
            </p>
          </div>
          {!isEmployee && (
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
              }}
            >
              Create Policy
            </button>
          )}
        </div>

        {/* ── KPI Summary Cards ── */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Pending',  counts.Pending,  '#F59E0B', isEmployee ? 'Your pending requests' : 'Needs approval', 'PE'],
            ['Approved', counts.Approved, '#22C55E', isEmployee ? 'Your approved leaves' : 'This month',     'AP'],
            ['Rejected', counts.Rejected, '#EF4444', isEmployee ? 'Your rejected leaves' : 'Policy conflicts', 'RJ'],
          ].map(([label, value, color, sub, abbr]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/[0.07] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                  style={{ background: `${color}18`, color: String(color) }}
                >
                  {abbr}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: `${color}18`, color: String(color) }}
                >
                  {totalRequests > 0 ? Math.round((Number(value) / totalRequests) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
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
            className="rounded-2xl border border-white/[0.07] p-6 transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.02)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            <h2 className="mb-4 text-lg font-bold text-white">Apply for Leave</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option className="bg-slate-900 text-white" value="Casual Leave">Casual Leave</option>
                  <option className="bg-slate-900 text-white" value="Sick Leave">Sick Leave</option>
                  <option className="bg-slate-900 text-white" value="Earned Leave">Earned Leave</option>
                  <option className="bg-slate-900 text-white" value="Work From Home">Work From Home</option>
                  <option className="bg-slate-900 text-white" value="Optional Holiday">Optional Holiday</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">From Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">To Date</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical appointment"
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
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
                    ? 'border-transparent text-white'
                    : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.1))',
                        boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.3)',
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
          className="overflow-hidden rounded-2xl border border-white/[0.07]"
          style={{
            background: 'rgba(255,255,255,0.02)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Employee', 'Leave Type', 'Duration', 'Dates', 'Status', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500"
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
                    className={`transition-colors duration-150 hover:bg-white/[0.04] ${
                      index < filtered.length - 1 ? 'border-b border-white/[0.05]' : ''
                    }`}
                  >
                    {/* Employee name + Dept */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                            boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                          }}
                        >
                          {request.name.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-white">{request.name}</span>
                          <span className="block text-xs text-slate-500">{request.department}</span>
                        </span>
                      </div>
                    </td>

                    {/* Leave Type */}
                    <td className="px-4 py-3 text-sm font-semibold text-slate-300">{request.type}</td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-sm text-slate-400">{request.days}d</td>

                    {/* Dates */}
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {request.from} <span className="text-slate-600 px-1">→</span> {request.to}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[request.status].bg} ${statusStyle[request.status].text}`}
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
                            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
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
