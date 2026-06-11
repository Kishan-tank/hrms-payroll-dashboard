interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const accentClasses: Record<NonNullable<DashboardCardProps['accentColor']>, string> = {
  indigo: 'bg-blue-50 text-blue-600 ring-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  rose: 'bg-red-50 text-red-600 ring-red-100',
  sky: 'bg-sky-50 text-sky-600 ring-sky-100',
};

export default function DashboardCard({
  title,
  value,
  description,
  accentColor = 'indigo',
}: DashboardCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* Metric label and badge */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${accentClasses[accentColor]}`}>
          Live
        </span>
      </div>

      {/* Metric value */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-950">{value}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${accentColor === 'amber' ? 'w-2/5 bg-amber-400' : accentColor === 'emerald' ? 'w-4/5 bg-emerald-500' : accentColor === 'sky' ? 'w-3/5 bg-sky-500' : 'w-3/4 bg-blue-600'}`} />
      </div>
    </article>
  );
}
