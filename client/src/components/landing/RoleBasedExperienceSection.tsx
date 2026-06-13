

// Icons
function UserIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export default function RoleBasedExperienceSection() {
  const employeeFeatures = [
    'View Attendance',
    'Apply Leave Requests',
    'Download Payslips',
    'Manage Profile',
    'Track Leave Balance'
  ];

  const hrFeatures = [
    'Employee Management',
    'Payroll Processing',
    'Leave Approvals',
    'Reports & Analytics',
    'Compliance Tracking'
  ];

  const trustItems = [
    'Role-Based Access Control',
    'JWT Authentication',
    'Protected Routes',
    'Secure Permissions'
  ];

  return (
    <section className="py-24" style={{ background: '#020617' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="animate-fade-in-up mb-16 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            ROLE-BASED EXPERIENCE
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            Built For Every Role
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            HRMSPro delivers tailored experiences for employees and HR managers through secure role-based access control.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Employee Card */}
          <div
            className="animate-slide-in-left group relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '32px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(37,99,235,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-30" style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                <UserIcon />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">Employee Portal</h3>
              <p className="mb-8 text-sm leading-relaxed text-slate-400">
                A streamlined self-service experience that empowers employees to manage attendance, leave, payroll information, and personal records independently.
              </p>
              
              <ul className="mb-8 space-y-4">
                {employeeFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <CheckIcon />
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative z-10 mt-auto inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-400" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
              Employee Experience
            </div>
          </div>

          {/* HR Manager Card */}
          <div
            className="animate-slide-in-right group relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '32px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(124,58,237,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-30" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <BriefcaseIcon />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">HR Manager Portal</h3>
              <p className="mb-8 text-sm leading-relaxed text-slate-400">
                A centralized dashboard for managing employees, payroll operations, approvals, reporting, and workforce compliance.
              </p>
              
              <ul className="mb-8 space-y-4">
                {hrFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                      <CheckIcon />
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative z-10 mt-auto inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-transparent" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
              HR Management Suite
            </div>
          </div>

        </div>

        {/* Bottom Trust Strip */}
        <div className="animate-fade-in animation-delay-300 mt-12 flex flex-wrap items-center justify-center gap-3">
          {trustItems.map((item) => (
            <div
              key={item}
              className="group flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(37,99,235,0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <CheckIcon />
              </span>
              <span className="text-xs font-semibold text-slate-300 transition-colors group-hover:text-white">
                {item}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
