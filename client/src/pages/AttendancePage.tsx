import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { attendanceService, ApiAttendance } from '../services/hrmsApi';
import { useAuth } from '../hooks/useAuth';
import DataTable from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import EmployeeAttendanceWorkspace from '../components/employee/EmployeeAttendanceWorkspace';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateHours(checkIn?: string, checkOut?: string): string {
  if (!checkIn || !checkOut) return '-';
  try {
    const parseTime = (t: string) => {
      const [time, modifier] = t.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier && modifier.toUpperCase() === 'PM') {
        hours = parseInt(hours, 10) + 12 + '';
      }
      return new Date(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10), 0);
    };
    
    const start = parseTime(checkIn);
    const end = parseTime(checkOut);
    let diff = (end.getTime() - start.getTime()) / 1000 / 60; // in minutes
    if (diff < 0) diff += 24 * 60; // handle cross-midnight
    
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  } catch(e) {
    return '-';
  }
}

export default function AttendancePage() {
  const { user } = useAuth();
  const displayName = user?.name || 'HR Manager';
  const isHR = ['hr-manager', 'admin', 'hr'].includes(user?.role?.toLowerCase() || '');

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
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await attendanceService.updateStatus(id, newStatus);
      void fetchAttendance();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

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
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        if (row.status === 'Pending') {
          return (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleStatusUpdate(row._id, 'Present')}
                className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
              >
                Approve
              </button>
              <button 
                onClick={() => handleStatusUpdate(row._id, 'Rejected')}
                className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                Reject
              </button>
            </div>
          );
        }
        return null;
      }
    }
  ];

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  const [activeTab, setActiveTab] = useState<'company' | 'personal'>('company');

  if (!isHR) {
    return (
      <DashboardLayout title="My Attendance" userName={user?.name || 'Employee'} userRole={user?.role || 'Employee'}>
        <EmployeeAttendanceWorkspace
          records={records}
          loading={loading}
          error={error}
          onRefresh={fetchAttendance}
          user={user}
        />
      </DashboardLayout>
    );
  }

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
              <span className="font-semibold text-slate-700 dark:text-slate-300">{displayName}</span>
            </p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-white/5">
            <button
              onClick={() => setActiveTab('company')}
              className={`rounded-md px-4 py-2 text-sm font-bold transition-all ${activeTab === 'company' ? 'bg-white text-blue-600 shadow-sm dark:bg-[#0B1121] dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Company View
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`rounded-md px-4 py-2 text-sm font-bold transition-all ${activeTab === 'personal' ? 'bg-white text-blue-600 shadow-sm dark:bg-[#0B1121] dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              My Attendance
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'personal' ? (
          <EmployeeAttendanceWorkspace
            records={records}
            loading={loading}
            error={error}
            onRefresh={fetchAttendance}
            user={user}
          />
        ) : (
          <>

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
        {/* ── Attendance DataTable ── */}
        <div className="hidden md:block">
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

        {/* ── Mobile Cards ── */}
        <div className="flex flex-col gap-3 md:hidden">
          {records.map((record, i) => {
            const name = record.employeeId?.name ?? (record as any).name ?? 'Unknown';
            const dept = record.employeeId?.department ?? (record as any).department ?? '—';
            const st = record.status ?? 'Present';
            
            return (
              <div 
                key={record._id ?? i} 
                className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}
                    >
                      {name.charAt(0)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dept}</p>
                    </div>
                  </div>
                  <StatusBadge status={st} />
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <p className="text-slate-400">Check In</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{record.checkIn ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Check Out</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{record.checkOut ?? '-'}</p>
                  </div>
                  <div className="col-span-2 mt-1">
                    <p className="text-slate-400">Total Hours</p>
                    <p className="font-bold text-slate-900 dark:text-white">{calculateHours(record.checkIn, record.checkOut)}</p>
                  </div>
                  {st === 'Pending' && (
                    <div className="col-span-2 mt-3 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                      <button 
                        onClick={() => handleStatusUpdate(record._id, 'Present')}
                        className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(record._id, 'Rejected')}
                        className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {records.length === 0 && !loading && (
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
              <p className="text-sm font-semibold text-slate-500">No attendance records found.</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
