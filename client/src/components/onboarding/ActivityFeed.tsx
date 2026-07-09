export default function ActivityFeed() {
  const activities = [
    { id: 1, title: 'Policies accepted', time: 'Just now', icon: 'ti-book-2', color: 'text-purple-500' },
    { id: 2, title: 'Draft auto-saved', time: '2m ago', icon: 'ti-cloud-check', color: 'text-slate-500' },
    { id: 3, title: 'IFSC verified', time: '10m ago', icon: 'ti-building-bank', color: 'text-emerald-500' },
  ];

  return (
    <div className="p-6 border-t border-slate-100 dark:border-white/5">
      <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className={`ti ${activity.icon} ${activity.color} text-base`} />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{activity.title}</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
