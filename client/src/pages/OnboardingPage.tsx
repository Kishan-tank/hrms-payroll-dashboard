import { useState, useRef, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';
import { useOnboarding, type OnboardingStep } from '../hooks/useOnboarding';
import { useToast } from '../context/ToastContext';
import { onboardingService } from '../services/hrmsApi';

export default function OnboardingPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    steps,
    currentStepId,
    isComplete,
    completionPercent,
    completeStep,
    setCurrentStep,
  } = useOnboarding(user?.id || user?.email);

  // Profile Step State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    dob: '',
    gender: '',
    address: '',
  });
  const [profileError, setProfileError] = useState(false);

  // Documents Step State (just storing the fact a file was selected)
  const [govId, setGovId] = useState<File | null>(null);
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File | null>(null);

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

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleProfileSubmit = async () => {
    if (!profileForm.phone.trim() || !profileForm.address.trim()) {
      setProfileError(true);
      return;
    }
    setProfileError(false);
    try {
      await onboardingService.submitProfile(profileForm);
      completeStep('profile');
      toast.success('Profile details saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    }
  };

  const handleDocumentsSubmit = async () => {
    const formData = new FormData();
    if (govId) formData.append('govId', govId);
    if (offerLetter) formData.append('offerLetter', offerLetter);
    if (certificates) formData.append('certificates', certificates);

    if (govId || offerLetter || certificates) {
      try {
        await onboardingService.uploadDocuments(formData);
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload documents');
        return;
      }
    }
    
    completeStep('documents');
    toast.success('Documents marked as uploaded');
  };

  const handleBankSubmit = async () => {
    if (!bankForm.account.trim() || !bankForm.ifsc.trim()) {
      return;
    }
    try {
      await onboardingService.submitBank(bankForm);
      completeStep('bank');
      toast.success('Bank details saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bank details');
    }
  };

  const handleHandbookSubmit = () => {
    if (!handbookAgreed) return;
    completeStep('handbook');
    toast.success('Handbook acknowledged');
  };

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const getPercentageColorClass = () => {
    if (completionPercent < 25) return 'text-slate-400';
    if (completionPercent < 75) return 'text-blue-500';
    return 'text-emerald-500';
  };

  const getProgressBarColorClass = () => {
    if (completionPercent < 25) return 'bg-slate-400';
    if (completionPercent < 75) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  // ─── Step Content Renders ─────────────────────────────────────────────────

  const renderProfileForm = () => (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={profileForm.phone}
            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Date of Birth
          </label>
          <input
            type="date"
            value={profileForm.dob}
            onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Gender
          </label>
          <select
            value={profileForm.gender}
            onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          >
            <option value="">Select gender...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Residential Address
          </label>
          <input
            type="text"
            placeholder="123 MG Road, Bengaluru"
            value={profileForm.address}
            onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          />
        </div>
      </div>
      {profileError && (
        <p className="mt-3 text-xs text-red-500">Please fill in all required fields (Phone and Address).</p>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleProfileSubmit}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );

  const renderDropzone = (
    label: string,
    file: File | null,
    setFile: (f: File | null) => void,
    inputRef: RefObject<HTMLInputElement | null>
  ) => (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center transition-colors hover:border-blue-300 dark:border-white/10 dark:hover:border-blue-500/50"
    >
      <input
        type="file"
        hidden
        ref={inputRef}
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
          }
        }}
      />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <i className="ti ti-circle-check text-emerald-500" style={{ fontSize: 28 }} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{file.name}</span>
        </div>
      ) : (
        <>
          <i className="ti ti-cloud-upload text-slate-300 dark:text-slate-600" style={{ fontSize: 28 }} />
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">PDF, JPG, PNG up to 10MB</p>
        </>
      )}
    </div>
  );

  const renderDocumentsForm = () => (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="grid gap-4 sm:grid-cols-3">
        {renderDropzone('Government ID', govId, setGovId, govIdRef)}
        {renderDropzone('Signed Offer Letter', offerLetter, setOfferLetter, offerLetterRef)}
        {renderDropzone('Educational Certificates', certificates, setCertificates, certRef)}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleDocumentsSubmit}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Mark as Uploaded & Continue
        </button>
      </div>
    </div>
  );

  const renderBankForm = () => (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Account Number
          </label>
          <input
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
            value={bankForm.account}
            onChange={e => setBankForm({ ...bankForm, account: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            IFSC Code
          </label>
          <input
            type="text"
            placeholder="SBIN0001234"
            maxLength={11}
            value={bankForm.ifsc}
            onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Bank Name
          </label>
          <input
            type="text"
            placeholder="State Bank of India"
            value={bankForm.bankName}
            onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end max-w-lg mx-auto">
        <button
          onClick={handleBankSubmit}
          disabled={!bankForm.account.trim() || !bankForm.ifsc.trim()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Bank Details & Continue
        </button>
      </div>
    </div>
  );

  const renderHandbookForm = () => (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-inner dark:border-white/10 dark:bg-[#0B1121] space-y-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Leave Policy</h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Employees are entitled to 18 days of paid leave annually. Additional sick leave of 6 days is available with medical documentation.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Code of Conduct</h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            All employees are expected to maintain professional conduct and treat colleagues with respect. Violations may result in disciplinary action.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Working Hours</h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Standard working hours are 9 AM to 6 PM IST, Monday to Friday. Flexible arrangements require manager approval.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Data Privacy</h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Employee data is handled in accordance with applicable privacy laws. Confidential information must not be shared externally.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          type="checkbox"
          id="handbook-agree"
          checked={handbookAgreed}
          onChange={e => setHandbookAgreed(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="handbook-agree" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          I have read and understood the Employee Handbook
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleHandbookSubmit}
          disabled={!handbookAgreed}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I Agree & Continue
        </button>
      </div>
    </div>
  );

  const renderCompleteState = () => (
    <div className="mt-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
      <div className="text-[48px] leading-none mb-4">🎉</div>
      <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Onboarding complete!</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
        You&apos;re all set. Your profile has been submitted for HR review. You&apos;ll receive a confirmation email within 24 hours.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/employee-dashboard')}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-5 py-2.5 text-sm font-bold"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300 px-5 py-2.5 text-sm font-bold"
        >
          View your profile
        </button>
      </div>
    </div>
  );

  const getStepBody = (step: OnboardingStep) => {
    switch (step.id) {
      case 'profile': return renderProfileForm();
      case 'documents': return renderDocumentsForm();
      case 'bank': return renderBankForm();
      case 'handbook': return renderHandbookForm();
      case 'complete': return renderCompleteState();
      default: return null;
    }
  };

  const getTimeRelative = (isoString?: string) => {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <DashboardLayout title="Onboarding">
      <div className="mx-auto max-w-3xl space-y-6 pb-24 px-4 sm:px-0">

        {/* SECTION A — Progress Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                Welcome aboard, {user?.name?.split(' ')[0] || 'User'}! 
                <Sparkles className="h-6 w-6 text-amber-500 animate-[pulse_2s_ease-in-out_infinite]" strokeWidth={2.5} />
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Complete these steps to finish your onboarding.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={`text-3xl font-extrabold transition-colors duration-700 ${getPercentageColorClass()}`}>
                {completionPercent}%
              </span>
            </div>
          </div>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColorClass()}`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* SECTION C — Completion State Banner */}
        {isComplete && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-lg font-bold">🎉 Onboarding Complete!</h2>
              <p className="text-sm opacity-90 mt-1">
                Welcome to HRMSPro. Your HR team has been notified.
              </p>
            </div>
            <button
              onClick={() => navigate('/employee-dashboard')}
              className="rounded-xl bg-white px-4 py-2 font-bold text-emerald-600 transition-colors hover:bg-emerald-50 shrink-0 shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* SECTION B — Step List */}
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            const isPending = step.status === 'pending';
            const isCurrent = step.id === currentStepId;
            const isCompleteStep = step.id === 'complete';

            // Determine border and bg colors based on status
            let cardClasses = 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1121]';
            if (isCompleted) {
              if (isCompleteStep) {
                cardClasses = 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-500/50 dark:from-emerald-500/10 dark:to-teal-500/10';
              } else {
                cardClasses = 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5';
              }
            } else if (isInProgress) {
              cardClasses = 'border-blue-200 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5';
            }

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (!isCompleted && !isPending && !isCurrent) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`rounded-2xl border p-5 transition-all duration-300 ${cardClasses} ${(!isCompleted && !isPending && !isCurrent) ? 'cursor-pointer hover:border-blue-300' : ''}`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Status Circle */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      {isCompleted ? (
                        <i className="ti ti-circle-check-filled text-emerald-500" style={{ fontSize: 24 }} />
                      ) : isInProgress ? (
                        <i className="ti ti-circle-dot text-blue-500 animate-pulse" style={{ fontSize: 24 }} />
                      ) : (
                        <i className="ti ti-circle text-slate-300 dark:text-slate-600" style={{ fontSize: 24 }} />
                      )}
                    </div>
                    {/* Title & Badge */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                        <i className={`ti ti-${step.icon} text-slate-600 dark:text-slate-300`} style={{ fontSize: 16 }} />
                      </div>
                      <div>
                        <h3 className={`font-bold ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                          {step.title}
                        </h3>
                        {!isCompleteStep && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] sm:max-w-none truncate sm:whitespace-normal">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side Badge */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          Completed
                        </span>
                        {step.completedAt && (
                          <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                            {getTimeRelative(step.completedAt)}
                          </span>
                        )}
                      </div>
                    ) : isInProgress ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        In progress
                      </span>
                    ) : (
                      !isCompleteStep && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                          Step {index + 1}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Expandable Body */}
                {(isCurrent && !isCompleted && (!isCompleteStep || isComplete)) && (
                  <div className="overflow-hidden">
                    {getStepBody(step)}
                  </div>
                )}
                {/* Always show Complete celebration state if it is complete step and completed */}
                {isCompleteStep && isCompleted && (
                  <div className="overflow-hidden">
                    {getStepBody(step)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
