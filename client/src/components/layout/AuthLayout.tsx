import { Link } from 'react-router-dom';
import type React from 'react';
import GradientBackground from '../GradientBackground';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  mode?: 'login' | 'register';
}

const loginStats = [
  { value: '256', label: 'Active Employees' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: 'Rs. 48.2L', label: 'Payroll Processed' },
  { value: '40%', label: 'Time Saved' },
];

const registerPerks = [
  'Free 14-day trial, no credit card needed',
  'Unlimited employee profiles during trial',
  'Full payroll automation access',
  'Dedicated onboarding support',
];

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  mode = 'login',
}: AuthLayoutProps) {
  const isRegister = mode === 'register';

  return (
    <GradientBackground className="flex">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_35%)]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              H
            </span>
            <span className="text-lg font-bold">HRMSPro</span>
          </Link>
        </div>

        <div className="relative max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-blue-100">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            {isRegister ? 'Guided Company Setup' : 'Enterprise-Grade Security'}
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            {isRegister ? 'Start Managing Your Workforce Smarter' : 'Manage Your Workforce with Confidence'}
          </h1>
          <p className="leading-7 text-slate-300">
            {isRegister
              ? 'Join leading enterprises using HRMSPro to automate HR, payroll, and compliance from one clean workspace.'
              : 'Access your enterprise HR dashboard, payroll automation, and employee insights from one secure platform.'}
          </p>

          {isRegister ? (
            <div className="space-y-3">
              {registerPerks.map((perk) => (
                <div key={perk} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                    OK
                  </span>
                  <span className="text-sm font-medium text-slate-200">{perk}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2">
              {loginStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="relative text-sm text-slate-400">(c) 2026 HRMSPro - Enterprise Suite</p>
      </aside>

      <section className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-xl shadow-blue-100/60 backdrop-blur">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                H
              </span>
              <span className="text-lg font-bold text-slate-950">HRMSPro</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-slate-500">
            {footerText}{' '}
            <Link to={footerLinkTo} className="font-bold text-blue-600 transition-colors hover:text-blue-700">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </section>
    </GradientBackground>
  );
}
