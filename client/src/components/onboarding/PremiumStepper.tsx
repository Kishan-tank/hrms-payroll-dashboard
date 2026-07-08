import { motion, AnimatePresence } from 'framer-motion';
import type { OnboardingStep } from '../../hooks/useOnboarding';

interface PremiumStepperProps {
  steps: OnboardingStep[];
  currentStepId: string;
  onStepClick: (id: string) => void;
}

export default function PremiumStepper({ steps, currentStepId, onStepClick }: PremiumStepperProps) {
  const filteredSteps = steps.filter(s => s.id !== 'complete');
  const currentIndex = filteredSteps.findIndex(s => s.id === currentStepId);

  const icons: Record<string, string> = {
    profile: 'ti-user',
    documents: 'ti-file-text',
    bank: 'ti-building-bank',
    handbook: 'ti-book-2',
  };

  const titles: Record<string, string> = {
    profile: 'Personal Info',
    documents: 'Documents',
    bank: 'Bank Details',
    handbook: 'Policies',
  };

  return (
    <div className="relative mb-8 pt-4 pb-2 hidden md:block">
      <div className="flex justify-between items-center relative z-10 w-full px-8">
        
        {/* Continuous background track line */}
        <div className="absolute top-7 left-14 right-14 h-1 bg-slate-100 dark:bg-white/5 rounded-full -z-10" />

        {/* Animated fill line */}
        <motion.div 
          className="absolute top-7 left-14 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (filteredSteps.length - 1)) * 100}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        {filteredSteps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.id === currentStepId;
          const isInteractable = isCompleted || isCurrent;
          const icon = icons[step.id] || 'ti-circle';
          const title = titles[step.id] || step.id;

          return (
            <div 
              key={step.id} 
              className={`relative flex flex-col items-center group w-32 ${isInteractable ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => isInteractable && onStepClick(step.id)}
            >
              {isCurrent && (
                <motion.div 
                  layoutId="stepper-active-glow"
                  className="absolute top-0 w-20 h-20 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-xl -translate-y-3"
                  transition={{ duration: 0.5 }}
                />
              )}

              <div className="relative">
                <motion.div 
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ease-out z-10 border-[3px] ${
                    isCompleted 
                      ? 'bg-emerald-500 border-white dark:border-[#0B1121] text-white shadow-lg shadow-emerald-500/30' 
                      : isCurrent 
                        ? 'bg-white border-blue-600 dark:bg-[#111827] text-blue-600 shadow-xl shadow-blue-600/20 scale-110 ring-4 ring-blue-50 dark:ring-blue-900/30' 
                        : 'bg-white border-slate-200 dark:bg-[#0B1121] dark:border-white/10 text-slate-300 dark:text-slate-600'
                  }`}
                  whileHover={isInteractable ? { scale: isCurrent ? 1.15 : 1.05 } : {}}
                  whileTap={isInteractable ? { scale: 0.95 } : {}}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.i 
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="ti ti-check" 
                        style={{ fontSize: 24 }} 
                      />
                    ) : (
                      <motion.i 
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`ti ${icon}`} 
                        style={{ fontSize: 24 }} 
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className={`mt-4 text-center transition-colors duration-300 ${
                isCurrent ? 'opacity-100' : isCompleted ? 'opacity-70 group-hover:opacity-100' : 'opacity-40'
              }`}>
                <p className={`text-xs font-black uppercase tracking-widest ${
                  isCurrent ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }`}>
                  Step {index + 1}
                </p>
                <p className={`text-sm font-extrabold mt-1 ${
                  isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
