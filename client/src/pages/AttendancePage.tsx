import { useAuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// TODO: wire real attendance API
const records = [
  { id: 'EMP001', name: 'Anil Kumar',  department: 'Engineering', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
  { id: 'EMP002', name: 'Priya Nair',  department: 'Marketing',   checkIn: '09:45 AM', checkOut: '06:00 PM', hours: '8h 15m', status: 'Late'    },
  { id: 'EMP003', name: 'Rahul Mehta', department: 'Sales',       checkIn: '-',        checkOut: '-',        hours: '-',      status: 'Absent'  },
  { id: 'EMP004', name: 'Sneha Rao',   department: 'HR',          checkIn: '08:55 AM', checkOut: '05:45 PM', hours: '8h 50m', status: 'Present' },
  { id: 'EMP005', name: 'Arjun Singh', department: 'Finance',     checkIn: '-',        checkOut: '-',        hours: '-',      status: 'Leave'   },
];

// Status badge colors — dark-theme safe (text + subtle glass background)
const statusStyle: Record<string, { text: string; bg: string; dot: string }> = {
  Present: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20', dot: 'bg-emerald-400' },
  Late:    { text: 'text-amber-400',   bg: 'bg-amber-500/10  border border-amber-500/20',   dot: 'bg-amber-400'   },
  Absent:  { text: 'text-red-400',     bg: 'bg-red-500/10    border border-red-500/20',      dot: 'bg-red-400'     },
  Leave:   { text: 'text-violet-400',  bg: 'bg-violet-500/10 border border-violet-500/20',  dot: 'bg-violet-400'  },
};

// KPI summary cards
const kpiCards = [
  { label: 'Present',  value: 112, color: '#22C55E', abbr: 'PR' },
  { label: 'Late',     value: 6,   color: '#F59E0B', abbr: 'LT' },
  { label: 'Absent',   value: 8,   color: '#EF4444', abbr: 'AB' },
  { label: 'On Leave', value: 18,  color: '#8B5CF6', abbr: 'LV' },
];

export default function AttendancePage() {
  const { user } = useAuthContext();
  const displayName = user?.name ?? 'HR Manager';

  return (
    <DashboardLayout title="Attendance">
      {/* Ambient glows — identical to HRDashboard */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">Attendance</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Welcome, <span className="font-semibold text-slate-300">{displayName}</span> — track daily check-ins, absences, and shift completion.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              Export
            </button>
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
              }}
            >
              Mark Attendance
            </button>
          </div>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(({ label, value, color, abbr }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.07] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                  style={{ background: `${color}18`, color }}
                >
                  {abbr}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: `${color}18`, color }}
                >
                  {Math.round((value / records.length) * 10)}%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Attendance Table ── */}
        <div
          className="overflow-hidden rounded-2xl border border-white/[0.07]"
          style={{
            background: 'rgba(255,255,255,0.02)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'].map((col) => (
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
                {records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`transition-colors duration-150 hover:bg-white/[0.04] ${
                      index < records.length - 1 ? 'border-b border-white/[0.05]' : ''
                    }`}
                  >
                    {/* Employee name + ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                            boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                          }}
                        >
                          {record.name.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-white">{record.name}</span>
                          <span className="block text-xs text-slate-500">{record.id}</span>
                        </span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 text-sm text-slate-400">{record.department}</td>

                    {/* Check In */}
                    <td className="px-4 py-3 text-sm font-semibold text-slate-300">
                      {record.checkIn === '-' ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        record.checkIn
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {record.checkOut === '-' ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        record.checkOut
                      )}
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {record.hours === '-' ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        record.hours
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[record.status].bg} ${statusStyle[record.status].text}`}
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
