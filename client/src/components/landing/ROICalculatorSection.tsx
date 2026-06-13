import { useState } from 'react';

export default function ROICalculatorSection() {
  const [teamSize, setTeamSize] = useState(5);
  const [payrollAmount, setPayrollAmount] = useState(500000);

  // Calculations
  const hoursSaved = teamSize * 40;
  const monthlySavings = teamSize * 12000;
  const roiScore = "3.5x";

  return (
    <section className="py-20" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            ROI CALCULATOR
          </div>
          <h2 className="mb-3 text-2xl font-extrabold text-white sm:text-3xl">
            Calculate Your HRMSPro Savings
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-400">
            Estimate how much time and operational cost your HR team can save by automating payroll, attendance, and employee operations.
          </p>
        </div>

        {/* Calculator Card */}
        <div
          className="animate-fade-in-up mx-auto flex max-w-4xl flex-col gap-8 rounded-[24px] p-6 sm:p-8 lg:flex-row lg:items-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          {/* ── Left Side: Inputs ── */}
          <div className="flex-1 space-y-8">
            
            {/* Input 1 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-white">HR Team Size</label>
                <span className="rounded-lg px-2.5 py-1 text-xs font-bold text-blue-400" style={{ background: 'rgba(37,99,235,0.1)' }}>
                  {teamSize} Employees
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-blue-500 outline-none"
              />
            </div>

            {/* Input 2 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-white">Monthly Payroll (₹)</label>
                <span className="rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  ₹{payrollAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="10000000"
                step="100000"
                value={payrollAmount}
                onChange={(e) => setPayrollAmount(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-emerald-500 outline-none"
              />
            </div>

          </div>

          {/* ── Right Side: Results ── */}
          <div
            className="flex-1 rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(16,185,129,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              
              {/* Result 1 */}
              <div className="rounded-xl p-4 sm:p-5" style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="mb-1 text-xs font-medium text-slate-400">Hours Saved / Mo</div>
                <div className="text-2xl font-extrabold text-white">{hoursSaved}</div>
                <div className="mt-1.5 text-[10px] font-semibold text-blue-400">~{Math.round(hoursSaved/8)} working days</div>
              </div>

              {/* Result 2 */}
              <div className="rounded-xl p-4 sm:p-5" style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="mb-1 text-xs font-medium text-slate-400">Est. Savings / Mo</div>
                <div className="text-2xl font-extrabold text-white">₹{monthlySavings.toLocaleString('en-IN')}</div>
                <div className="mt-1.5 text-[10px] font-semibold text-emerald-400">Reduced op. cost</div>
              </div>

              {/* Result 3 (Full width) */}
              <div className="rounded-xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1 xl:col-span-2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(16,185,129,0.1) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}>
                {/* Glow */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="mb-0.5 text-xs font-bold text-slate-300">Projected ROI Score</div>
                    <div className="text-[10px] text-slate-400">Standard efficiency gains</div>
                  </div>
                  <div className="text-3xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #34d399)' }}>
                    {roiScore}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
