import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Legacy reset links redirect to the new 3-step OTP forgot-password flow
    navigate('/forgot-password', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020817] p-4 text-slate-300">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-sm font-semibold">Redirecting to password reset flow...</span>
      </div>
    </div>
  );
}