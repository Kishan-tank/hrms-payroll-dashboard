import { motion } from 'framer-motion';

interface PoliciesFormProps {
  handbookAgreed: boolean;
  setHandbookAgreed: (val: boolean) => void;
}

export default function PoliciesForm({
  handbookAgreed,
  setHandbookAgreed
}: PoliciesFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="max-w-2xl mx-auto flex flex-col gap-6">
      
      <div className="text-center mb-2">
        <div className="mx-auto h-14 w-14 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20 shadow-sm shadow-indigo-500/10">
           <i className="ti ti-book-2 text-2xl" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Company Policies</h3>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Review and Acknowledge</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Policy 1 */}
        <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <i className="ti ti-plane-departure text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Leave Policy</h4>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">18 days PTO, 6 days sick leave annually.</p>
          </div>
        </div>
        
        {/* Policy 2 */}
        <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <i className="ti ti-shield-check text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Code of Conduct</h4>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Professionalism, respect, and integrity.</p>
          </div>
        </div>
      </div>

      {/* Acknowledgment Checkbox */}
      <label className={`mt-2 group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        handbookAgreed
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-400 dark:border-white/10 dark:bg-[#111827] dark:hover:border-blue-500/50'
      }`}>
        <div className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
          handbookAgreed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-blue-400'
        }`}>
          {handbookAgreed && (
            <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} className="ti ti-check text-white text-sm font-bold" />
          )}
          <input
            type="checkbox"
            checked={handbookAgreed}
            onChange={e => setHandbookAgreed(e.target.checked)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-bold transition-colors ${handbookAgreed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            Digital Acknowledgement
          </span>
          <span className={`text-[11px] font-medium mt-1 leading-snug ${handbookAgreed ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-slate-500'}`}>
            I have read, understood, and agree to abide by the policies in the Employee Handbook.
          </span>
        </div>
      </label>
      
    </motion.div>
  );
}
