import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type StepId = 'profile' | 'documents' | 'bank' | 'handbook' | 'complete';
export type StepStatus = 'pending' | 'in_progress' | 'completed';

export interface OnboardingStep {
  id: StepId;
  title: string;
  description: string;
  icon: string;
  status: StepStatus;
  completedAt?: string;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  currentStepId: StepId;
  completedAt?: string;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your personal details, phone number, date of birth, and address.',
    icon: 'user-circle',
    status: 'in_progress',
  },
  {
    id: 'documents',
    title: 'Upload documents',
    description: 'Submit your government ID, offer letter acceptance, and any certificates.',
    icon: 'file-upload',
    status: 'pending',
  },
  {
    id: 'bank',
    title: 'Add bank details',
    description: 'Enter your account number, IFSC code, and bank name for payroll.',
    icon: 'building-bank',
    status: 'pending',
  },
  {
    id: 'handbook',
    title: 'Read the employee handbook',
    description: 'Review company policies, code of conduct, and leave entitlements.',
    icon: 'book',
    status: 'pending',
  },
  {
    id: 'complete',
    title: 'All set!',
    description: 'Your onboarding is complete. Welcome to the team.',
    icon: 'confetti',
    status: 'pending',
  }
];

export function useOnboarding(userId?: string) {
  const STORAGE_KEY = `hrms_onboarding_${userId ?? 'default'}`;

  const [state, setState] = useLocalStorage<OnboardingState>(STORAGE_KEY, {
    steps: DEFAULT_STEPS,
    currentStepId: 'profile',
  });

  const completedCount = state.steps.filter(s => s.id !== 'complete' && s.status === 'completed').length;
  const totalSteps = state.steps.filter(s => s.id !== 'complete').length;
  const completionPercent = Math.round((completedCount / totalSteps) * 100);
  const isComplete = completionPercent === 100;

  const setCurrentStep = useCallback((id: StepId) => {
    setState(prev => ({ ...prev, currentStepId: id }));
  }, []);

  const completeStep = useCallback((id: StepId) => {
    setState(prev => {
      const newSteps = [...prev.steps];
      const targetIndex = newSteps.findIndex(s => s.id === id);
      if (targetIndex === -1) return prev;

      // Mark current as completed
      newSteps[targetIndex] = {
        ...newSteps[targetIndex],
        status: 'completed',
        completedAt: new Date().toISOString(),
      };

      // Find next step skipping 'complete'
      let nextStepId: StepId = 'complete';
      const nextIndex = targetIndex + 1;
      
      if (nextIndex < newSteps.length && newSteps[nextIndex].id !== 'complete') {
        nextStepId = newSteps[nextIndex].id;
        if (newSteps[nextIndex].status === 'pending') {
          newSteps[nextIndex] = {
            ...newSteps[nextIndex],
            status: 'in_progress',
          };
        }
      }

      // Check if all non-complete steps are completed
      const allDone = newSteps.filter(s => s.id !== 'complete').every(s => s.status === 'completed');
      let completedAt = prev.completedAt;
      
      if (allDone) {
        const completeIndex = newSteps.findIndex(s => s.id === 'complete');
        if (completeIndex !== -1) {
          newSteps[completeIndex] = {
            ...newSteps[completeIndex],
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
        }
        completedAt = new Date().toISOString();
      }

      return {
        steps: newSteps,
        currentStepId: nextStepId,
        completedAt,
      };
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({
      steps: DEFAULT_STEPS,
      currentStepId: 'profile',
    });
  }, []);

  return {
    steps: state.steps,
    currentStepId: state.currentStepId,
    isComplete,
    completionPercent,
    completeStep,
    setCurrentStep,
    resetOnboarding,
  };
}
