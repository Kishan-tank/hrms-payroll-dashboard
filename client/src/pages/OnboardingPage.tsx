import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';
import { useOnboarding, type OnboardingStep, type StepId } from '../hooks/useOnboarding';
import { useToast } from '../context/ToastContext';
import WelcomeHero from '../components/onboarding/WelcomeHero';
import ProgressSidebar from '../components/onboarding/ProgressSidebar';
import PremiumStepper from '../components/onboarding/PremiumStepper';
import PersonalInfoForm from '../components/onboarding/forms/PersonalInfoForm';
import DocumentsForm from '../components/onboarding/forms/DocumentsForm';
import BankDetailsForm from '../components/onboarding/forms/BankDetailsForm';
import PoliciesForm from '../components/onboarding/forms/PoliciesForm';
import CompletionView from '../components/onboarding/CompletionView';
import { motion, AnimatePresence } from 'framer-motion';

const stepShortNames: Record<string, string> = {
  profile: 'Personal Info',
  documents: 'Documents',
  bank: 'Bank Details',
  handbook: 'Company Policies',
};

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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex items-start gap-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-inner max-w-sm mb-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
        <i className="ti ti-sparkles text-sm" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">AI Assistant Tip</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{text}</p>
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
      <div className="mx-auto max-w-[1200px] pb-32 px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-10 items-start mt-8 relative">

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-10">
          {!isComplete && (
            <WelcomeHero
              userName={user?.name || ''}
              department="Engineering"
              role="Software Engineer"
              joinDate={new Date().toISOString()} // Mock join date for now
              completionPercent={completionPercent}
              estimatedMinutesRemaining={(filteredSteps.length - currentIndex) * 3}
              avatarUrl={undefined}
            />
          )}

          {/* Top Horizontal Stepper */}
          {!isComplete && (
            <PremiumStepper
              steps={steps}
              currentStepId={currentStepId}
              onStepClick={(id: string) => setCurrentStep(id as StepId)}
            />
          )}

          {/* Main Content Card */}
          <div className={`relative rounded-[2.5rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/40 dark:shadow-none dark:border-white/10 dark:bg-[#0B1121] transition-all duration-500 z-10 ${isComplete ? 'p-12 sm:p-16' : 'p-8 sm:p-12'
            }`}>
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {renderCompleteState()}
                </motion.div>
              ) : (
                <motion.div key={currentStepId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                  <div className="mb-12 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-black text-sm dark:bg-blue-500/20 dark:text-blue-400 border border-blue-100 dark:border-blue-500/30 shadow-sm">
                          {currentIndex + 1}
                        </span>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Step {currentIndex + 1} of {filteredSteps.length}
                        </p>
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        {stepShortNames[currentStepId]}
                        {saveStatus === 'saving' && <i className="ti ti-loader animate-spin text-slate-300 text-2xl" />}
                      </h2>
                    </div>

                    {/* Enterprise Help Button */}
                    <button onClick={() => setShowHelpPanel(!showHelpPanel)} className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white relative">
                      <i className="ti ti-help-circle text-2xl" />
                      {showHelpPanel && (
                        <div className="absolute top-16 right-0 w-80 p-5 bg-slate-900 text-white rounded-3xl shadow-2xl z-50 text-left border border-slate-700">
                          <h4 className="font-black text-lg mb-2">Need help?</h4>
                          <p className="text-sm text-slate-400 font-semibold mb-4 leading-relaxed">Reach out to your HR representative for assistance with {stepShortNames[currentStepId].toLowerCase()}.</p>
                          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <i className="ti ti-user text-lg" />
                            </div>
                            <div>
                              <p className="text-xs font-black">Sarah Jenkins</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">HR Partner</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="min-h-[350px]">
                    {getStepBody(steps.find(s => s.id === currentStepId)!)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          {!isComplete && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 px-4">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0 || isSubmitting}
                className={`flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition-all ${currentIndex === 0
                    ? 'text-transparent cursor-default pointer-events-none'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white active:scale-95'
                  }`}
              >
                <i className="ti ti-arrow-left text-lg" /> Back
              </button>

              <div className="flex gap-4">
                {filteredSteps.map((s) => (
                  <div
                    key={s.id}
                    className={`h-2 rounded-full transition-all duration-500 ${s.status === 'completed' ? 'bg-emerald-500 w-8 shadow-sm shadow-emerald-500/50' :
                        s.id === currentStepId ? 'bg-blue-600 w-12 shadow-sm shadow-blue-500/50' :
                          'bg-slate-200 dark:bg-white/10 w-4'
                      }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isContinueDisabled || isSubmitting}
                className={`group relative flex items-center justify-center gap-3 rounded-2xl px-10 py-4 text-sm font-black text-white transition-all overflow-hidden shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${currentIndex === filteredSteps.length - 1
                    ? 'bg-emerald-500 hover:shadow-emerald-500/40 hover:-translate-y-1'
                    : 'bg-slate-900 hover:shadow-slate-900/30 hover:-translate-y-1 dark:bg-blue-600 dark:hover:bg-blue-500 dark:hover:shadow-blue-500/30'
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <><i className="ti ti-loader animate-spin text-lg" /> Processing...</>
                  ) : currentIndex === filteredSteps.length - 1 ? (
                    <>Complete Onboarding <i className="ti ti-confetti text-lg" /></>
                  ) : (
                    <>Continue <i className="ti ti-arrow-right text-lg group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
                {!isContinueDisabled && !isSubmitting && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                )}
              </button>
            </div>
          )}
          {!isComplete && (
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 md:hidden">Tip: You can use Cmd/Ctrl + Enter to continue</p>
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
    </DashboardLayout>
  );
}
