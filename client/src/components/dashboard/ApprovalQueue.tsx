import { useState, useEffect } from 'react';
import { Check, X, FileText, IndianRupee, Clock } from 'lucide-react';
import type { HrSummary } from '../../services/hrmsApi';
import { leaveService } from '../../services/hrmsApi';

const DEFAULT_QUEUE = [
  { id: '1', type: 'Leave', user: 'Sarah Jenkins', detail: 'Sick Leave (2 days)', time: '2h ago', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: '2', type: 'Payroll', user: 'Marcus Chen', detail: 'Expense Reimbursement', time: '4h ago', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: '3', type: 'Leave', user: 'Emily Davis', detail: 'Annual Vacation (5 days)', time: '1d ago', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: '4', type: 'Shift', user: 'Arjun Patel', detail: 'Shift Change Request', time: '1d ago', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: '5', type: 'Expense', user: 'Priya Sharma', detail: 'Client Dinner Budget', time: '2d ago', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

function getIcon(type: string) {
  if (type === 'Payroll' || type === 'Expense') return IndianRupee;
  if (type === 'Shift') return Clock;
  return FileText;
}

export default function ApprovalQueue({ summary, onUpdate }: { summary?: HrSummary | null; onUpdate?: () => void }) {
  const [queue, setQueue] = useState(summary?.approvalQueue ?? DEFAULT_QUEUE);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (summary?.approvalQueue) {
      setQueue(summary.approvalQueue);
    }
  }, [summary?.approvalQueue]);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    setProcessingId(id);
    try {
      if (id.length > 5) {
        // Real MongoDB ID
        await leaveService.updateStatus(id, status);
      }
      setQueue((prev) => prev.filter((item) => item.id !== id));
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update status:', err);
      // Still remove from UI for demo review purposes
      setQueue((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Approval Queue</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pending requests</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          {queue.length} Pending
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {queue.map((item) => {
          const Icon = getIcon(item.type);
          const isProcessing = processingId === item.id;
          return (
            <div key={item.id} className={`group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-slate-50 dark:hover:bg-white/5 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{item.user}</p>
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{item.detail} • {item.time}</p>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                <button
                  onClick={() => handleAction(item.id, 'Rejected')}
                  disabled={isProcessing}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAction(item.id, 'Approved')}
                  disabled={isProcessing}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-50/10"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {queue.length === 0 && (
          <p className="text-center text-sm font-medium text-slate-500 py-6">All caught up! No pending approvals.</p>
        )}
      </div>
    </div>
  );
}
