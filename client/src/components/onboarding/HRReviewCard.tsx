import { motion } from 'framer-motion';

interface HRReviewCardProps {
  status?: 'In Progress' | 'Pending Review' | 'Approved' | 'Rejected';
  assignedHr?: string;
  notes?: string;
}

export default function HRReviewCard({
  status = 'In Progress',
  assignedHr = 'HR Team (Sarah Jenkins)',
  notes
}: HRReviewCardProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Rejected':
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      case 'Pending Review':
        return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    }
  };

  const getProgressWidth = () => {
    switch (status) {
      case 'Approved': return '100%';
      case 'Pending Review': return '75%';
      case 'Rejected': return '50%';
      default: return '33%';
    }
  };

  return (
    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <i className="ti ti-shield-check text-amber-500 text-lg" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Review Status</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getBadgeStyle()}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'Approved' ? 'bg-emerald-500' : status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
          {status}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Assigned To</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">{assignedHr}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Stage</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {status === 'Approved' ? 'Verified & Onboarded' : status === 'Pending Review' ? 'HR Verification' : status === 'Rejected' ? 'Revision Needed' : 'Drafting Info'}
          </span>
        </div>

        {notes && (
          <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300 border border-red-200 dark:border-red-500/20">
            <strong className="block font-bold mb-0.5">HR Notes:</strong>
            {notes}
          </div>
        )}

        <div className="w-full bg-slate-200/50 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1 shadow-inner">
          <motion.div 
            className={`h-full rounded-full ${status === 'Approved' ? 'bg-emerald-500' : status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'}`}
            initial={{ width: 0 }}
            animate={{ width: getProgressWidth() }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
