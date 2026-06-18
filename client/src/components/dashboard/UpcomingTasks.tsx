import { CheckCircle2, Clock, CalendarDays } from 'lucide-react';

const TASKS = [
  { id: 1, title: 'Complete Q3 Performance Reviews', due: 'Today, 5:00 PM', priority: 'High', type: 'Review' },
  { id: 2, title: 'Finalize October Payroll Run', due: 'Tomorrow, 12:00 PM', priority: 'High', type: 'Payroll' },
  { id: 3, title: 'Onboard 5 New Engineering Hires', due: 'Oct 15', priority: 'Medium', type: 'Onboarding' },
  { id: 4, title: 'Update Health Insurance Policies', due: 'Oct 20', priority: 'Low', type: 'Policy' },
];

export default function UpcomingTasks() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Tasks</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your HR action items</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {TASKS.length}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {TASKS.map((task) => (
          <div
            key={task.id}
            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-blue-500/30 dark:hover:bg-blue-500/5"
          >
            <div className="mt-0.5 shrink-0 text-slate-300 transition-colors group-hover:text-blue-500 dark:text-slate-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{task.title}</h4>
              <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {task.due}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {task.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
        View All Tasks
      </button>
    </div>
  );
}
