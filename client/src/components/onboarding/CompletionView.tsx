import { motion } from 'framer-motion';
// @ts-ignore
import Confetti from 'react-confetti';

interface CompletionViewProps {
  onDashboardClick: () => void;
}

export default function CompletionView({ onDashboardClick }: CompletionViewProps) {
  return (
    <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-700 py-6 relative">
      <div className="fixed inset-0 pointer-events-none z-50 flex justify-center overflow-hidden">
        <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 1000} height={typeof window !== 'undefined' ? window.innerHeight : 1000} recycle={false} numberOfPieces={800} colors={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']} gravity={0.15} />
      </div>

      <div className="relative mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-2xl shadow-emerald-500/40 relative z-10 mx-auto">
          <i className="ti ti-check" style={{ fontSize: 40 }} />
        </motion.div>
      </div>

      <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Onboarding Complete</motion.h3>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
        Your profile has been securely submitted. You are now entering the enterprise activation phase.
      </motion.p>

      {/* Grid Layout for Enterprise Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-5xl mb-10 text-left">
        
        {/* Left Column (8 cols): Timeline & Summary */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* Activation Journey */}
          <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Activation Journey</h4>
            <div className="flex justify-between relative overflow-x-auto pb-4 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full -z-10 min-w-[500px]" />
              <div className="absolute top-5 left-0 w-[20%] h-1 bg-blue-500 rounded-full -z-10 min-w-[100px]" />
              
              {[
                { label: 'Submitted', icon: 'check', active: true, done: true },
                { label: 'HR Review', icon: 'user-search', active: true, done: false },
                { label: 'Verify Docs', icon: 'file-check', active: false, done: false },
                { label: 'Payroll', icon: 'coin', active: false, done: false },
                { label: 'Workspace', icon: 'apps', active: false, done: false },
                { label: 'Manager Intro', icon: 'users', active: false, done: false }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3 min-w-[70px] shrink-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-colors ${step.done ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' : step.active ? 'bg-white dark:bg-[#0B1121] border-blue-500 text-blue-500 shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                    <i className={`ti ti-${step.icon} text-xl`} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${step.active || step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Post-Onboarding Timeline */}
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-6 sm:p-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Estimated Timeline</h4>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 ring-4 ring-emerald-100 dark:ring-emerald-500/20 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Submitted Now</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Your profile is queued for processing.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-100 dark:ring-blue-500/20 animate-pulse shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">HR Review (Within 24 Hours)</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Assigned HR will verify your submitted documents and details.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Payroll Activation (Within 48 Hours)</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Finance team will setup your salary account structure.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Full Access Unlocked</p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Workspace, apps, and manager introduction will follow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Welcome Kit & Status */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          {/* Completion Summary */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/30">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/80">Completion Summary</h4>
              <span className="px-2 py-1 rounded border border-white/20 bg-white/10 text-[9px] font-black uppercase tracking-widest shadow-sm">100% Strength</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <i className="ti ti-check bg-white/20 p-1 rounded-full text-[10px]" />
                <span className="text-xs font-bold text-white/90">All required steps completed</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="ti ti-shield-check bg-white/20 p-1 rounded-full text-[10px]" />
                <span className="text-xs font-bold text-white/90">Documents secured</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="ti ti-file-text bg-white/20 p-1 rounded-full text-[10px]" />
                <span className="text-xs font-bold text-white/90">Policies acknowledged</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="ti ti-building-bank bg-white/20 p-1 rounded-full text-[10px]" />
                <span className="text-xs font-bold text-white/90">Bank details saved</span>
              </div>
            </div>
          </div>

          {/* Welcome Kit */}
          <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] p-6 flex-1 flex flex-col shadow-xl shadow-slate-200/20 dark:shadow-none">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Welcome Kit</h4>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Employee ID</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">EMP-0142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Department</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Engineering</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">HR Partner</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">Sarah Jenkins</span>
              </div>
              <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Document Status</span>
                <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">Secured</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Account Status</span>
                <span className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-500/20">Pending Review</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Payroll Status</span>
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">Activation Pending</span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Action Cards / CTAs */}
      {/* TODO: Connect these frontend simulated buttons to actual backend routing when ready */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-3xl">
        <button onClick={() => {}} className="px-5 py-3 rounded-[14px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 hover:border-slate-300 dark:hover:border-white/20">
          <i className="ti ti-user" /> View Profile
        </button>
        <button onClick={() => {}} className="px-5 py-3 rounded-[14px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 hover:border-slate-300 dark:hover:border-white/20">
          <i className="ti ti-folder" /> Open Documents
        </button>
        <button onClick={() => {}} className="px-5 py-3 rounded-[14px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 hover:border-slate-300 dark:hover:border-white/20">
          <i className="ti ti-headset" /> Contact HR
        </button>
      </motion.div>

      {/* Main CTA */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
        onClick={onDashboardClick}
        className="group relative rounded-full bg-slate-900 dark:bg-white overflow-hidden transition-all px-12 py-5 text-sm sm:text-base font-black text-white dark:text-slate-900 shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 active:scale-95 mt-2"
      >
        <span className="relative z-10 flex items-center gap-3">
          Explore Your Dashboard <i className="ti ti-arrow-right group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </div>
  );
}
