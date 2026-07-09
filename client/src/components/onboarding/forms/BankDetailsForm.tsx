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
}: BankDetailsFormProps) {

  const lbl = "block text-[10px] font-black uppercase tracking-widest mb-1.5 text-slate-400 dark:text-slate-500";
  const inp = "w-full rounded-xl border text-sm font-semibold px-3.5 py-2.5 outline-none transition-all bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto flex flex-col gap-8 w-full"
    >
      <div className="text-center">
        <div className="mx-auto h-14 w-14 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10">
           <i className="ti ti-building-bank text-2xl" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Salary Account Details</h3>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Your information is encrypted and secure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 dark:bg-white/5 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
        {/* Account Number — full width */}
        <div className="sm:col-span-2">
          <label htmlFor="account" className={lbl}>Account Number <span className="text-red-400">*</span></label>
          <input
            id="account"
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
            value={bankForm.account}
            onChange={e => { setBankForm({ ...bankForm, account: e.target.value }); triggerAutoSave(); }}
            className={`${inp} tracking-[0.18em] font-mono`}
          />
        </div>

      {/* IFSC Code */}
      <div>
        <label htmlFor="ifsc" className={lbl}>IFSC Code <span className="text-red-400">*</span></label>
        <div className="relative">
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
            className={`${inp} pr-11 font-mono uppercase`}
          />
          <AnimatePresence>
            {isIfscValid && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30"
              >
                <i className="ti ti-shield-check text-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bank Name */}
      <div>
        <label htmlFor="bankName" className={`${lbl} ${bankForm.bankName.includes('Auto') ? '!text-emerald-500' : ''}`}>
          Bank Name
        </label>
        <input
          id="bankName"
          type="text"
          placeholder="Bank Name"
          value={bankForm.bankName}
          onChange={e => { setBankForm({ ...bankForm, bankName: e.target.value }); triggerAutoSave(); }}
          className={`${inp} ${bankForm.bankName.includes('Auto')
            ? '!border-emerald-300 dark:!border-emerald-500/40 !bg-emerald-50/60 dark:!bg-emerald-500/5 text-emerald-800 dark:text-emerald-300'
            : ''
          }`}
        />
      </div>
      </div>
    </motion.div>
  );
}
