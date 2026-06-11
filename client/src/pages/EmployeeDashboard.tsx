import DashboardLayout from '../layouts/DashboardLayout';

const cards = [
  ['Attendance', '94%', 'This month', '#22C55E', 'AT'],
  ['Leave Balance', '18', 'Days remaining', '#2563EB', 'LV'],
  ['Payslips', '6', 'Available', '#8B5CF6', 'PS'],
  ['Tasks', '4', 'Pending actions', '#F59E0B', 'TK'],
];

const attendanceData: Array<[string, number]> = [
  ['Mon', 96], ['Tue', 92], ['Wed', 98], ['Thu', 94], ['Fri', 91], ['Sat', 88],
];
const monthlyData: Array<[string, number]> = [
  ['Jan', 42], ['Feb', 44], ['Mar', 45], ['Apr', 47], ['May', 48], ['Jun', 49],
];
const activities = [
  ['Leave request approved', '2h ago'],
  ['June payslip generated', '1d ago'],
  ['Profile details updated', '2d ago'],
  ['Attendance correction submitted', '3d ago'],
];
const holidays = [
  ['Eid Holiday', '2026-06-17'],
  ['Independence Day', '2026-08-15'],
  ['Ganesh Chaturthi', '2026-09-14'],
];
const quickActions = [
  ['Apply Leave', '#2563EB'],
  ['Download Payslip', '#8B5CF6'],
  ['Mark Attendance', '#22C55E'],
  ['View Profile', '#F59E0B'],
];

function MiniBars({ data, color }: { data: Array<[string, number]>; color: string }) {
  const max = Math.max(...data.map(([, value]) => value));
  return (
    <div className="flex h-40 items-end gap-3">
      {data.map(([label, value]) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl" style={{ height: `${(value / max) * 120}px`, background: color }} />
          <span className="text-xs font-bold text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard" userName="Krishna Reddy" userRole="Employee">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-950">Welcome back, Krishna</h1>
          <p className="text-sm text-slate-400">Here is your attendance, leave, payroll, and activity snapshot.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, sub, color, icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{sub}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Weekly Attendance</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">94%</span>
            </div>
            <MiniBars data={attendanceData} color="#22C55E" />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Salary Trend</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">June</span>
            </div>
            <MiniBars data={monthlyData} color="#2563EB" />
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Recent Activity</h2>
            <div className="space-y-3">
              {activities.map(([text, time]) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  <span>
                    <span className="block text-xs font-bold text-slate-950">{text}</span>
                    <span className="text-xs text-slate-400">{time}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Upcoming Holidays</h2>
            <div className="space-y-3">
              {holidays.map(([name, date]) => (
                <div key={name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xs font-bold text-amber-600">HD</span>
                  <span>
                    <span className="block text-sm font-bold text-slate-950">{name}</span>
                    <span className="text-xs text-slate-400">{date}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(([label, color]) => (
                <button key={label} type="button" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs font-bold text-slate-700 hover:bg-white">
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-bold" style={{ background: `${color}18`, color: String(color) }}>{label.slice(0, 2).toUpperCase()}</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-600">
              Tip: keep attendance updated before payroll lock.
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
