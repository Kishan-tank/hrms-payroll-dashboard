import { useToast } from '../../context/ToastContext';
import type { ApiEmployee, ApiAttendance, ApiLeave } from '../../services/hrmsApi';

interface ExportCenterProps {
  employees: ApiEmployee[];
  attendanceRecords: ApiAttendance[];
  leaveRecords: ApiLeave[];
  payrollTrend: { name: string; amount: number }[];
  salaryDistribution: { range: string; count: number }[];
  deptPayrollCost: { department: string; cost: number }[];
  compensationBreakdown: { name: string; value: number }[];
  isEmployee: boolean;
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

/** Escape a single CSV field: wrap in quotes if it contains comma, quote, or newline. */
function escapeField(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildRow(fields: unknown[]): string {
  return fields.map(escapeField).join(',');
}

function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── CSV builders ─────────────────────────────────────────────────────────────

function buildEmployeeCsv(employees: ApiEmployee[]): string {
  const header = buildRow(['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Join Date', 'Basic Pay (₹)']);
  const rows = employees.map((e) =>
    buildRow([e.employeeId, e.name, e.email, e.phone ?? '', e.department, e.role, e.status, e.joinDate, e.basicPay])
  );
  return [header, ...rows].join('\n');
}

function buildAttendanceCsv(records: ApiAttendance[]): string {
  const header = buildRow(['Date', 'Employee Name', 'Employee ID', 'Department', 'Status', 'Check In', 'Check Out']);
  const rows = records.map((r) =>
    buildRow([
      r.date,
      r.employeeId?.name ?? '',
      r.employeeId?.employeeId ?? '',
      r.employeeId?.department ?? '',
      r.status,
      r.checkIn ?? '',
      r.checkOut ?? '',
    ])
  );
  return [header, ...rows].join('\n');
}

function buildLeaveCsv(records: ApiLeave[]): string {
  const header = buildRow(['Employee Name', 'Department', 'Leave Type', 'From Date', 'To Date', 'Days', 'Status', 'Reason']);
  const rows = records.map((r) =>
    buildRow([
      r.employeeId?.name ?? '',
      r.employeeId?.department ?? '',
      r.type,
      r.fromDate,
      r.toDate,
      r.days,
      r.status,
      r.reason ?? '',
    ])
  );
  return [header, ...rows].join('\n');
}

function buildPayrollCsv(
  payrollTrend: { name: string; amount: number }[],
  salaryDistribution: { range: string; count: number }[],
  deptPayrollCost: { department: string; cost: number }[],
  compensationBreakdown: { name: string; value: number }[]
): string {
  const sections: string[] = [];

  // Section 1: Monthly Payroll Trend
  sections.push('MONTHLY PAYROLL TREND');
  sections.push(buildRow(['Month', 'Total Amount (₹)']));
  payrollTrend.forEach((r) => sections.push(buildRow([r.name, r.amount])));

  sections.push('');

  // Section 2: Salary Distribution (company-wide ranges)
  sections.push('SALARY DISTRIBUTION (COMPANY-WIDE)');
  sections.push(buildRow(['Salary Range', 'Employee Count']));
  salaryDistribution.forEach((r) => sections.push(buildRow([r.range, r.count])));

  sections.push('');

  // Section 3: Department Payroll Cost
  sections.push('DEPARTMENT PAYROLL COST');
  sections.push(buildRow(['Department', 'Total Cost (₹)']));
  deptPayrollCost.forEach((r) => sections.push(buildRow([r.department, r.cost])));

  sections.push('');

  // Section 4: Compensation Breakdown
  sections.push('COMPENSATION BREAKDOWN');
  sections.push(buildRow(['Component', 'Value']));
  compensationBreakdown.forEach((r) => sections.push(buildRow([r.name, r.value])));

  sections.push('');
  sections.push('NOTE: This file contains aggregate/summary data only. Individual payslip records are not included.');

  return sections.join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportCenter({
  employees,
  attendanceRecords,
  leaveRecords,
  payrollTrend,
  salaryDistribution,
  deptPayrollCost,
  compensationBreakdown,
  isEmployee,
}: ExportCenterProps) {
  const toast = useToast();

  const handleExportAttendance = () => {
    const csv = buildAttendanceCsv(attendanceRecords);
    downloadCsv(`attendance-report-${todayString()}.csv`, csv);
    toast.success(`Attendance report downloaded (${attendanceRecords.length} records).`);
  };

  const handleExportLeave = () => {
    const csv = buildLeaveCsv(leaveRecords);
    downloadCsv(`leave-report-${todayString()}.csv`, csv);
    toast.success(`Leave report downloaded (${leaveRecords.length} records).`);
  };

  const handleExportEmployees = () => {
    const csv = buildEmployeeCsv(employees);
    downloadCsv(`employee-report-${todayString()}.csv`, csv);
    toast.success(`Employee report downloaded (${employees.length} records).`);
  };

  const handleExportPayroll = () => {
    const csv = buildPayrollCsv(payrollTrend, salaryDistribution, deptPayrollCost, compensationBreakdown);
    downloadCsv(`payroll-summary-${todayString()}.csv`, csv);
    toast.success('Payroll summary report downloaded.');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reports Export Center</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate and download organisational data as CSV files.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Report — visible to all roles */}
        <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-[#0B1121] dark:hover:border-white/20">
          <div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Report</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {isEmployee
                    ? 'Your personal attendance log — dates, check-in/out times, and daily status.'
                    : 'Full log of check-ins, check-outs, and daily attendance status across all employees.'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-white/5">
            <button
              onClick={handleExportAttendance}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Leave Report — visible to all roles */}
        <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-[#0B1121] dark:hover:border-white/20">
          <div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 border-violet-500/20 text-violet-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leave Report</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {isEmployee
                    ? 'Your leave history — type, dates, duration, and approval status.'
                    : 'Full history of approved and pending leaves across all employees, including type, duration, and status.'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-white/5">
            <button
              onClick={handleExportLeave}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Employee Report — HR/Admin only */}
        {!isEmployee && (
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-[#0B1121] dark:hover:border-white/20">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border-blue-500/20 text-blue-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Employee Report</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Comprehensive list of all employees including contact details, department, role, status, and basic pay.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-white/5">
              <button
                onClick={handleExportEmployees}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}

        {/* Payroll Report — HR/Admin only */}
        {!isEmployee && (
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-[#0B1121] dark:hover:border-white/20">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border-amber-500/20 text-amber-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payroll Report</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Aggregate payroll summary — monthly trends, salary distribution bands, department costs, and compensation breakdown. Not individual payslips.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-white/5">
              <button
                onClick={handleExportPayroll}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
