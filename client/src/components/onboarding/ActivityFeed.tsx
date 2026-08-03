import type { ApiOnboardingActivity } from '../../services/hrmsApi';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function ActivityFeed({ logs }: { logs?: ApiOnboardingActivity[] }) {
  const activities = (logs && logs.length > 0)
    ? logs.slice().reverse().slice(0, 4)
    : [
        { action: 'Draft auto-saved', timestamp: new Date().toISOString(), details: 'Started onboarding' },
      ];

  return (
    <div className="p-6 border-t border-slate-100 dark:border-white/5">
      <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="ti ti-activity text-blue-500 text-base" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{activity.action}</span>
                {activity.details && (
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[170px]">{activity.details}</span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 shrink-0 ml-2">
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
