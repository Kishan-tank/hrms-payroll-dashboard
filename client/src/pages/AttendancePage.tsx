import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { attendanceService, ApiAttendance } from '../services/hrmsApi';
import { useAuth } from '../hooks/useAuth';

// Status badge colors — dual-theme safe
const statusStyle: Record<string, { light: string; dark: string; dot: string }> = {
  Present: { light: 'bg-emerald-50 text-emerald-600 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Late:    { light: 'bg-amber-50 text-amber-600 border border-amber-200',     dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',     dot: 'bg-amber-500 dark:bg-amber-400' },
  Absent:  { light: 'bg-red-50 text-red-600 border border-red-200',           dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',           dot: 'bg-red-500 dark:bg-red-400' },
  Leave:   { light: 'bg-violet-50 text-violet-600 border border-violet-200',  dark: 'dark:bg-violet-500/20 dark:border-violet-500/30 dark:text-violet-400',  dot: 'bg-violet-500 dark:bg-violet-400' },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ApiAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAll();
      setRecords(res.records);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      void fetchAttendance();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      void fetchAttendance();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculateHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return '-';
    // Simplified logic, assume formats like '09:00 AM'
    return '8h 00m'; // Dummy computation for now or just return text
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  const cards = [
    ['Present', presentCount, '#22C55E', 'PR'],
    ['Absent', absentCount, '#EF4444', 'AB'],
    ['Late', 0, '#F59E0B', 'LT'], // Not implemented dynamically
    ['On Leave', 0, '#8B5CF6', 'LV'], // Not implemented dynamically
  ];

  return (
    <DashboardLayout title="Attendance" userName={user?.name || "Employee"} userRole={user?.role || "Employee"}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Welcome, <span className="font-semibold text-slate-700 dark:text-slate-300">{displayName}</span> — track daily check-ins, absences, and shift completion.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCheckIn} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600" type="button">Check In</button>
            <button onClick={handleCheckOut} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white" type="button">Check Out</button>
          </div>
        </div>

        {error && <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(({ label, value, classes, abbr }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-white/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
                <span className="text-xs font-bold text-slate-400">{records.length ? Math.round((Number(value) / records.length) * 100) : 0}%</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
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
              {loading ? (
                 <tr><td colSpan={6} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : records.length === 0 ? (
                 <tr><td colSpan={6} className="p-4 text-center text-slate-500">No records found.</td></tr>
              ) : records.map((record, index) => (
                <tr key={record._id} className={index < records.length - 1 ? 'border-b border-slate-100 hover:bg-slate-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{record.employeeId?.name?.charAt(0) || '?'}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{record.employeeId?.name || 'Unknown'}</span>
                        <span className="block text-xs text-slate-400">{record.employeeId?.employeeId || record.employeeId?._id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.employeeId?.department || '-'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-950">{record.checkIn || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.checkOut || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{calculateHours(record.checkIn, record.checkOut)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[record.status] || 'bg-slate-50 text-slate-600'}`}>{record.status}</span></td>
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
