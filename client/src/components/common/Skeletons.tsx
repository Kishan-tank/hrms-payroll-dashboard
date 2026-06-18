export function BaseSkeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <BaseSkeleton className="mb-4 h-10 w-10 rounded-xl" />
      <BaseSkeleton className="mb-2 h-4 w-1/3" />
      <BaseSkeleton className="h-8 w-1/2" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex border-b border-slate-100 p-4 dark:border-white/5">
        <BaseSkeleton className="h-4 w-1/4" />
        <BaseSkeleton className="ml-4 h-4 w-1/4" />
        <BaseSkeleton className="ml-4 h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex border-b border-slate-50 p-4 last:border-0 dark:border-white/[0.02]">
          <div className="flex w-1/4 items-center gap-3">
            <BaseSkeleton className="h-8 w-8 rounded-full" />
            <BaseSkeleton className="h-4 w-24" />
          </div>
          <div className="flex w-1/4 items-center pl-4">
            <BaseSkeleton className="h-4 w-20" />
          </div>
          <div className="flex w-1/4 items-center pl-4">
            <BaseSkeleton className="h-4 w-16" />
          </div>
          <div className="flex w-1/4 items-center pl-4">
            <BaseSkeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex h-64 flex-col justify-end rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-auto flex justify-between">
        <BaseSkeleton className="h-5 w-32" />
        <BaseSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-8 flex h-32 items-end justify-between gap-2 sm:gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <BaseSkeleton
            key={i}
            className="w-full rounded-t-sm"
            style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
      <BaseSkeleton className="h-32 w-full rounded-none sm:h-48" />
      <div className="p-6 sm:p-8">
        <div className="-mt-16 sm:-mt-20">
          <BaseSkeleton className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-900 sm:h-32 sm:w-32" />
        </div>
        <div className="mt-4">
          <BaseSkeleton className="mb-2 h-8 w-48" />
          <BaseSkeleton className="mb-6 h-5 w-32" />
          
          <div className="flex gap-4">
            <BaseSkeleton className="h-10 w-24 rounded-xl" />
            <BaseSkeleton className="h-10 w-24 rounded-xl" />
          </div>
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
