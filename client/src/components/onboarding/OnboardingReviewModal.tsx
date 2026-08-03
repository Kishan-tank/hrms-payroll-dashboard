import { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Download, ShieldCheck, User, Building2, CreditCard } from 'lucide-react';
import { onboardingService, type ApiOnboarding } from '../../services/hrmsApi';

interface OnboardingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onboarding: ApiOnboarding | null;
  onReviewSubmit: () => void;
}

export default function OnboardingReviewModal({
  isOpen,
  onClose,
  onboarding,
  onReviewSubmit
}: OnboardingReviewModalProps) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !onboarding) return null;

  const emp: any = (typeof onboarding.employeeId === 'object' && onboarding.employeeId) ? onboarding.employeeId : {};
  const user: any = (typeof onboarding.userId === 'object' && onboarding.userId) ? onboarding.userId : {};
  const empName = emp.name || user.name || 'Employee';
  const empEmail = emp.email || user.email || 'N/A';
  const empDept = emp.department || 'General';

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const token = localStorage.getItem('token') || '';

  const handleReviewAction = async (action: 'Approve' | 'Reject') => {
    try {
      setSubmitting(true);
      setError(null);
      await onboardingService.reviewOnboarding(onboarding._id, action, notes);
      onReviewSubmit();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${action.toLowerCase()} onboarding`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0B1121] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Onboarding Review</h2>
              <p className="text-xs text-slate-500">{empName} ({empDept}) • {empEmail}</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          {/* Section 1: Personal Info */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 font-medium">Phone</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Date of Birth</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {emp.dob ? new Date(emp.dob).toLocaleDateString('en-IN') : 'Not provided'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Gender</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Role</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp.role || 'Employee'}</span>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <span className="block text-slate-500 font-medium">Address</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Uploaded Documents */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-purple-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Submitted Documents</h3>
            </div>

            {(!emp.documents || emp.documents.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No onboarding documents attached</p>
            ) : (
              <div className="space-y-2">
                {emp.documents.map((doc: any, i: number) => {
                  const downloadUrl = doc.url ? (doc.url.startsWith('http') ? doc.url : `${backendUrl}${doc.url}?token=${token}`) : '#';
                  return (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200/60 shadow-sm dark:bg-[#111827] dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">{doc.name}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{doc.type}</span>
                        </div>
                      </div>
                      <a
                        href={downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Bank Details */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Payroll & Bank Details (Encrypted)</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 font-medium">Bank Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp.bankName || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">IFSC Code</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp.ifscCode || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Account Number</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {emp.maskedBankAccount || (emp.bankAccount ? '•••• •••• ' + emp.bankAccount.slice(-4) : 'Not provided')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Policy Acknowledgment */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Policy & Code of Conduct</h3>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Handbook Status: {onboarding.policyAccepted ? (
                <span className="text-emerald-600 font-extrabold">Accepted on {new Date(onboarding.policyAcceptedAt || Date.now()).toLocaleDateString('en-IN')}</span>
              ) : (
                <span className="text-amber-600 font-bold">Pending Agreement</span>
              )}
            </p>
          </div>

          {/* Section 5: Review Notes */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Reviewer Notes / Feedback</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add feedback for the employee or internal HR verification notes..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-xs font-semibold text-slate-500">
            Current Status: <strong className="text-slate-900 dark:text-white">{onboarding.reviewStatus || 'Pending Review'}</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleReviewAction('Reject')}
              className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Reject & Request Revisions
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleReviewAction('Approve')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" /> Approve & Activate Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
