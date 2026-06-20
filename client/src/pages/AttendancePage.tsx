import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../layouts/DashboardLayout';

// TODO: wire real attendance API
const records = [
  { id: 'EMP001', name: 'Anil Kumar',  department: 'Engineering', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
  { id: 'EMP002', name: 'Priya Nair',  department: 'Marketing',   checkIn: '09:45 AM', checkOut: '06:00 PM', hours: '8h 15m', status: 'Late'    },
  { id: 'EMP003', name: 'Rahul Mehta', department: 'Sales',       checkIn: '-',        checkOut: '-',        hours: '-',      status: 'Absent'  },
  { id: 'EMP004', name: 'Sneha Rao',   department: 'HR',          checkIn: '08:55 AM', checkOut: '05:45 PM', hours: '8h 50m', status: 'Present' },
  { id: 'EMP005', name: 'Arjun Singh', department: 'Finance',     checkIn: '-',        checkOut: '-',        hours: '-',      status: 'Leave'   },
];

// Status badge colors — dual-theme safe
const statusStyle: Record<string, { light: string; dark: string; dot: string }> = {
  Present: { light: 'bg-emerald-50 text-emerald-600 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Late:    { light: 'bg-amber-50 text-amber-600 border border-amber-200',     dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',     dot: 'bg-amber-500 dark:bg-amber-400' },
  Absent:  { light: 'bg-red-50 text-red-600 border border-red-200',           dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',           dot: 'bg-red-500 dark:bg-red-400' },
  Leave:   { light: 'bg-violet-50 text-violet-600 border border-violet-200',  dark: 'dark:bg-violet-500/20 dark:border-violet-500/30 dark:text-violet-400',  dot: 'bg-violet-500 dark:bg-violet-400' },
};

// KPI summary cards
const kpiCards = [
  { label: 'Present',  value: 112, abbr: 'PR', classes: 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20' },
  { label: 'Late',     value: 6,   abbr: 'LT', classes: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/20' },
  { label: 'Absent',   value: 8,   abbr: 'AB', classes: 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-500/20' },
  { label: 'On Leave', value: 18,  abbr: 'LV', classes: 'text-violet-500 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/20' },
];

export default function AttendancePage() {
  const { user } = useAuthContext();
  const toast = useToast();
  const displayName = user?.name ?? 'HR Manager';

  // Calculate total employees from the mocked kpiCards instead of records.length
  const totalEmployees = kpiCards.reduce((sum, card) => sum + card.value, 0);

  return (
    <DashboardLayout title="Attendance">
      {/* Ambient glows — only visible in dark mode */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{displayName}</span> — track daily check-ins, absences, and shift completion.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => toast.info('Export is coming soon.')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121] dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/[0.04] dark:hover:text-white"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => toast.info('Mark Attendance is coming soon.')}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              Mark Attendance
            </button>
          </div>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(({ label, value, classes, abbr }) => (
            <div
              key={label}
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
                  {totalEmployees > 0 ? Math.round((value / totalEmployees) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Data Table ── */}
        <div
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]">
                  {['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'].map((col) => (
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
                {records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-white/[0.03] ${
                      index < records.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                          }}
                        >
                          {record.name.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">{record.name}</span>
                          <span className="block text-xs text-slate-500">{record.id}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.department}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-300">{record.checkIn}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.checkOut}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.hours}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[record.status].light} ${statusStyle[record.status].dark}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle[record.status].dot}`} />
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
