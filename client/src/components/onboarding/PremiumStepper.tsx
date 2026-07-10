
import type { OnboardingStep } from '../../hooks/useOnboarding';

interface PremiumStepperProps {
  steps: OnboardingStep[];
  currentStepId: string;
  onStepClick: (id: string) => void;
}

const icons: Record<string, string> = {
  profile: 'ti-user-scan',
  documents: 'ti-file-upload',
  bank: 'ti-building-bank',
  handbook: 'ti-book-2',
  'hr-review': 'ti-shield-check',
};

const titles: Record<string, string> = {
  profile: 'Personal Info',
  documents: 'Documents',
  bank: 'Bank Details',
  handbook: 'Policies',
  'hr-review': 'Review & Submit',
};

export default function PremiumStepper({ steps, currentStepId, onStepClick }: PremiumStepperProps) {
  const filteredSteps = steps.filter(s => s.id !== 'complete');
  // Our steps + HR Review at the end
  const allSteps = [
    ...filteredSteps,
    { id: 'hr-review', status: 'pending' as const },
  ];

  return (
    <div className="hidden md:flex w-full select-none overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex items-center justify-start sm:justify-center flex-nowrap bg-white dark:bg-[#0B1121] border border-slate-200 dark:border-white/5 p-3 px-6 rounded-[2rem] shadow-sm mx-auto min-w-max">
        {allSteps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.id === currentStepId;
          const isLocked = step.id === 'hr-review';
          const isClickable = (isCompleted || isCurrent) && !isLocked;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Block */}
              <div 
                className={`flex items-center gap-3 transition-opacity ${isClickable ? 'cursor-pointer hover:opacity-80' : 'opacity-60 grayscale-[0.2]'}`}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                {/* Icon Circle */}
                <div className={`relative h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                  isCompleted ? 'bg-slate-800 dark:bg-white/10 text-white' : 
                  'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/5'
                }`}>
                   <i className={`ti ${isCompleted ? 'ti-check' : icons[step.id] || 'ti-circle'} text-[22px] z-10 leading-none`} style={{ display: 'block' }} />
                </div>
                
                {/* Text Details */}
                <div className="flex flex-col">
                  <span className={`text-[13px] font-bold tracking-tight ${isCurrent || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {titles[step.id]}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    Step {index + 1}
                  </span>
                </div>
              </div>
              
              {/* Separator Line */}
              {index < allSteps.length - 1 && (
                <div className="px-5">
                  <div className={`h-[1px] w-6 ${isCompleted ? 'bg-slate-300 dark:bg-white/20' : 'bg-slate-200 dark:bg-white/10'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
