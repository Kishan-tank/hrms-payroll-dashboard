import { useEffect, useMemo, useState } from 'react';
import { BarChart2, Users, Clock, Umbrella, Coins, Download, Calendar, ChevronDown } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  reportsService,
  employeeService,
  attendanceService,
  leaveService,
  analyticsService,
  ApiAnalyticsOverview,
} from '../services/hrmsApi';
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
  { id: 'executive', label: 'Executive Overview', icon: BarChart2 },
  { id: 'workforce', label: 'Workforce', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: Umbrella },
  { id: 'payroll', label: 'Payroll', icon: Coins },
  { id: 'export', label: 'Export Center', icon: Download },
];

function getRangeParam(label: string): string {
  switch (label) {
    case 'Last 12 Months':
      return '12m';
    case 'This Year':
      return 'this_year';
    case 'All Time':
      return 'all';
    case 'Last 6 Months':
    default:
      return '6m';
  }
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('executive');
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Last 6 Months');

  // Real aggregated overview state
  const [overview, setOverview] = useState<ApiAnalyticsOverview | null>(null);

  // Data states
  const [headcountData, setHeadcountData] = useState<any[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [leaveByType, setLeaveByType] = useState<any[]>([]);
  const [deptAttn, setDeptAttn] = useState<any[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<ApiAttendance[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<ApiLeave[]>([]);
  const [salaryDistribution, setSalaryDistribution] = useState<any[]>([]);
  const [deptPayrollCost, setDeptPayrollCost] = useState<any[]>([]);
  const [compensationBreakdown, setCompensationBreakdown] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const rangeParam = getRangeParam(dateRange);

      try {
        const [ovRes, hc, pt, lb, da, empRes, attRes, levRes, pdRes] = await Promise.allSettled([
          analyticsService.getOverview(rangeParam),
          reportsService.getHeadcountTrend(),
          reportsService.getPayrollTrend(),
          reportsService.getLeaveBreakdown(),
          reportsService.getDeptAttendance(),
          employeeService.getAll({ limit: 1000 }),
          attendanceService.getAll(),
          leaveService.getAll(),
          analyticsService.getPayrollDistribution(),
        ]);

        if (ovRes.status === 'fulfilled' && ovRes.value.success) {
          setOverview(ovRes.value);
          if (ovRes.value.headcountTrend) {
            setHeadcountData(ovRes.value.headcountTrend);
          }
        } else if (hc.status === 'fulfilled') {
          setHeadcountData(hc.value.trend.map(([name, headcount]) => ({ name, headcount })));
        }

        if (pt.status === 'fulfilled') setPayrollTrend(pt.value.trend.map(([name, amount]) => ({ name, amount })));
        if (lb.status === 'fulfilled') setLeaveByType(lb.value.breakdown.map(([name, value, color]) => ({ name, value, color })));
        if (da.status === 'fulfilled') setDeptAttn(da.value.attendance.map(([name, attendance]) => ({ name, attendance })));
        if (empRes.status === 'fulfilled') setEmployees(empRes.value.employees);
        if (attRes.status === 'fulfilled') setAttendanceRecords(attRes.value.records);
        if (levRes.status === 'fulfilled') setLeaveRecords(levRes.value.leaves);
        if (pdRes.status === 'fulfilled') {
          setSalaryDistribution(pdRes.value.salaryDistribution || []);
          setDeptPayrollCost(pdRes.value.departmentPayrollCost || []);
          setCompensationBreakdown(pdRes.value.compensationBreakdown || []);
        }
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [dateRange]);

  const latestHeadcount = headcountData.length > 0 ? headcountData[headcountData.length - 1].headcount : 0;
  const latestPayroll = payrollTrend.length > 0 ? payrollTrend[payrollTrend.length - 1].amount : 0;

  const averageAttendancePercent = useMemo(() => {
    const total = attendanceRecords.length;
    if (total === 0) return 'No data yet';
    const presentCount = attendanceRecords.filter((record) => ['Present', 'Late'].includes(record.status)).length;
    return `${((presentCount / total) * 100).toFixed(1)}%`;
  }, [attendanceRecords]);

  const totalHc = overview ? String(overview.totalHeadcount) : (latestHeadcount > 0 ? String(latestHeadcount) : '0');
  const avgAttn = overview ? (overview.avgAttendance === '0.0%' ? 'No data yet' : overview.avgAttendance) : averageAttendancePercent;
  const totalPay = overview ? (overview.totalPayrollRaw > 0 ? `₹${overview.totalPayroll}` : 'No data yet') : (latestPayroll > 0 ? `₹${latestPayroll}L` : 'No data yet');
  const leaveUtil = overview ? (overview.leaveUtilization === '0.0%' ? 'No data yet' : overview.leaveUtilization) : 'No data yet';
  const attrRisk = overview ? overview.attritionRisk : '0%';

  const summaryCards: [string, string | number, string, string, string][] = [
    ['Total Headcount', totalHc, '', 'text-blue-500', 'bg-blue-50 dark:bg-blue-500/10'],
    ['Avg Attendance', avgAttn, '', 'text-emerald-500', 'bg-emerald-50 dark:bg-emerald-500/10'],
    ['Total Payroll', totalPay, '', 'text-purple-500', 'bg-purple-50 dark:bg-purple-500/10'],
    ['Leave Utilization', leaveUtil, '', 'text-violet-500', 'bg-violet-50 dark:bg-violet-500/10'],
    ['Attrition Risk', attrRisk, '', 'text-red-500', 'bg-red-50 dark:bg-red-500/10'],
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="flex h-full flex-col space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analytics Center</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Enterprise intelligence and workforce insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>{dateRange}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 dark:border-white/10 dark:bg-slate-900">
                  {['Last 6 Months', 'Last 12 Months', 'This Year', 'All Time'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setDateRange(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        dateRange === option
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-md dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-none'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1">
          {activeTab === 'executive' && (
            <ExecutiveOverview
              summaryCards={summaryCards}
              headcountData={headcountData}
              attritionRiskProfile={overview?.attritionRiskProfile}
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
              salaryDistribution={salaryDistribution}
              deptPayrollCost={deptPayrollCost}
              compensationBreakdown={compensationBreakdown}
            />
          )}
          {activeTab === 'export' && (
            <ExportCenter
              employees={employees}
              attendanceRecords={attendanceRecords}
              leaveRecords={leaveRecords}
              payrollTrend={payrollTrend}
              salaryDistribution={salaryDistribution}
              deptPayrollCost={deptPayrollCost}
              compensationBreakdown={compensationBreakdown}
              isEmployee={false}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}