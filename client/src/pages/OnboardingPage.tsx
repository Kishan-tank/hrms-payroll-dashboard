import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';
import { useOnboarding, type OnboardingStep, type StepId } from '../hooks/useOnboarding';
import { useToast } from '../context/ToastContext';
import ProgressSidebar from '../components/onboarding/ProgressSidebar';
import PremiumStepper from '../components/onboarding/PremiumStepper';
import PersonalInfoForm from '../components/onboarding/forms/PersonalInfoForm';
import DocumentsForm from '../components/onboarding/forms/DocumentsForm';
import BankDetailsForm from '../components/onboarding/forms/BankDetailsForm';
import PoliciesForm from '../components/onboarding/forms/PoliciesForm';
import CompletionView from '../components/onboarding/CompletionView';
import EnterpriseSupportPanel from '../components/onboarding/EnterpriseSupportPanel';
import { motion, AnimatePresence } from 'framer-motion';


export default function OnboardingPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    steps,
    currentStepId,
    isComplete,
    completeStep,
    setCurrentStep,
  } = useOnboarding(user?.id || user?.email);

  const filteredSteps = steps.filter(s => s.id !== 'complete');
  const currentIndex = filteredSteps.findIndex(s => s.id === currentStepId);
  const completionPercent = Math.round((Math.max(0, currentIndex) / filteredSteps.length) * 100);

  // Resume where you left off (Local Storage Mock)
  useEffect(() => {
    const savedStep = localStorage.getItem('onboarding_current_step');
    if (savedStep && steps.find(s => s.id === savedStep) && !isComplete) {
      setCurrentStep(savedStep as StepId);
      toast.info('Resumed from where you left off');
    }
  }, []);

  useEffect(() => {
    if (currentStepId && !isComplete) {
      localStorage.setItem('onboarding_current_step', currentStepId);
    }
  }, [currentStepId, isComplete]);

  // Profile Step State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    dob: '',
    gender: '',
    address: '',
  });
  const [profileError, setProfileError] = useState(false);

  // Documents Step State
  const [govId, setGovId] = useState<File | null>(null);
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const govIdRef = useRef<HTMLInputElement>(null);
  const offerLetterRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  // Bank Step State
  const [bankForm, setBankForm] = useState({
    account: '',
    ifsc: '',
    bankName: '',
  });

  // Handbook Step State
  const [handbookAgreed, setHandbookAgreed] = useState(false);

  // Auto-Save & Loading State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drag State for Dropzones
  const [draggingMap, setDraggingMap] = useState<Record<string, boolean>>({});

  // Help Panel State
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  // Profile Strength Calculation
  const calculateProfileStrength = () => {
    let score = 0;
    if (profileForm.phone) score += 10;
    if (profileForm.dob) score += 10;
    if (profileForm.gender) score += 10;
    if (profileForm.address) score += 10;
    if (govId) score += 15;
    if (offerLetter) score += 15;
    if (certificates) score += 10;
    if (bankForm.account && bankForm.ifsc) score += 10;
    if (handbookAgreed) score += 10;
    return score;
  };

  const profileStrength = calculateProfileStrength();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const triggerAutoSave = () => {
    setHasUnsavedChanges(true);
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isContinueDisabled && !isComplete) handleNext();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (currentIndex > 0 && !isComplete) handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, profileForm, bankForm, handbookAgreed, isComplete]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saveStatus]);

  const handleNext = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      switch (currentStepId) {
        case 'profile':
          if (!profileForm.phone.trim() || !profileForm.address.trim()) {
            setProfileError(true);
            return;
          }
          setProfileError(false);
          completeStep('profile');
          toast.success('Profile saved successfully');
          break;
        case 'documents':
          completeStep('documents');
          toast.success('Documents securely uploaded');
          break;
        case 'bank':
          if (!bankForm.account.trim() || !bankForm.ifsc.trim()) return;
          completeStep('bank');
          toast.success('Bank details verified');
          break;
        case 'handbook':
          if (!handbookAgreed) return;
          completeStep('handbook');
          break;
      }
    }, 600); // Simulate network request for premium loading state
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(filteredSteps[currentIndex - 1].id as StepId);
    }
  };

  // ─── Step Content Renders ─────────────────────────────────────────────────

  const renderAITips = (text: string) => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="hidden lg:flex items-start gap-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02] p-5 rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-200/20 dark:shadow-none max-w-sm mb-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-white/5">
        <i className="ti ti-sparkles text-lg animate-pulse" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI Assistant
        </p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
          {text}
        </motion.p>
      </div>
    </motion.div>
  );

  const renderProfileForm = () => (
    <PersonalInfoForm
      profileForm={profileForm}
      setProfileForm={setProfileForm}
      triggerAutoSave={triggerAutoSave}
      profileError={profileError}
      renderAITips={renderAITips}
    />
  );

  const renderDocumentsForm = () => (
    <DocumentsForm
      govId={govId} setGovId={setGovId}
      offerLetter={offerLetter} setOfferLetter={setOfferLetter}
      certificates={certificates} setCertificates={setCertificates}
      govIdRef={govIdRef} offerLetterRef={offerLetterRef} certRef={certRef}
      previewUrls={previewUrls} setPreviewUrls={setPreviewUrls}
      draggingMap={draggingMap} setDraggingMap={setDraggingMap}
      onError={(msg) => toast.error(msg)}
    />
  );

  const isIfscValid = bankForm.ifsc.length > 5;

  const renderBankForm = () => (
    <BankDetailsForm
      bankForm={bankForm}
      setBankForm={setBankForm}
      triggerAutoSave={triggerAutoSave}
      isIfscValid={isIfscValid}
      renderAITips={renderAITips}
    />
  );

  const renderHandbookForm = () => (
    <PoliciesForm
      handbookAgreed={handbookAgreed}
      setHandbookAgreed={setHandbookAgreed}
    />
  );

  const renderCompleteState = () => (
    <CompletionView onDashboardClick={() => navigate('/employee-dashboard')} />
  );

  const getStepBody = (step: OnboardingStep) => {
    switch (step.id) {
      case 'profile': return renderProfileForm();
      case 'documents': return renderDocumentsForm();
      case 'bank': return renderBankForm();
      case 'handbook': return renderHandbookForm();
      default: return null;
    }
  };

  const isContinueDisabled =
    (currentStepId === 'bank' && (!bankForm.account.trim() || !bankForm.ifsc.trim())) ||
    (currentStepId === 'handbook' && !handbookAgreed);

  return (
    <DashboardLayout title="Onboarding">
      <div className="mx-auto max-w-[1200px] pb-6 px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6 items-start mt-4 relative">

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
          {/* Top Horizontal Stepper */}
          {!isComplete && (
            <PremiumStepper
              steps={steps}
              currentStepId={currentStepId}
              onStepClick={(id: string) => setCurrentStep(id as StepId)}
            />
          )}

          {/* Main Content Card */}
          <div className={`relative rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/30 dark:shadow-none dark:border-white/10 dark:bg-[#0B1121] transition-all duration-500 z-10 ${isComplete ? 'p-8 sm:p-10' : 'p-5 sm:p-7'}`}>

            {/* Enterprise Help Button - Floating on top right corner */}
            {!isComplete && (
              <button
                onClick={() => setShowHelpPanel(true)}
                className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 z-30 hidden sm:flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 dark:bg-[#0f172a] dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95"
                title="Get Help"
              >
                <i className="ti ti-help-circle text-xl" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {renderCompleteState()}
                </motion.div>
              ) : (
                <motion.div key={currentStepId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                  <div className="min-h-[320px] flex flex-col justify-center mt-2">
                    {getStepBody(steps.find(s => s.id === currentStepId)!)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          {!isComplete && (
            <div className="mt-8 flex items-center justify-between w-full">
              {/* Back Button */}
              <button
                onClick={handleBack}
                disabled={currentIndex === 0 || isSubmitting}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${currentIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-slate-400 bg-slate-100/50 hover:bg-slate-200/50 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] active:scale-95'
                  }`}
              >
                <span className="text-base leading-none">&larr;</span> Back
              </button>

              {/* Step Indicators (Circular Dots) */}
              <div className="flex items-center gap-2.5">
                {filteredSteps.map((s) => (
                  <div
                    key={s.id}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${s.id === currentStepId
                      ? 'bg-blue-500'
                      : 'bg-slate-300 dark:bg-white/10'
                      }`}
                  />
                ))}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleNext}
                disabled={isContinueDisabled || isSubmitting}
                className={`flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white transition-all ${isContinueDisabled || isSubmitting
                  ? 'opacity-50 cursor-not-allowed bg-slate-400 dark:bg-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]'
                  }`}
              >
                {isSubmitting ? (
                  <><i className="ti ti-loader animate-spin text-lg" /> Processing...</>
                ) : (
                  <>Continue <span className="text-base leading-none">&rarr;</span></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Progress Sidebar */}
        {!isComplete && (
          <ProgressSidebar
            completionPercent={completionPercent}
            remainingSteps={filteredSteps.length - currentIndex}
            estimatedMinutesRemaining={(filteredSteps.length - currentIndex) * 3}
            saveStatus={saveStatus}
            employeeId="EMP-0142"
            profileStrength={profileStrength}
          />
        )}

      </div>

      <EnterpriseSupportPanel
        isOpen={showHelpPanel}
        onClose={() => setShowHelpPanel(false)}
        currentStepId={currentStepId}
      />
    </DashboardLayout>
  );
}
