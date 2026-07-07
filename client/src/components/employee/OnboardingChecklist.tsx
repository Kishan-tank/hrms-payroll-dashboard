import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, User, FileText, Clock, IndianRupee, BookOpen, MessageSquare, PartyPopper } from 'lucide-react';

const STORAGE_KEY = 'hrmspro:onboarding-progress';

interface Task {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
}

const ONBOARDING_TASKS: Task[] = [
  { id: 'profile', title: 'Complete Profile', description: 'Add your personal details and emergency contacts.', icon: User, route: '/profile' },
  { id: 'documents', title: 'Upload Documents', description: 'Submit your Aadhaar, PAN, and banking details.', icon: FileText, route: '/documents' },
  { id: 'attendance', title: 'Mark First Attendance', description: 'Check-in to register your first working day.', icon: Clock, route: '/attendance' },
  { id: 'payroll', title: 'View First Payslip', description: 'Understand your salary structure and deductions.', icon: IndianRupee, route: '/payroll' },
  { id: 'handbook', title: 'Read Company Handbook', description: 'Review our policies and cultural guidelines.', icon: BookOpen, route: '/help' },
  { id: 'contact_hr', title: 'Contact HR', description: 'Reach out if you have any questions or need help.', icon: MessageSquare, route: '/help' },
];

export default function OnboardingChecklist() {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedTasks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse onboarding progress', e);
    }
    setIsLoaded(true);
  }, []);

  const toggleTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (completedTasks.includes(id)) {
      updated = completedTasks.filter((t) => t !== id);
    } else {
      updated = [...completedTasks, id];
    }
    setCompletedTasks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (!isLoaded) return null;

  const progress = Math.round((completedTasks.length / ONBOARDING_TASKS.length) * 100);
  const isAllDone = completedTasks.length === ONBOARDING_TASKS.length;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1121] p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
        
        {/* Left: Progress Status */}
        <div className="flex-shrink-0 md:w-64">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              {isAllDone ? <PartyPopper className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Getting Started</h2>
              <p className="text-sm text-slate-400">Your onboarding journey</p>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-white">{progress}% Completed</span>
            <span className="text-slate-500">{completedTasks.length}/{ONBOARDING_TASKS.length}</span>
          </div>
          
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <AnimatePresence>
            {isAllDone && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-start gap-2"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>You're all set! You have successfully completed your onboarding.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Tasks List */}
        <div className="flex-1 grid gap-3 sm:grid-cols-2">
          {ONBOARDING_TASKS.map((task, i) => {
            const isDone = completedTasks.includes(task.id);
            const Icon = task.icon;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(task.route)}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isDone 
                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' 
                    : 'bg-white/[0.04] border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.06]'
                }`}
              >
                <button 
                  onClick={(e) => toggleTask(task.id, e)}
                  className={`shrink-0 transition-colors ${isDone ? 'text-emerald-500 hover:text-emerald-400' : 'text-slate-500 hover:text-indigo-400'}`}
                >
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-slate-300 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>
                </div>

                <div className="shrink-0 p-2 rounded-full bg-white/5 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
