import { motion, AnimatePresence } from 'framer-motion';

interface PoliciesFormProps {
  handbookAgreed: boolean;
  setHandbookAgreed: (val: boolean) => void;
}

export default function PoliciesForm({
  handbookAgreed,
  setHandbookAgreed
}: PoliciesFormProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2 gap-10">
      {/* Mock PDF Viewer */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-2 dark:border-white/10 dark:bg-black/50 hidden md:block shadow-sm">
        <div className="h-10 border-b border-slate-200/80 dark:border-white/10 flex items-center px-4 gap-2 mb-2 bg-white/80 dark:bg-white/5 rounded-t-2xl backdrop-blur-sm">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" /><div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" /></div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 ml-2 uppercase">Employee_Handbook.pdf</span>
        </div>
        <div className="h-[400px] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-8 flex flex-col gap-6 opacity-80 border border-slate-100 dark:border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-slate-900/50" />
          <div className="h-8 w-2/3 bg-slate-200 rounded-lg dark:bg-slate-800" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-100 rounded-md dark:bg-slate-800/50" />
            <div className="h-3 w-full bg-slate-100 rounded-md dark:bg-slate-800/50" />
            <div className="h-3 w-5/6 bg-slate-100 rounded-md dark:bg-slate-800/50" />
            <div className="h-3 w-4/6 bg-slate-100 rounded-md dark:bg-slate-800/50" />
          </div>
          <div className="h-6 w-1/2 bg-slate-200 rounded-lg dark:bg-slate-800 mt-6" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-100 rounded-md dark:bg-slate-800/50" />
            <div className="h-3 w-full bg-slate-100 rounded-md dark:bg-slate-800/50" />
            <div className="h-3 w-4/5 bg-slate-100 rounded-md dark:bg-slate-800/50" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center space-y-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Company Policies</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Please review the key policies outlined in our employee handbook before proceeding.</p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-5 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <i className="ti ti-plane-departure text-2xl" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Leave Policy</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">18 days PTO, 6 days sick leave annually.</p>
            </div>
          </div>
          <div className="flex gap-5 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <i className="ti ti-shield-check text-2xl" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Code of Conduct</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Professionalism, respect, and integrity.</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className={`group flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${handbookAgreed
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.02]'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/50 dark:border-white/10 dark:bg-[#111827] dark:hover:border-white/20'
            }`}>
            <div className="flex h-6 items-center mt-1">
              <div className={`relative flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${handbookAgreed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-transparent group-hover:border-blue-400'
                }`}>
                <AnimatePresence>
                  {handbookAgreed && (
                    <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ti ti-check text-white text-sm font-bold" />
                  )}
                </AnimatePresence>
                <input
                  type="checkbox"
                  checked={handbookAgreed}
                  onChange={e => setHandbookAgreed(e.target.checked)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
            <div className="flex flex-col cursor-pointer">
              <span className={`text-sm font-black transition-colors ${handbookAgreed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                Digital Acknowledgement
              </span>
              <span className={`text-xs font-semibold mt-1.5 leading-relaxed ${handbookAgreed ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-slate-500'}`}>
                I have read, understood, and agree to abide by the policies in the Employee Handbook.
              </span>
            </div>
          </label>
        </div>
      </div>
    </motion.div>
  );
}
