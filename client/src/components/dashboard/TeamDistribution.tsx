import { Users, UserCheck, Briefcase } from 'lucide-react';

const DISTRIBUTION = [
  { type: 'Full-Time', count: 1042, percentage: 83.5, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { type: 'Contractors', count: 156, percentage: 12.5, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { type: 'Part-Time', count: 50, percentage: 4.0, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export default function TeamDistribution() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Distribution</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">By employment type</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {DISTRIBUTION.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.type} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.type}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${item.bg.replace('/10', '')}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
