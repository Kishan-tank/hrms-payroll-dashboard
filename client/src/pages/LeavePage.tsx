import { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const leaveRequests = [
  { name: 'John Doe', department: 'Engineering', type: 'Casual Leave', days: 2, from: '2026-06-12', to: '2026-06-13', status: 'Pending' },
  { name: 'Priya Nair', department: 'Marketing', type: 'Sick Leave', days: 1, from: '2026-06-10', to: '2026-06-10', status: 'Approved' },
  { name: 'Rahul Mehta', department: 'Sales', type: 'Earned Leave', days: 3, from: '2026-06-18', to: '2026-06-20', status: 'Pending' },
  { name: 'Sneha Rao', department: 'HR', type: 'Work From Home', days: 1, from: '2026-06-09', to: '2026-06-09', status: 'Rejected' },
  { name: 'Anil Kumar', department: 'Engineering', type: 'Optional Holiday', days: 1, from: '2026-06-21', to: '2026-06-21', status: 'Approved' },
];

const statusClass: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-600',
  Approved: 'bg-emerald-50 text-emerald-600',
  Rejected: 'bg-red-50 text-red-600',
};

export default function LeavePage() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Pending', 'Approved', 'Rejected'];
  const filtered = useMemo(() => (filter === 'All' ? leaveRequests : leaveRequests.filter((item) => item.status === filter)), [filter]);
  const counts = {
    Pending: leaveRequests.filter((item) => item.status === 'Pending').length,
    Approved: leaveRequests.filter((item) => item.status === 'Approved').length,
    Rejected: leaveRequests.filter((item) => item.status === 'Rejected').length,
  };

  return (
    <DashboardLayout title="Leave Management" userName="Anil Kumar" userRole="HR Manager">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Leave Management</h1>
            <p className="text-sm text-slate-400">Review requests, approve leave, and monitor workforce availability.</p>
          </div>
          <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white" type="button">Create Policy</button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Pending', counts.Pending, '#F59E0B', 'Needs approval'],
            ['Approved', counts.Approved, '#22C55E', 'This month'],
            ['Rejected', counts.Rejected, '#EF4444', 'Policy conflicts'],
          ].map(([label, value, color, sub]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{String(label).slice(0, 2).toUpperCase()}</span>
                <span className="text-xs font-bold text-slate-400">{sub}</span>
              </div>
              <p className="text-3xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-bold ${filter === item ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-500'}`}>
              {item}
            </button>
          ))}
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
              {filtered.map((request, index) => (
                <tr key={`${request.name}-${request.from}`} className={index < filtered.length - 1 ? 'border-b border-slate-100 hover:bg-slate-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{request.name.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{request.name}</span>
                        <span className="block text-xs text-slate-400">{request.department}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{request.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{request.days}d</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{request.from} - {request.to}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[request.status]}`}>{request.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">Approve</button>
                      <button type="button" className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
