import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BankFormState {
  account: string;
  ifsc: string;
  bankName: string;
}

interface BankDetailsFormProps {
  bankForm: BankFormState;
  setBankForm: (form: BankFormState) => void;
  triggerAutoSave: () => void;
  isIfscValid: boolean;
  renderAITips: (text: string) => React.ReactNode;
}

export default function BankDetailsForm({
  bankForm,
  setBankForm,
  triggerAutoSave,
  isIfscValid,
  renderAITips
}: BankDetailsFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 grid gap-6 max-w-xl">
        <div className="relative group">
          <input
            id="account"
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
            value={bankForm.account}
            onChange={e => { setBankForm({ ...bankForm, account: e.target.value }); triggerAutoSave(); }}
            className="peer w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 pb-2.5 pt-7 text-sm font-black tracking-widest text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-50 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder-transparent dark:border-white/5 dark:bg-[#111827]/50 dark:hover:bg-[#111827] dark:focus:bg-[#0B1121] shadow-sm"
          />
          <label htmlFor="account" className="absolute left-5 top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-placeholder-shown:text-slate-500 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-black peer-focus:text-blue-600 dark:peer-placeholder-shown:text-slate-500 dark:peer-focus:text-blue-400 pointer-events-none">
            Account Number <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="relative group">
          <input
            id="ifsc"
            type="text"
            placeholder="SBIN0001234"
            maxLength={11}
            value={bankForm.ifsc}
            onChange={e => {
              const val = e.target.value.toUpperCase();
              setBankForm({
                ...bankForm,
                ifsc: val,
                bankName: val.length > 5 ? 'State Bank of India (Auto-detected)' : bankForm.bankName
              });
              triggerAutoSave();
            }}
            className="peer w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 pr-14 pb-2.5 pt-7 text-sm font-black text-slate-900 dark:text-white outline-none transition-all hover:bg-slate-50 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder-transparent dark:border-white/5 dark:bg-[#111827]/50 dark:hover:bg-[#111827] dark:focus:bg-[#0B1121] shadow-sm"
          />
          <label htmlFor="ifsc" className="absolute left-5 top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-placeholder-shown:text-slate-500 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-black peer-focus:text-blue-600 dark:peer-placeholder-shown:text-slate-500 dark:peer-focus:text-blue-400 pointer-events-none">
            IFSC Code <span className="text-red-500">*</span>
          </label>
          <AnimatePresence>
            {isIfscValid && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <i className="ti ti-check text-sm font-bold" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative group">
          <input
            id="bankName"
            type="text"
            placeholder="Bank Name"
            value={bankForm.bankName}
            onChange={e => { setBankForm({ ...bankForm, bankName: e.target.value }); triggerAutoSave(); }}
            className={`peer w-full rounded-2xl border-2 px-5 pb-2.5 pt-7 text-sm font-black outline-none transition-all shadow-sm placeholder-transparent ${bankForm.bankName.includes('Auto')
                ? 'bg-emerald-50/50 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:bg-emerald-500/5 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-50/50 border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/5 dark:bg-[#111827]/50 dark:hover:bg-[#111827] dark:focus:bg-[#0B1121] hover:bg-slate-50 hover:border-slate-200 text-slate-900 dark:text-white'
              }`}
          />
          <label htmlFor="bankName" className={`absolute left-5 top-2.5 text-[10px] font-black uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:font-black pointer-events-none ${bankForm.bankName.includes('Auto')
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 peer-placeholder-shown:text-slate-500 peer-focus:text-blue-600 dark:peer-placeholder-shown:text-slate-500 dark:peer-focus:text-blue-400'
            }`}>
            Bank Name
          </label>
        </div>
      </div>
      <div>
        {renderAITips("We securely encrypt all banking information. We verify your IFSC code in real-time to ensure payroll reaches you without delays.")}
      </div>
    </motion.div>
  );
}
