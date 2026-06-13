import { useEffect, useState } from 'react';

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export default function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [showToast, setShowToast] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowToast(false); // Reset toast on open
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Toast auto-hide
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!isOpen) return null;

  const agenda = [
    'Employee Dashboard',
    'Leave Management',
    'HR Approval Workflow',
    'Payroll Automation',
    'Payslip & Reports',
    'Analytics Dashboard'
  ];

  const handlePlayClick = () => {
    setShowToast(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer animate-fade-in"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(16px)' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className="animate-fade-in-up relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] shadow-2xl"
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(37,99,235,0.2)',
          boxShadow: '0 0 50px rgba(37,99,235,0.15), 0 30px 100px rgba(0,0,0,0.8)',
          animationDuration: '0.4s'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <h3 className="text-xl font-bold text-white">2-Minute HRMSPro Walkthrough</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col lg:flex-row">
          
          {/* Left side: Video Player Placeholder */}
          <div className="relative flex-1 bg-slate-950 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 transition-all duration-500 hover:opacity-40" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)', filter: 'blur(40px)' }} />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <button 
                onClick={handlePlayClick}
                className="group relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-110 hover:bg-blue-500 hover:shadow-[0_0_50px_rgba(37,99,235,0.7)] active:scale-95"
              >
                {/* Inner ring animation */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 transition-transform duration-300 group-hover:scale-110" />
                <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              
              <h4 className="text-xl font-bold tracking-tight text-white">Interactive Product Overview</h4>
            </div>

            {/* Premium Toast Notification */}
            {showToast && (
              <div 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl"
                style={{ 
                  background: 'rgba(15,23,42,0.95)', 
                  border: '1px solid rgba(37,99,235,0.4)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(37,99,235,0.2)'
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </span>
                <p className="text-sm font-bold text-white">Product walkthrough video coming soon</p>
              </div>
            )}
          </div>

          {/* Right side: Details */}
          <div className="w-full lg:w-[380px] p-6 sm:p-8" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            
            {/* Info Cards */}
            <div className="mb-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-bold text-white">2 Minutes</p>
              </div>
              <div className="rounded-xl p-4 transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Roles</p>
                <p className="mt-1 text-sm font-bold text-white">Employee + HR Manager</p>
              </div>
              <div className="col-span-2 rounded-xl p-4 transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Modules Covered</p>
                <p className="mt-1 text-sm font-bold text-blue-400">Payroll, Attendance, Leave, Reports</p>
              </div>
            </div>

            {/* Agenda */}
            <div>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Walkthrough Agenda</h4>
              <ul className="space-y-4">
                {agenda.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <CheckIcon />
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
