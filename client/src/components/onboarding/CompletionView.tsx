interface CompletionViewProps {
  onDashboardClick: () => void;
}

export default function CompletionView({ onDashboardClick }: CompletionViewProps) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>

      <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Onboarding Complete</h3>
      <p className="mx-auto mb-8 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">
        Your profile has been successfully submitted. Our HR team will review your details.
      </p>

      <div className="mb-8 flex flex-col gap-4 w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Welcome Kit</h4>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Employee ID</span>
              <span className="font-bold text-slate-900 dark:text-white">EMP-0142</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Department</span>
              <span className="font-bold text-slate-900 dark:text-white">Engineering</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Document Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Secured</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onDashboardClick}
        className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
