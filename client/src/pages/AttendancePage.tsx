import DashboardLayout from '../layouts/DashboardLayout';

const records = [
  { id: 'EMP001', name: 'Anil Kumar', department: 'Engineering', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
  { id: 'EMP002', name: 'Priya Nair', department: 'Marketing', checkIn: '09:45 AM', checkOut: '06:00 PM', hours: '8h 15m', status: 'Late' },
  { id: 'EMP003', name: 'Rahul Mehta', department: 'Sales', checkIn: '-', checkOut: '-', hours: '-', status: 'Absent' },
  { id: 'EMP004', name: 'Sneha Rao', department: 'HR', checkIn: '08:55 AM', checkOut: '05:45 PM', hours: '8h 50m', status: 'Present' },
  { id: 'EMP005', name: 'Arjun Singh', department: 'Finance', checkIn: '-', checkOut: '-', hours: '-', status: 'Leave' },
];

const statusClass: Record<string, string> = {
  Present: 'bg-emerald-50 text-emerald-600',
  Late: 'bg-amber-50 text-amber-600',
  Absent: 'bg-red-50 text-red-600',
  Leave: 'bg-violet-50 text-violet-600',
};

const cards = [
  ['Present', 112, '#22C55E', 'PR'],
  ['Late', 6, '#F59E0B', 'LT'],
  ['Absent', 8, '#EF4444', 'AB'],
  ['On Leave', 18, '#8B5CF6', 'LV'],
];

export default function AttendancePage() {
  return (
    <DashboardLayout title="Attendance" userName="Anil Kumar" userRole="HR Manager">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Attendance</h1>
            <p className="text-sm text-slate-400">Track daily check-ins, absences, and shift completion.</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600" type="button">Export</button>
            <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white" type="button">Mark Attendance</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, color, icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
                <span className="text-xs font-bold text-slate-400">{Math.round((Number(value) / records.length) * 10)}%</span>
              </div>
              <p className="text-3xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className={index < records.length - 1 ? 'border-b border-slate-100 hover:bg-slate-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{record.name.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{record.name}</span>
                        <span className="block text-xs text-slate-400">{record.id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.department}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-950">{record.checkIn}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.checkOut}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.hours}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[record.status]}`}>{record.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
