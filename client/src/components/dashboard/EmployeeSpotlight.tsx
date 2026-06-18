

const SPOTLIGHT = {
  name: 'Aisha Verma',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  avatar: 'AV',
  avatarGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  quote: '"Aisha consistently delivers high-quality code and mentors junior engineers with exceptional patience. A true asset to our team!"',
  manager: 'David Chen, VP of Engineering'
};

export default function EmployeeSpotlight() {
  return (
    <div className="relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:backdrop-blur-sm">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-blue-500/10 blur-[60px]" />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          <span className="text-base">🏆</span> Employee of the Month
        </span>
        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400">
          June 2026
        </span>
      </div>

      {/* Main Content (Centered) */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* Avatar */}
        <div className="relative mb-5">
          <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur-md" />
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white text-2xl font-extrabold text-white shadow-lg dark:border-[#0B1121] dark:shadow-2xl"
            style={{ background: SPOTLIGHT.avatarGradient }}
          >
            {SPOTLIGHT.avatar}
          </div>
          {/* Performance Badge */}
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-[#0B1121] dark:shadow-lg">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        {/* Profile Info */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{SPOTLIGHT.name}</h3>
        <p className="text-sm font-semibold text-slate-500 dark:font-medium dark:text-slate-400">{SPOTLIGHT.title}</p>
        <span className="mt-2 inline-block rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-400">
          Score: 98/100
        </span>

        {/* Manager Quote */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
          <p className="text-xs italic leading-relaxed font-medium text-slate-600 dark:text-slate-300">
            {SPOTLIGHT.quote}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            — {SPOTLIGHT.manager}
          </p>
        </div>
      </div>
    </div>
  );
}
