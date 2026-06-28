interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  size?: 'sm' | 'md';   // sm = compact inline, md = full card (default)
}

export default function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Retry',
  size = 'md',
}: ErrorStateProps) {
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
        <i className="ti ti-alert-circle text-red-500 dark:text-red-400 flex-shrink-0" style={{ fontSize: 16 }} />
        <div className="flex-1">
          {title && <div className="text-sm font-semibold text-red-700 dark:text-red-400">{title}</div>}
          <div className="text-xs text-red-600 dark:text-red-300">{description}</div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline ml-auto flex-shrink-0"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-red-100 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/5">
      <div className="h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
        <i className="ti ti-wifi-off text-red-500 dark:text-red-400" style={{ fontSize: 24 }} />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-sm font-semibold transition flex items-center gap-2"
        >
          <i className="ti ti-refresh" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
