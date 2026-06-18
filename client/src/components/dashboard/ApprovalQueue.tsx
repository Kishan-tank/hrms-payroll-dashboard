import { Check, X, FileText, IndianRupee, Clock } from 'lucide-react';

const QUEUE = [
  { id: 1, type: 'Leave', user: 'Sarah Jenkins', detail: 'Sick Leave (2 days)', time: '2h ago', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 2, type: 'Payroll', user: 'Marcus Chen', detail: 'Expense Reimbursement', time: '4h ago', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 3, type: 'Leave', user: 'Emily Davis', detail: 'Annual Vacation (5 days)', time: '1d ago', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 4, type: 'Shift', user: 'Arjun Patel', detail: 'Shift Change Request', time: '1d ago', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 5, type: 'Expense', user: 'Priya Sharma', detail: 'Client Dinner Budget', time: '2d ago', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function ApprovalQueue() {
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Approval Queue</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pending requests</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          {QUEUE.length} Pending
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {QUEUE.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{item.user}</p>
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{item.detail} • {item.time}</p>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10">
                  <X className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
