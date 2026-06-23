import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CalendarCheck, IndianRupee, Clock, Bell, UserPlus, ShieldAlert, Search } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import { MOCK_AUDIT_LOGS, ActivityType } from '../components/activity/mockActivityData';

function getEventConfig(type: ActivityType) {
  switch (type) {
    case 'employee':   return { icon: <UserPlus className="h-4 w-4 text-blue-500" />,      bg: 'bg-blue-50 dark:bg-blue-500/20',   dot: 'bg-blue-500' };
    case 'leave':      return { icon: <CalendarCheck className="h-4 w-4 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-500/20', dot: 'bg-emerald-500' };
    case 'payroll':    return { icon: <IndianRupee className="h-4 w-4 text-violet-500" />,   bg: 'bg-violet-50 dark:bg-violet-500/20',  dot: 'bg-violet-500' };
    case 'attendance': return { icon: <Clock className="h-4 w-4 text-amber-500" />,         bg: 'bg-amber-50 dark:bg-amber-500/20',   dot: 'bg-amber-500' };
    case 'document':   return { icon: <FileText className="h-4 w-4 text-cyan-500" />,       bg: 'bg-cyan-50 dark:bg-cyan-500/20',     dot: 'bg-cyan-500' };
    case 'system':     return { icon: <Bell className="h-4 w-4 text-pink-500" />,           bg: 'bg-pink-50 dark:bg-pink-500/20',     dot: 'bg-pink-500' };
    default:           return { icon: <Bell className="h-4 w-4 text-slate-500" />,          bg: 'bg-slate-100 dark:bg-slate-500/20',  dot: 'bg-slate-500' };
  }
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

type FilterType = 'all' | ActivityType;

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      const passType = filter === 'all' ? true : log.type === filter;
      const passSearch = search === '' ? true : 
        log.actor.toLowerCase().includes(search.toLowerCase()) || 
        log.action.toLowerCase().includes(search.toLowerCase()) || 
        log.target.toLowerCase().includes(search.toLowerCase());
      return passType && passSearch;
    });
  }, [filter, search]);

  const tabs: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Employee', value: 'employee' },
    { label: 'Leave', value: 'leave' },
    { label: 'Payroll', value: 'payroll' },
    { label: 'Attendance', value: 'attendance' },
    { label: 'Document', value: 'document' },
    { label: 'System', value: 'system' }
  ];

  return (
    <DashboardLayout title="Audit Logs">
      <div className="relative z-10 space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-500" />
            Activity Feed
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enterprise audit timeline for system events and user actions.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex overflow-x-auto no-scrollbar gap-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filter === tab.value
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search actors, targets, actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border-0 py-2 pl-10 pr-4 text-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-slate-400" />}
            title="No activity found"
            description="No events match your current filters and search query."
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
            <div className="relative pl-4 sm:pl-6">
              {/* Vertical line */}
              <div className="absolute bottom-4 left-[27px] top-4 w-px bg-slate-200 dark:bg-white/15 sm:left-[35px]" />

              <div className="flex flex-col gap-6">
                {filtered.map((log) => {
                  const cfg = getEventConfig(log.type);
                  return (
                    <div
                      key={log.id}
                      className={`group relative flex items-start gap-4 transition-all ${log.route ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] -mx-4 px-4 py-2 rounded-xl' : ''}`}
                      onClick={() => log.route && navigate(log.route)}
                    >
                      {/* Icon */}
                      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${cfg.bg}`}>
                        {cfg.icon}
                        <span className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#0B1121] ${cfg.dot}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white">{log.actor}</span>
                          {' '}{log.action}{' '}
                          <span className="font-bold text-slate-900 dark:text-white">{log.target}</span>
                        </p>
                        
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {formatTime(log.timestamp)}
                          </span>
                          {log.metadata && (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-400">
                              {log.metadata}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
