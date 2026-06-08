interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const accentClasses: Record<NonNullable<DashboardCardProps['accentColor']>, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
};

export default function DashboardCard({
  title,
  value,
  description,
  accentColor = 'indigo',
}: DashboardCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Metric label and badge */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${accentClasses[accentColor]}`}>
          Live
        </span>
      </div>

      {/* Metric value */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-950">{value}</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      </div>
    </article>
  );
}
