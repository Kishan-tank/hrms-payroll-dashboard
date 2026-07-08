import { motion } from 'framer-motion';

interface WelcomeHeroProps {
  userName: string;
  department?: string;
  role?: string;
  joinDate?: string;
  completionPercent: number;
  estimatedMinutesRemaining: number;
  avatarUrl?: string;
}

export default function WelcomeHero({
  userName,
  department = 'New Hire',
  role = 'Employee',
  joinDate,
  completionPercent,
  avatarUrl,
}: WelcomeHeroProps) {
  const firstName = userName?.split(' ')[0] || 'User';

  const getMilestoneText = () => {
    if (completionPercent === 100) return "You're ready to launch!";
    if (completionPercent >= 75) return "Almost there, finish strong!";
    if (completionPercent >= 50) return "Halfway through, keep going!";
    if (completionPercent >= 25) return "Great start, let's keep the momentum.";
    return "Let's get your workspace set up.";
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/30 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-none mb-10 z-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[80px] dark:from-blue-500/20 dark:to-purple-500/20" />
      <div className="pointer-events-none absolute -bottom-20 left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 blur-[60px] dark:from-emerald-500/10 dark:to-teal-500/10" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] dark:opacity-[0.05] mix-blend-overlay" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          {/* Avatar */}
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-[2rem] border-[4px] border-white bg-slate-100 shadow-2xl shadow-blue-500/10 dark:border-slate-800 dark:bg-white/5 overflow-hidden transition-all duration-300"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl sm:text-4xl font-black text-white">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-[-2px] right-[-2px] h-6 w-6 rounded-xl border-4 border-white bg-emerald-500 shadow-sm dark:border-slate-800" />
          </motion.div>

          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="rounded-xl bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-100 dark:border-blue-500/30 shadow-sm">
                 Acme Corp HQ
               </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome aboard, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{firstName}</span>! 🚀
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              We're thrilled to have you here. {getMilestoneText()}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 bg-slate-50 border border-slate-100 dark:border-white/5 dark:bg-white/5 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default">
                <i className="ti ti-briefcase text-blue-500 text-lg" /> 
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{role}</span>
              </span>
              <span className="flex items-center gap-2 bg-slate-50 border border-slate-100 dark:border-white/5 dark:bg-white/5 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default">
                <i className="ti ti-building text-indigo-500 text-lg" /> 
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{department}</span>
              </span>
              {joinDate && (
                <span className="flex items-center gap-2 bg-slate-50 border border-slate-100 dark:border-white/5 dark:bg-white/5 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default">
                  <i className="ti ti-calendar text-emerald-500 text-lg" /> 
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Joined Today</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
