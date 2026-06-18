import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-inner dark:bg-white/5 dark:text-blue-400 dark:shadow-[0_4px_16px_rgba(59,130,246,0.15)] ring-1 ring-slate-100 dark:ring-white/10">
        {icon}
      </div>
      
      <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-white">
        {title}
      </h3>
      
      <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
