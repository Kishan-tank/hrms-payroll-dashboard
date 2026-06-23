import { useMemo, useState } from 'react';
import type { ApiAttendance } from '../../services/hrmsApi';
import { attendanceService } from '../../services/hrmsApi';
import DataTable from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { Clock, AlertCircle, ArrowRight, CalendarDays, LogIn, LogOut, FileText } from 'lucide-react';

interface EmployeeAttendanceWorkspaceProps {
  records: ApiAttendance[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  user: any; 
}

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

const MY_COLUMNS: DataTableColumn<ApiAttendance>[] = [
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    sortValue: (row) => row.date ?? '',
    render: (row) => {
      if (!row.date) return '-';
      const d = new Date(row.date);
      return <span className="font-medium text-slate-700 dark:text-slate-300">{d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
    }
  },
  {
    key: 'checkIn',
    header: 'Check In',
    render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-slate-300">{row.checkIn ?? '-'}</span>,
  },
  {
    key: 'checkOut',
    header: 'Check Out',
    render: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.checkOut ?? '-'}</span>,
  },
  {
    key: 'hours',
    header: 'Hours',
    sortable: true,
    sortValue: (row) => calculateHours(row.checkIn, row.checkOut),
    render: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{calculateHours(row.checkIn, row.checkOut)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    sortValue: (row) => row.status ?? '',
    render: (row) => <StatusBadge status={row.status ?? 'Present'} />,
  },
];

export default function EmployeeAttendanceWorkspace({
  records,
  loading,
  error,
  onRefresh,
  user
}: EmployeeAttendanceWorkspaceProps) {
  const toast = useToast();

  const currentUserIds = [
    user?.employeeId,
    user?.id,
    user?._id,
  ].filter(Boolean).map(String);

  const currentUserEmails = [user?.email].filter(Boolean).map(e => String(e).toLowerCase());

  const myRecords = useMemo(() => {
    return records.filter((r) => {
      const recordIds = [
        r.employeeId?._id,
        r.employeeId?.employeeId,
        r.employeeId?.userId,
      ].filter(Boolean).map(String);
      
      const recordEmails = [
        r.employeeId?.email,
        (r as any).email
      ].filter(Boolean).map(e => String(e).toLowerCase());

      return recordIds.some((id) => currentUserIds.includes(id)) || 
             recordEmails.some((email) => currentUserEmails.includes(email));
    });
  }, [records, currentUserIds, currentUserEmails]);

  const todayRecord = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return myRecords.find(r => r.date && r.date.startsWith(todayStr)) || null;
  }, [myRecords]);

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      toast.success("Checked in successfully");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to check in");
      if (err.message?.toLowerCase().includes("already")) {
        onRefresh();
      }
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      toast.success("Checked out successfully");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to check out");
      if (err.message?.toLowerCase().includes("already")) {
        onRefresh();
      }
    }
  };

  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ date: '', reason: '', checkIn: '', checkOut: '' });
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleRegularizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRegSubmitting(true);
      await attendanceService.regularize(regForm);
      toast.success("Regularization request submitted");
      setShowRegModal(false);
      setRegForm({ date: '', reason: '', checkIn: '', checkOut: '' });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleReport = async () => {
    try {
      toast.info("Generating report...");
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      // Since it's a mock report, reportsService is generated from backend or might be imported
      // We need to import reportsService here. Let's assume it's imported at the top or we can import dynamically.
      const { reportsService } = await import('../../services/hrmsApi');
      const res = await reportsService.generateMonthlyReport(month, year);
      
      if (res.downloadUrl) {
        const fullUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '') + res.downloadUrl
          : 'http://localhost:5000' + res.downloadUrl;
        window.open(fullUrl, '_blank');
        toast.success("Report downloaded");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    }
  };

  if (currentUserIds.length === 0) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
        <h3 className="text-lg font-bold">Identity Error</h3>
        <p>Could not verify your employee identity. Please re-login or contact IT.</p>
      </div>
    );
  }

  const presentCount = myRecords.filter((r) => r.status === 'Present').length;
  const lateCount    = myRecords.filter((r) => r.status === 'Late').length;
  const absentCount  = myRecords.filter((r) => r.status === 'Absent').length;
  const leaveCount   = myRecords.filter((r) => r.status === 'Leave').length;
  const totalDays    = myRecords.length || 1;
  const attendanceRate = Math.round(((presentCount + lateCount) / totalDays) * 100);

  const last7Days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const rec = myRecords.find(r => r.date && r.date.startsWith(dateStr));
      arr.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        status: rec?.status || 'Unknown'
      });
    }
    return arr;
  }, [myRecords]);

  const calendarDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = new Date(year, month, i).toISOString().split('T')[0];
      const rec = myRecords.find(r => r.date && r.date.startsWith(dStr));
      days.push({ day: i, status: rec?.status });
    }
    return days;
  }, [myRecords]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500';
      case 'Late': return 'bg-amber-500';
      case 'Absent': return 'bg-red-500';
      case 'Leave': return 'bg-violet-500';
      default: return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Attendance Workspace
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Self-service dashboard for your attendance tracking.
          </p>
        </div>
      </div>

      {error && myRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-500/10 dark:text-red-400 gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button 
            onClick={onRefresh}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200 transition dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {error && myRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-red-500/20 bg-white p-12 text-center shadow-xl dark:border-red-400/10 dark:bg-[#0B1121]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Unable to Load Dashboard</h2>
          <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>
          <button 
            onClick={onRefresh}
            className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* Grid Top: Hero & Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today Status Hero Card */}
            <div className="relative overflow-hidden rounded-[24px] border border-blue-500/30 bg-white p-6 shadow-xl dark:border-blue-400/20 dark:bg-[#0B1121] lg:col-span-2">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Status</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${todayRecord?.checkIn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} ${todayRecord?.checkIn && !todayRecord?.checkOut ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {todayRecord?.checkIn && !todayRecord?.checkOut ? 'Currently Checked In' : todayRecord?.checkIn ? 'Shift Completed' : 'Not Checked In'}
                      </span>
                    </div>
                  </div>
                  {todayRecord?.status && (
                    <StatusBadge status={todayRecord.status} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check In</p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{todayRecord?.checkIn || '--:--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Check Out</p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{todayRecord?.checkOut || '--:--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hours</p>
                    <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{calculateHours(todayRecord?.checkIn, todayRecord?.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shift</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white mt-2">09:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 h-full">
                <button 
                  onClick={handleCheckIn} 
                  disabled={!!todayRecord?.checkIn}
                  className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl p-4 text-white shadow-lg transition ${!!todayRecord?.checkIn ? 'bg-slate-300 opacity-50 cursor-not-allowed dark:bg-slate-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:scale-[1.02] hover:shadow-emerald-500/25'}`}
                >
                  <LogIn className="h-6 w-6" />
                  <span className="font-bold text-sm">Check In</span>
                </button>
                <button 
                  onClick={handleCheckOut} 
                  disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                  className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl p-4 text-white shadow-lg transition ${!todayRecord?.checkIn || !!todayRecord?.checkOut ? 'bg-slate-300 opacity-50 cursor-not-allowed dark:bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:scale-[1.02] hover:shadow-blue-500/25'}`}
                >
                  <LogOut className="h-6 w-6" />
                  <span className="font-bold text-sm">Check Out</span>
                </button>
              </div>
              <button onClick={() => setShowRegModal(true)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="font-bold text-sm">Missed Punch?</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </button>
              <button onClick={handleReport} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span className="font-bold text-sm">Monthly Report</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Regularization Modal */}
          {showRegModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl dark:bg-[#0B1121] dark:border dark:border-white/10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Regularize Attendance</h3>
                <form onSubmit={handleRegularizeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                    <input required type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" value={regForm.date} onChange={e => setRegForm({...regForm, date: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Check In</label>
                      <input type="time" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" value={regForm.checkIn} onChange={e => setRegForm({...regForm, checkIn: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Check Out</label>
                      <input type="time" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" value={regForm.checkOut} onChange={e => setRegForm({...regForm, checkOut: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason *</label>
                    <textarea required className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" rows={2} value={regForm.reason} onChange={e => setRegForm({...regForm, reason: e.target.value})} placeholder="Why missed punch?"></textarea>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 rounded-xl bg-slate-100 p-3 font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">Cancel</button>
                    <button type="submit" disabled={regSubmitting} className="flex-1 rounded-xl bg-blue-600 p-3 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50">{regSubmitting ? 'Submitting...' : 'Submit Request'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Grid Middle: KPI & Trend */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: 'Present', val: presentCount, c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'Late', val: lateCount, c: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                { label: 'Absent', val: absentCount, c: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
                { label: 'Leave', val: leaveCount, c: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
                { label: 'Avg. Hours', val: '7.8h', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: 'Attendance', val: `${attendanceRate}%`, c: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-white/10' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{item.label}</p>
                  <div className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 ${item.bg}`}>
                    <span className={`text-xl font-extrabold ${item.c}`}>{item.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Weekly Trend</h3>
              <div className="flex items-end justify-between h-20">
                {last7Days.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-8 hidden rounded bg-slate-800 px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap">
                      {day.status}
                    </div>
                    <div className={`w-3 rounded-full ${getStatusColor(day.status)}`} style={{ height: day.status === 'Present' ? '100%' : day.status === 'Late' ? '70%' : '30%' }} />
                    <span className="text-[10px] font-medium text-slate-500">{day.dayName.charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Grid Bottom: Calendar & History */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Monthly Calendar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121] lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Monthly Calendar</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['S','M','T','W','T','F','S'].map((d,i) => (
              <div key={i} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
            ))}
            {Array.from({length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()}).map((_,i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map((d, i) => (
              <div key={i} title={`${d.day}: ${d.status || 'No Record'}`} className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium cursor-help transition hover:opacity-80 ${d.status ? getStatusColor(d.status) + ' text-white shadow-sm' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500'}`}>
                {d.day}
              </div>
            ))}
          </div>
        </div>

        {/* My History Table */}
        <div className="lg:col-span-3">
          <div className="hidden md:block">
            <DataTable<ApiAttendance>
              columns={MY_COLUMNS}
              data={myRecords}
              rowKey={(row, i) => row._id ?? i}
              loading={loading}
              searchable
              searchPlaceholder="Search history..."
              getSearchText={(record) => [record.status, record.date].filter(Boolean).join(' ')}
              pageSize={5}
              minWidth={600}
              emptyState={
                <EmptyState
                  icon={<CalendarDays className="h-8 w-8" />}
                  title="No attendance records"
                  description="Your attendance history will appear here once you start checking in."
                />
              }
            />
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {myRecords.map((record, i) => (
              <div 
                key={record._id ?? i} 
                className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {record.date ? new Date(record.date).toLocaleDateString() : '—'}
                    </h3>
                  </div>
                  <StatusBadge status={record.status ?? 'Present'} />
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
                    <p className="text-slate-400">Hours</p>
                    <p className="font-bold text-slate-900 dark:text-white">{calculateHours(record.checkIn, record.checkOut)}</p>
                  </div>
                </div>
              </div>
            ))}
            {myRecords.length === 0 && !loading && (
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                <p className="text-sm font-semibold text-slate-500">Your attendance history will appear here once you start checking in.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
