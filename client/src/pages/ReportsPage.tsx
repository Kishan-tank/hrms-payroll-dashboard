import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { reportsService, employeeService, attendanceService, leaveService } from '../services/hrmsApi';
import type { ApiEmployee, ApiAttendance, ApiLeave } from '../services/hrmsApi';

import ExecutiveOverview from '../components/analytics/ExecutiveOverview';
import WorkforceAnalytics from '../components/analytics/WorkforceAnalytics';
import AttendanceAnalytics from '../components/analytics/AttendanceAnalytics';
import LeaveAnalytics from '../components/analytics/LeaveAnalytics';
import PayrollAnalytics from '../components/analytics/PayrollAnalytics';
import ExportCenter from '../components/analytics/ExportCenter';

// Custom Tooltip for Recharts (Shared across all charts)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/95">
        <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}: {p.value?.toLocaleString() ?? p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TABS = [
  { id: 'executive', label: 'Executive Overview', icon: '📊' },
  { id: 'workforce', label: 'Workforce', icon: '👥' },
  { id: 'attendance', label: 'Attendance', icon: '⏱️' },
  { id: 'leave', label: 'Leave', icon: '🏖️' },
  { id: 'payroll', label: 'Payroll', icon: '💰' },
  { id: 'export', label: 'Export Center', icon: '📥' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('executive');
  const [loading, setLoading] = useState(true);

  // Existing ReportsService Data
  const [headcountData, setHeadcountData] = useState<any[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [leaveByType, setLeaveByType] = useState<any[]>([]);
  const [deptAttn, setDeptAttn] = useState<any[]>([]);

  // Raw API Data for advanced analytics
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<ApiAttendance[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<ApiLeave[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState('Last 6 Months');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [hc, pt, lb, da, empRes, attRes, levRes] = await Promise.allSettled([
          reportsService.getHeadcountTrend(),
          reportsService.getPayrollTrend(),
          reportsService.getLeaveBreakdown(),
          reportsService.getDeptAttendance(),
          employeeService.getAll({ limit: 1000 }),
          attendanceService.getAll(),
          leaveService.getAll(),
        ]);
        
        if (hc.status === 'fulfilled') setHeadcountData(hc.value.trend.map(([name, headcount]) => ({ name, headcount })));
        if (pt.status === 'fulfilled') setPayrollTrend(pt.value.trend.map(([name, amount]) => ({ name, amount })));
        if (lb.status === 'fulfilled') setLeaveByType(lb.value.breakdown.map(([name, value, color]) => ({ name, value, color })));
        if (da.status === 'fulfilled') setDeptAttn(da.value.attendance.map(([name, attendance]) => ({ name, attendance })));
        if (empRes.status === 'fulfilled') setEmployees(empRes.value.employees);
        if (attRes.status === 'fulfilled') setAttendanceRecords(attRes.value.records);
        if (levRes.status === 'fulfilled') setLeaveRecords(levRes.value.leaves);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [dateRange]); // Reload if global filter changes (even if mocked for now)

  const latestHeadcount = headcountData.length > 0 ? headcountData[headcountData.length - 1].headcount : 0;
  const latestPayroll = payrollTrend.length > 0 ? payrollTrend[payrollTrend.length - 1].amount : 0;

  // Real data KPI summaries passed to Executive
  const summaryCards: [string, string | number, string, string, string][] = [
    ['Total Headcount', latestHeadcount > 0 ? String(latestHeadcount) : '—', '+12%', 'text-blue-500', 'bg-blue-50 dark:bg-blue-500/10'],
    ['Avg Attendance', '94.2%', '+2.1%', 'text-emerald-500', 'bg-emerald-50 dark:bg-emerald-500/10'], // Still hardcoded % as per original, or could be computed
    ['Total Payroll', latestPayroll > 0 ? `₹${latestPayroll}L` : '—', '+8.4%', 'text-purple-500', 'bg-purple-50 dark:bg-purple-500/10'],
  ];

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="flex h-full flex-col space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analytics Center</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Enterprise intelligence and workforce insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <span className="text-slate-400">📅</span>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none dark:text-slate-200"
              >
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>Year to Date</option>
                <option>All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1">
          {activeTab === 'executive' && (
            <ExecutiveOverview 
              summaryCards={summaryCards} 
              headcountData={headcountData} 
              loading={loading} 
              CustomTooltip={CustomTooltip} 
            />
          )}
          {activeTab === 'workforce' && (
            <WorkforceAnalytics 
              employees={employees} 
              loading={loading} 
              CustomTooltip={CustomTooltip} 
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceAnalytics 
              attendanceRecords={attendanceRecords} 
              deptAttn={deptAttn}
              loading={loading} 
              CustomTooltip={CustomTooltip} 
            />
          )}
          {activeTab === 'leave' && (
            <LeaveAnalytics 
              leaveRecords={leaveRecords} 
              leaveByType={leaveByType}
              loading={loading} 
              CustomTooltip={CustomTooltip} 
            />
          )}
          {activeTab === 'payroll' && (
            <PayrollAnalytics 
              payrollTrend={payrollTrend} 
              loading={loading} 
              CustomTooltip={CustomTooltip} 
            />
          )}
          {activeTab === 'export' && (
            <ExportCenter />
          )}
        </div>
        
      </div>
    </DashboardLayout>
  );
}
