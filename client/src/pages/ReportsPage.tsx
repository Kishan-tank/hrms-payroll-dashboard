import DashboardLayout from '../layouts/DashboardLayout';

const headcountData: Array<[string, number]> = [
  ['Jan', 220], ['Feb', 228], ['Mar', 235], ['Apr', 242], ['May', 251], ['Jun', 256],
];
const payrollTrend: Array<[string, number]> = [
  ['Jan', 42], ['Feb', 43], ['Mar', 45], ['Apr', 46], ['May', 48], ['Jun', 49],
];
const leaveByType: Array<[string, number, string]> = [
  ['Casual', 38, '#2563EB'],
  ['Sick', 24, '#22C55E'],
  ['Earned', 20, '#F59E0B'],
  ['WFH', 18, '#8B5CF6'],
];
const deptAttn: Array<[string, number]> = [
  ['Engineering', 96],
  ['Marketing', 92],
  ['Sales', 89],
  ['HR', 98],
  ['Finance', 94],
];

function BarChart({ data, color = '#2563EB' }: { data: Array<[string, number]>; color?: string }) {
  const max = Math.max(...data.map(([, value]) => value));
  return (
    <div className="flex h-48 items-end gap-3">
      {data.map(([label, value]) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl" style={{ height: `${(value / max) * 150}px`, background: color }} />
          <span className="text-xs font-semibold text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports" userName="Anil Kumar" userRole="HR Manager">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Reports</h1>
            <p className="text-sm text-slate-400">Analytics, trends, and export-ready HR insights.</p>
          </div>
          <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white" type="button">Export Report</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Headcount', '256', '+12 this month', '#2563EB'],
            ['Attendance', '94.2%', '+2.1%', '#22C55E'],
            ['Payroll', 'Rs. 48.2L', '+8.4%', '#8B5CF6'],
            ['Leave Usage', '62%', '-4.3%', '#F59E0B'],
          ].map(([label, value, trend, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{String(label).slice(0, 2).toUpperCase()}</span>
              <p className="mt-4 text-2xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-bold text-emerald-500">{trend}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Headcount Growth</h2>
            <BarChart data={headcountData} />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Payroll Trend</h2>
            <BarChart data={payrollTrend} color="#8B5CF6" />
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-950">Leave By Type</h2>
            <div className="space-y-3">
              {leaveByType.map(([name, value, color]) => (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">{name}</span>
                    <span className="text-slate-400">{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${value}%`, background: color }} /></div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-950">Department Attendance</h2>
            <div className="space-y-3">
              {deptAttn.map(([name, value]) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-semibold text-slate-600">{name}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} /></div>
                  <span className="w-10 text-right text-sm font-bold text-slate-950">{value}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
