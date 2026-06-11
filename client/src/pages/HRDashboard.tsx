import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const cards = [
  ['Total Employees', '256', '+12 this month', '#2563EB', 'EM'],
  ['Attendance Rate', '94.2%', '+2.1%', '#22C55E', 'AT'],
  ['Payroll Status', '92%', 'June cycle', '#8B5CF6', 'PR'],
  ['Pending Approvals', '14', 'Needs review', '#F59E0B', 'PA'],
];
const areaData: Array<[string, number]> = [['Jan', 220], ['Feb', 228], ['Mar', 235], ['Apr', 242], ['May', 251], ['Jun', 256]];
const deptData: Array<[string, number]> = [['Engineering', 96], ['Marketing', 92], ['Sales', 89], ['HR', 98], ['Finance', 94]];
const pieData: Array<[string, number, string]> = [
  ['Engineering', 42, '#2563EB'],
  ['Marketing', 28, '#22C55E'],
  ['Sales', 31, '#F59E0B'],
  ['HR', 16, '#8B5CF6'],
  ['Finance', 21, '#EF4444'],
];
const activities = [
  ['Leave Approved', 'John Doe', 'Engineering', '5m ago'],
  ['Employee Added', 'Priya Nair', 'Marketing', '1h ago'],
  ['Payroll Processed', 'Finance Team', 'Finance', '3h ago'],
  ['Attendance Alert', 'Rahul Mehta', 'Sales', '4h ago'],
];
const pendingApprovals: Array<[string, string, number]> = [
  ['John Doe', 'Casual Leave', 2],
  ['Priya Nair', 'Sick Leave', 1],
  ['Rahul Mehta', 'Earned Leave', 3],
];

function Bars({ data, color = '#2563EB' }: { data: Array<[string, number]>; color?: string }) {
  const max = Math.max(...data.map(([, value]) => value));
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map(([label, value]) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl" style={{ height: `${(value / max) * 140}px`, background: color }} />
          <span className="text-xs font-bold text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HRDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="HR Dashboard" userName="Anil Kumar" userRole="HR Manager">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">HR Dashboard</h1>
            <p className="text-sm text-slate-400">Workforce, attendance, payroll, and approval overview.</p>
          </div>
          <button type="button" onClick={() => navigate('/employees')} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white">
            Add Employee
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, trend, color, icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-bold text-emerald-500">{trend}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Headcount Growth</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">6 months</span>
            </div>
            <Bars data={areaData} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Department Split</h2>
            <div className="space-y-2">
              {pieData.map(([name, value, color]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    <span className="font-semibold text-slate-600">{name}</span>
                  </div>
                  <span className="font-bold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-950">Department Attendance</h2>
            <div className="space-y-3">
              {deptData.map(([name, value]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-bold text-slate-500">{name}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} /></div>
                  <span className="w-8 text-right text-xs font-bold text-slate-950">{value}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Recent Activity</h2>
            <div className="space-y-3">
              {activities.map(([action, name, dept, time]) => (
                <div key={`${action}-${name}`} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{name.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-950">{action}</span>
                    <span className="block truncate text-xs text-slate-400">{name} - {dept}</span>
                  </span>
                  <span className="text-xs text-slate-400">{time}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Pending Approvals</h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">{pendingApprovals.length}</span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map(([name, type, days]) => (
                <div key={name as string} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{String(name).charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-slate-950">{name}</span>
                    <span className="text-xs text-slate-400">{type} - {days}d</span>
                  </span>
                  <button type="button" className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white">OK</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
