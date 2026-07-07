import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function ExportCenter() {
  const toast = useToast();
  const [busyExport, setBusyExport] = useState<string | null>(null);

  const handleExport = async (type: string, format: string) => {
    const exportKey = `${type}-${format}`;
    setBusyExport(exportKey);

    try {
      await new Promise((resolve, reject) => {
        window.setTimeout(() => {
          if (type === 'Payroll Report' && format === 'PDF') {
            reject(new Error('PDF export is temporarily unavailable. Please try again later.'));
            return;
          }

          resolve(true);
        }, 900);
      });

      toast.success(`${type} export completed in ${format} format.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to export ${type} as ${format}.`;
      toast.error(message);
    } finally {
      setBusyExport(null);
    }
  };

  const reports = [
    { title: 'Employee Report', desc: 'Comprehensive list of all active and inactive employees including contact and role data.', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Attendance Report', desc: 'Detailed log of check-ins, check-outs, missing punches, and attendance percentages.', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Leave Report', desc: 'Full history of approved and pending leaves, balances, and utilization metrics.', color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
    { title: 'Payroll Report', desc: 'Salary disbursement logs, bonuses, deductions, and total organizational payroll cost.', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reports Export Center</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate and download comprehensive organizational data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <div key={report.title} className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-[#0B1121] dark:hover:border-white/20">
            <div>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${report.bg} ${report.color}`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{report.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{report.desc}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap dark:border-white/5">
              <button
                type="button"
                onClick={() => handleExport(report.title, 'CSV')}
                disabled={busyExport === `${report.title}-CSV`}
                aria-busy={busyExport === `${report.title}-CSV`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 sm:flex-1"
              >
                {busyExport === `${report.title}-CSV` ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" /> Exporting...</>
                ) : (
                  'Export CSV'
                )}
              </button>
              <button
                type="button"
                onClick={() => handleExport(report.title, 'Excel')}
                disabled={busyExport === `${report.title}-Excel`}
                aria-busy={busyExport === `${report.title}-Excel`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 sm:flex-1"
              >
                {busyExport === `${report.title}-Excel` ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" /> Exporting...</>
                ) : (
                  'Export Excel'
                )}
              </button>
              <button
                type="button"
                onClick={() => handleExport(report.title, 'PDF')}
                disabled={busyExport === `${report.title}-PDF`}
                aria-busy={busyExport === `${report.title}-PDF`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 sm:flex-1"
              >
                {busyExport === `${report.title}-PDF` ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /> Exporting...</>
                ) : (
                  'Generate PDF'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
