import { Link } from 'react-router-dom';
import type React from 'react';

interface AuthLayoutProps { children: React.ReactNode; title: string; subtitle: string; footerText: string; footerLinkText: string; footerLinkTo: string; }

export default function AuthLayout({ children, title, subtitle, footerText, footerLinkText, footerLinkTo }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full opacity-40 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <svg className="w-8 h-8 text-white shrink-0" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full">{children}</div>
        <p className="text-center text-sm text-gray-500 mt-6">
          {footerText}{' '}
          <Link to={footerLinkTo} className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">{footerLinkText}</Link>
        </p>
      </div>
    </div>
  );
}
