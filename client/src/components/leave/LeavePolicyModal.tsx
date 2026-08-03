import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { leavePolicyService, ApiLeavePolicy } from '../../services/hrmsApi';
import { useToast } from '../../context/ToastContext';

const policySchema = z.object({
  name: z.string().min(2, 'Policy name must be at least 2 characters'),
  leaveType: z.enum([
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'Work From Home',
    'Optional Holiday',
  ]),
  daysAllotted: z.coerce.number().min(1, 'Days allotted must be at least 1'),
  department: z.string().optional(),
  allowCarryForward: z.boolean().default(false),
  maxCarryForwardDays: z.coerce.number().min(0).default(0),
});

type PolicyFormData = z.infer<typeof policySchema>;

interface LeavePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (policy: ApiLeavePolicy) => void;
}

export default function LeavePolicyModal({ isOpen, onClose, onSuccess }: LeavePolicyModalProps) {
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema) as any,
    defaultValues: {
      name: '',
      leaveType: 'Casual Leave',
      daysAllotted: 12,
      department: 'All',
      allowCarryForward: false,
      maxCarryForwardDays: 0,
    },
  });

  const allowCarryForward = watch('allowCarryForward');

  const onSubmit = async (data: PolicyFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await leavePolicyService.createPolicy({
        name: data.name,
        leaveType: data.leaveType,
        daysAllotted: data.daysAllotted,
        department: data.department || 'All',
        allowCarryForward: data.allowCarryForward,
        maxCarryForwardDays: data.allowCarryForward ? data.maxCarryForwardDays : 0,
      });

      if (res.success) {
        success(`Leave policy "${data.name}" created successfully!`);
        reset();
        onSuccess(res.policy);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to create leave policy';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl z-10 sm:p-8"
        >
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Create Leave Policy</h3>
              <p className="text-xs text-slate-400 mt-0.5">Admin-only: Configure organization leave rules</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">Policy Name *</label>
              <input
                {...register('name')}
                placeholder="e.g. Standard Annual Leave Policy"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
              {errors.name && (
                <span className="mt-1 block text-xs text-red-400">{errors.name.message}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Leave Type *</label>
                <select
                  {...register('leaveType')}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="Optional Holiday">Optional Holiday</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Days Allotted / Year *</label>
                <input
                  type="number"
                  min={1}
                  {...register('daysAllotted')}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
                {errors.daysAllotted && (
                  <span className="mt-1 block text-xs text-red-400">{errors.daysAllotted.message}</span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">Department</label>
              <input
                {...register('department')}
                placeholder="e.g. All, Engineering, HR"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">Allow Carry-Forward to Next Year</span>
                <input
                  type="checkbox"
                  {...register('allowCarryForward')}
                  className="h-4 w-4 rounded border-white/10 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
              </label>

              {allowCarryForward && (
                <div className="pt-2 border-t border-white/10">
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Max Carry-Forward Days</label>
                  <input
                    type="number"
                    min={0}
                    {...register('maxCarryForwardDays')}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating…' : 'Create Policy →'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
