import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { attendanceService, ApiAttendance } from '../services/hrmsApi';
import { useAuth } from '../hooks/useAuth';
import DataTable from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateHours(checkIn?: string, checkOut?: string): string {
  if (!checkIn || !checkOut) return '-';
  return '8h 00m'; // Placeholder — replace with real calculation when backend provides timestamps
}

// ─── Column definitions ───────────────────────────────────────────────────────

/**
 * We define columns outside the component so the reference is stable
 * and DataTable doesn't re-compute on every render.
 */
const COLUMNS: DataTableColumn<ApiAttendance>[] = [
  {
    key: 'employee',
    header: 'Employee',
    sortable: true,
    sortValue: (row) => row.employeeId?.name ?? '',
    render: (row) => {
      const name = row.employeeId?.name ?? (row as any).name ?? 'Unknown';
      const id   = row.employeeId?.employeeId ?? row.employeeId?._id ?? (row as any).id ?? '—';
      return (
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
          >
            {name.charAt(0)}
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">{name}</span>
            <span className="block text-xs text-slate-500">{id}</span>
          </span>
        </div>
      );
    },
  },
  {
    key: 'department',
    header: 'Department',
    sortable: true,
    sortValue: (row) => row.employeeId?.department ?? '',
    render: (row) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.employeeId?.department ?? (row as any).department ?? '—'}
      </span>
    ),
  },
  {
    key: 'checkIn',
    header: 'Check In',
    sortable: true,
    sortValue: (row) => row.checkIn ?? '',
    render: (row) => (
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-300">
        {row.checkIn ?? '-'}
      </span>
    ),
  },
  {
    key: 'checkOut',
    header: 'Check Out',
    render: (row) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.checkOut ?? '-'}
      </span>
    ),
  },
  {
    key: 'hours',
    header: 'Hours',
    render: (row) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {calculateHours(row.checkIn, row.checkOut)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    sortValue: (row) => row.status ?? '',
    render: (row) => <StatusBadge status={row.status ?? 'Present'} />,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { user } = useAuth();
  const displayName = user?.name || 'HR Manager';

  const [records, setRecords]   = useState<ApiAttendance[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAll();
      setRecords(res.records || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance');
      // Mock data fallback if API fails
      setRecords([
        {
          _id: '1',
          employeeId: { _id: '1', name: 'Anil Kumar', employeeId: 'EMP-001', department: 'Engineering' },
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          status: 'Present',
          date: new Date().toISOString(),
        } as ApiAttendance,
      ]);
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

  // ── KPI cards ──────────────────────────────────────────────────────────────
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount  = records.filter((r) => r.status === 'Absent').length;
  const lateCount    = records.filter((r) => r.status === 'Late').length;
  const leaveCount   = records.filter((r) => r.status === 'Leave').length;

  const kpiCards = [
    { label: 'Present',  value: presentCount, color: '#22C55E', abbr: 'PR' },
    { label: 'Absent',   value: absentCount,  color: '#EF4444', abbr: 'AB' },
    { label: 'Late',     value: lateCount,    color: '#F59E0B', abbr: 'LT' },
    { label: 'On Leave', value: leaveCount,   color: '#8B5CF6', abbr: 'LV' },
  ];

  const total = records.length;

  return (
    <DashboardLayout title="Attendance" userName={user?.name || 'Employee'} userRole={user?.role || 'Employee'}>
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Attendance
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Welcome,{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{displayName}</span>{' '}
              — track daily check-ins, absences, and shift completion.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCheckIn}
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300 dark:hover:bg-white/[0.06]"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              Check Out
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(({ label, value, color, abbr }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-white/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                  style={{ background: `${color}18`, color }}
                >
                  {abbr}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {total > 0 ? Math.round((value / total) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Attendance DataTable ── */}
        <DataTable<ApiAttendance>
          columns={COLUMNS}
          data={records}
          rowKey={(row, i) => row._id ?? i}
          loading={loading}
          searchable
          searchPlaceholder="Search by name or department…"
          getSearchText={(record) =>
            [
              record.employeeId?.name,
              record.employeeId?.department,
              record.employeeId?.employeeId,
              record.status,
            ]
              .filter(Boolean)
              .join(' ')
          }
          pageSize={10}
          minWidth={820}
          emptyState={
            <EmptyState
              icon={
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="No attendance records"
              description="No records found for the current filter. Try a different search or check back later."
            />
          }
        />

      </div>
    </DashboardLayout>
  );
}
