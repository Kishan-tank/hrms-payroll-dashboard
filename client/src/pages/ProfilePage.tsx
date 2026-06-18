import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';

function Badge({ children, color }: { children: React.ReactNode; color: 'blue' | 'emerald' | 'amber' | 'purple' }) {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorStyles[color]}`}>
      {children}
    </span>
  );
}

export default function ProfilePage() {
  const { user } = useAuthContext();
  const name = user?.name || 'Aisha Verma';
  const role = user?.role === 'hr-manager' ? 'HR Manager' : 'Senior Software Engineer';
  const department = user?.role === 'hr-manager' ? 'Human Resources' : 'Engineering';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <DashboardLayout title="My Profile">
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        {/* Cover Banner & Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
        >
          {/* Cover */}
          <div className="h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 sm:h-48" />
          
          <div className="px-6 pb-6 sm:px-10">
            {/* Avatar overlapping cover */}
            <div className="relative -mt-16 sm:-mt-24 flex items-end justify-between">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-4xl font-extrabold text-white shadow-lg dark:border-slate-950 sm:h-40 sm:w-40 sm:text-5xl">
                {initials}
              </div>
              <div className="mb-4 flex gap-3">
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/10">
                  Edit Profile
                </button>
                <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-700">
                  Request Time Off
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{name}</h1>
                <Badge color="emerald">Active</Badge>
              </div>
              <p className="mt-1 text-lg font-medium text-blue-600 dark:text-blue-400">{role}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {department}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Bangalore, IN</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-1">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            >
              <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-400">About</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Passionate professional with over 5 years of experience in enterprise systems. Specialized in scaling architectures and improving team velocity through rigorous code reviews and mentorship.
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">📧</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{name.toLowerCase().replace(' ', '.')}@hrmspro.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">📞</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">🗓️</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Joined Mar 2021 (3y 4m)</span>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            >
              <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-slate-400">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'System Architecture', 'Mentorship', 'Agile'].map(skill => (
                  <span key={skill} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Performance & Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            >
              <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Performance Overview</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <p className="text-xs font-bold uppercase text-slate-500">Overall Rating</p>
                  <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-400">4.8<span className="text-base text-slate-400">/5.0</span></p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-500">↑ Top 5% this quarter</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <p className="text-xs font-bold uppercase text-slate-500">Goals Completed</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-slate-100">14<span className="text-base text-slate-400">/15</span></p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">93% completion rate</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <p className="text-xs font-bold uppercase text-slate-500">Attendance Rate</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-500">99%</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">1 day taken this year</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Technical Excellence</span>
                    <span>95%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <div className="h-full w-[95%] rounded-full bg-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Leadership & Collaboration</span>
                    <span>90%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <div className="h-full w-[90%] rounded-full bg-purple-500" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            >
              <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Career Timeline</h2>
              
              <div className="relative border-l-2 border-slate-100 pl-6 dark:border-white/10">
                <div className="mb-8 relative">
                  <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Jan 2025</p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Promoted to Senior Role</h3>
                  <p className="mt-1 text-sm text-slate-500">Recognized for outstanding contribution to the core infrastructure rewrite.</p>
                </div>
                
                <div className="mb-8 relative">
                  <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 ring-4 ring-white dark:bg-white/20 dark:ring-slate-950" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Aug 2023</p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Awarded "Employee of the Quarter"</h3>
                  <p className="mt-1 text-sm text-slate-500">Delivered the Q3 roadmap 2 weeks ahead of schedule.</p>
                </div>
                
                <div className="relative">
                  <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 ring-4 ring-white dark:bg-white/20 dark:ring-slate-950" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mar 2021</p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Joined HRMSPro</h3>
                  <p className="mt-1 text-sm text-slate-500">Started journey as a mid-level professional.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
