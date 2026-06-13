import { useState } from 'react';

/* ── Types ──────────────────────────────────────────────── */
type TabId = 'payroll' | 'employees' | 'hrdashboard';

/* ── Data ───────────────────────────────────────────────── */
const payrollRows = [
  { name: 'Anil Kumar',     dept: 'Engineering',  ctc: '₹18,00,000', net: '₹1,24,500', status: 'Paid'    },
  { name: 'Priya Sharma',   dept: 'Product',       ctc: '₹15,60,000', net: '₹1,08,200', status: 'Paid'    },
  { name: 'Rahul Mehta',    dept: 'Design',        ctc: '₹12,00,000', net: '₹84,600',   status: 'Paid'    },
  { name: 'Sneha Iyer',     dept: 'HR',            ctc: '₹9,60,000',  net: '₹68,400',   status: 'Pending' },
  { name: 'Karan Verma',    dept: 'Sales',         ctc: '₹10,80,000', net: '₹76,100',   status: 'Pending' },
  { name: 'Deepika Nair',   dept: 'Finance',       ctc: '₹14,40,000', net: '₹1,01,300', status: 'Paid'    },
];

const employeeRows = [
  { name: 'Anil Kumar',   initials: 'AK', color: '#2563eb', role: 'Sr. Engineer',     dept: 'Engineering', location: 'Bangalore', joined: 'Jan 2022', status: 'Active'   },
  { name: 'Priya Sharma', initials: 'PS', color: '#7c3aed', role: 'Product Manager',  dept: 'Product',     location: 'Mumbai',    joined: 'Mar 2021', status: 'Active'   },
  { name: 'Rahul Mehta',  initials: 'RM', color: '#0891b2', role: 'UX Designer',      dept: 'Design',      location: 'Pune',      joined: 'Jul 2023', status: 'On Leave' },
  { name: 'Sneha Iyer',   initials: 'SI', color: '#059669', role: 'HR Manager',       dept: 'HR',          location: 'Chennai',   joined: 'Nov 2020', status: 'Active'   },
  { name: 'Karan Verma',  initials: 'KV', color: '#d97706', role: 'Sales Executive',  dept: 'Sales',       location: 'Delhi',     joined: 'Apr 2024', status: 'Active'   },
  { name: 'Deepika Nair', initials: 'DN', color: '#dc2626', role: 'Finance Analyst',  dept: 'Finance',     location: 'Hyderabad', joined: 'Sep 2022', status: 'Active'   },
];

/* HR Dashboard data */
const headcountBars = [1180, 1192, 1205, 1218, 1224, 1235, 1248];
const headcountMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Jun'];

const deptDistribution = [
  { name: 'Engineering', count: 412, pct: 33, color: '#2563eb' },
  { name: 'Sales & Mktg', count: 287, pct: 23, color: '#7c3aed' },
  { name: 'HR & Admin',   count: 156, pct: 13, color: '#0891b2' },
  { name: 'Finance',      count: 124, pct: 10, color: '#059669' },
  { name: 'Design',       count: 98,  pct: 8,  color: '#d97706' },
  { name: 'Others',       count: 171, pct: 14, color: '#6b7280' },
];

const pendingApprovals = [
  { type: 'Leave Request',   name: 'Rahul Mehta',   dept: 'Design',   urgency: 'high'   },
  { type: 'Expense Claim',   name: 'Karan Verma',   dept: 'Sales',    urgency: 'medium' },
  { type: 'WFH Request',     name: 'Sneha Iyer',    dept: 'HR',       urgency: 'low'    },
  { type: 'Overtime Approval', name: 'Deepika Nair', dept: 'Finance', urgency: 'medium' },
];

const recentActivities = [
  { text: 'Payroll run completed for June 2026', time: '10 min ago', dot: '#22c55e' },
  { text: 'Rahul Mehta leave approved',          time: '1h ago',     dot: '#60a5fa' },
  { text: 'New hire: Arjun Singh (Engineering)', time: '2h ago',     dot: '#a78bfa' },
  { text: 'Compliance report generated',         time: '5h ago',     dot: '#fbbf24' },
  { text: 'Q2 appraisal cycle initiated',        time: 'Yesterday',  dot: '#f87171' },
];

/* ── Shared sub-components ──────────────────────────────── */
function MetricCard({
  label, value, sub, iconBg, iconColor, icon,
}: {
  label: string; value: string; sub?: string;
  iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </span>
      <div>
        <p className="text-lg font-extrabold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] font-semibold text-emerald-400">{sub}</p>}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const isPaid = status === 'Paid' || status === 'Active';
  const isLeave = status === 'On Leave';
  if (isPaid) return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-400" style={{ background: 'rgba(34,197,94,0.12)' }}>
      ● {status}
    </span>
  );
  if (isLeave) return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-amber-400" style={{ background: 'rgba(245,158,11,0.12)' }}>
      ● {status}
    </span>
  );
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-amber-400" style={{ background: 'rgba(245,158,11,0.12)' }}>
      ● {status}
    </span>
  );
}

/* ── Browser chrome wrapper ─────────────────────────────── */
function BrowserShell({ urlLabel, children }: { urlLabel: string; children: React.ReactNode }) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
      style={{
        background: 'rgba(9,14,30,0.96)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* chrome bar */}
      <div
        className="flex items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-amber-500/60" />
          <div className="h-3 w-3 rounded-full bg-green-500/60" />
        </div>
        <div
          className="mx-auto flex-1 max-w-sm rounded-lg px-3 py-1 text-center font-mono text-xs text-slate-500"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {urlLabel}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1" style={{ background: 'rgba(34,197,94,0.12)' }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400">Live</span>
        </div>
      </div>

      {/* content area */}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/* ── TAB 1: PAYROLL ─────────────────────────────────────── */
function PayrollTab() {
  const metrics = [
    {
      label: 'Total Payroll', value: '₹16.8L', sub: '+12.4% vs last month',
      iconBg: 'rgba(37,99,235,0.15)', iconColor: '#60a5fa',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>,
    },
    {
      label: 'Processed', value: '4 / 6', sub: '66% complete',
      iconBg: 'rgba(34,197,94,0.15)', iconColor: '#4ade80',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>,
    },
    {
      label: 'Pending Review', value: '2',
      iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>,
    },
  ];

  return (
    <BrowserShell urlLabel="app.hrmspro.com/payroll — June 2026">
      <div className="space-y-5">
        {/* Section label */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Payroll Processing</h3>
            <p className="text-xs text-slate-500">June 2026 · Run started 09:00 AM</p>
          </div>
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
          >
            Run Payroll
          </button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
            <span>Processing progress</span>
            <span className="font-semibold text-white">66%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-2 rounded-full transition-all duration-700" style={{ width: '66%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Employee', 'Department', 'CTC', 'Net Pay', 'Status'].map((h) => (
                  <th key={h} className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrollRows.map((r, i) => (
                <tr
                  key={r.name}
                  className="group transition-colors duration-150"
                  style={{
                    borderBottom: i < payrollRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-3 pr-4 text-sm font-semibold text-white">{r.name}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{r.dept}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-300">{r.ctc}</td>
                  <td className="py-3 pr-4 font-mono text-sm font-bold text-white">{r.net}</td>
                  <td className="py-3"><StatusChip status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BrowserShell>
  );
}

/* ── TAB 2: EMPLOYEES ───────────────────────────────────── */
function EmployeesTab() {
  const metrics = [
    {
      label: 'Total Employees', value: '1,248',
      iconBg: 'rgba(37,99,235,0.15)', iconColor: '#60a5fa',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      label: 'Active', value: '1,192', sub: '95.5%',
      iconBg: 'rgba(34,197,94,0.15)', iconColor: '#4ade80',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" /></svg>,
    },
    {
      label: 'On Leave', value: '43',
      iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    },
    {
      label: 'New This Month', value: '+24', sub: '↑ vs last month',
      iconBg: 'rgba(124,58,237,0.15)', iconColor: '#a78bfa',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6" /></svg>,
    },
  ];

  return (
    <BrowserShell urlLabel="app.hrmspro.com/employees">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Employee Directory</h3>
            <p className="text-xs text-slate-500">All departments · Synced just now</p>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs text-slate-400">Search employees…</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Role', 'Department', 'Location', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((r, i) => (
                <tr
                  key={r.name}
                  style={{ borderBottom: i < employeeRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  className="transition-colors duration-150"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: r.color }}
                      >
                        {r.initials}
                      </span>
                      <span className="text-sm font-semibold text-white whitespace-nowrap">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400 whitespace-nowrap">{r.role}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{r.dept}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{r.location}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{r.joined}</td>
                  <td className="py-3"><StatusChip status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BrowserShell>
  );
}

/* ── TAB 3: HR DASHBOARD ────────────────────────────────── */
function HRDashboardTab() {
  const kpis = [
    {
      label: 'Total Employees', value: '1,248',
      iconBg: 'rgba(37,99,235,0.15)', iconColor: '#60a5fa',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      label: 'Present Today', value: '1,142', sub: '91.5%',
      iconBg: 'rgba(34,197,94,0.15)', iconColor: '#4ade80',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>,
    },
    {
      label: 'Pending Leaves', value: '23',
      iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    },
    {
      label: 'Open Positions', value: '14',
      iconBg: 'rgba(124,58,237,0.15)', iconColor: '#a78bfa',
      icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6" /></svg>,
    },
  ];

  const maxHeadcount = Math.max(...headcountBars);

  return (
    <BrowserShell urlLabel="app.hrmspro.com/hr-dashboard — June 2026">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">HR Manager Overview</h3>
            <p className="text-xs text-slate-500">June 2026 · All departments</p>
          </div>
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          >
            Generate Report
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => <MetricCard key={k.label} {...k} />)}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Monthly Headcount Trend */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Monthly Headcount Trend</span>
              <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>+68 YTD</span>
            </div>
            <div className="flex items-end gap-2 h-20">
              {headcountBars.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${(v / maxHeadcount) * 68}px`,
                      background: i === headcountBars.length - 1
                        ? 'linear-gradient(180deg,#60a5fa,#2563eb)'
                        : 'rgba(37,99,235,0.35)',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {headcountMonths.map((m, i) => (
                <span key={i} className="flex-1 text-center text-[9px] text-slate-600">{m}</span>
              ))}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Department Distribution</span>
              <span className="text-xs text-slate-500">1,248 total</span>
            </div>
            <div className="space-y-2">
              {deptDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-[10px] text-slate-400 truncate">{d.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] font-bold text-white">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Approvals + Leave + Attendance Rate + Activity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Pending Approvals */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Pending Approvals</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-amber-400" style={{ background: 'rgba(245,158,11,0.12)' }}>
                {pendingApprovals.length} pending
              </span>
            </div>
            <div className="space-y-2">
              {pendingApprovals.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{a.type}</p>
                    <p className="text-[10px] text-slate-500">{a.name} · {a.dept}</p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                    style={{
                      background: a.urgency === 'high' ? 'rgba(239,68,68,0.12)' : a.urgency === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                      color: a.urgency === 'high' ? '#f87171' : a.urgency === 'medium' ? '#fbbf24' : '#4ade80',
                    }}
                  >
                    {a.urgency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Attendance Rate widget + Recent Activities */}
          <div className="flex flex-col gap-4">

            {/* Attendance Rate */}
            <div
              className="flex items-center gap-4 rounded-xl p-4"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(37,99,235,0.08) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              {/* Circular gauge */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${91.4 * 0.942} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs font-extrabold text-white">91.4%</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Attendance Rate</p>
                <p className="text-xs text-slate-400">Today across all branches</p>
                <p className="mt-1 text-[10px] font-semibold text-emerald-400">↑ +2.1% vs last week</p>
              </div>
            </div>

            {/* Recent HR Activities */}
            <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="mb-2.5 text-xs font-semibold text-slate-300">Recent HR Activities</p>
              <div className="space-y-2">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: a.dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] text-slate-300">{a.text}</p>
                      <p className="text-[10px] text-slate-600">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserShell>
  );
}

/* ── Tab definitions ────────────────────────────────────── */
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'payroll',
    label: 'Payroll',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'hrdashboard',
    label: 'HR Dashboard',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  payroll: <PayrollTab />,
  employees: <EmployeesTab />,
  hrdashboard: <HRDashboardTab />,
};

/* ── Main Export ────────────────────────────────────────── */
export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>('payroll');

  return (
    <section
      id="product"
      className="relative overflow-hidden py-24"
      style={{ background: '#020617' }}
    >
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blue glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">

        {/* ── Section header ── */}
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Product Preview
          </div>

          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.6rem]">
            Everything your HR team needs,
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 60%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in one unified platform
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            From automated payroll to real-time attendance, HRMSPro gives your team enterprise-grade tools with consumer-grade simplicity.
          </p>
        </div>

        {/* ── Tab buttons ── */}
        <div className="mb-8 flex items-center justify-center">
          <div
            className="inline-flex rounded-2xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          boxShadow: '0 0 20px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3)',
                        }
                      : {
                          color: '#94a3b8',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
                      style={{ background: 'rgba(96,165,250,0.6)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab content with fade transition ── */}
        <div
          key={activeTab}
          className="animate-fade-in-up"
          style={{ animationDuration: '0.35s' }}
        >
          {TAB_CONTENT[activeTab]}
        </div>

        {/* ── Bottom feature row ── */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: '⚡', title: 'Real-time sync', desc: 'Data updates instantly across all modules' },
            { icon: '🔒', title: 'SOC 2 Certified', desc: 'Enterprise-grade security and compliance' },
            { icon: '🌐', title: 'Multi-branch ready', desc: 'Manage unlimited offices from one dashboard' },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-white/3"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-xl">{f.icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
