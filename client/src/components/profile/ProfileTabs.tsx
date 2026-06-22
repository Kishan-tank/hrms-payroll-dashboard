import React from 'react';
import type { ApiEmployee } from '../../services/hrmsApi';
import { Mail, Phone, Calendar, Briefcase, MapPin, Building, CreditCard, FileText, User, Users, Shield, Clock, Award } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

interface TabProps {
  employee: ApiEmployee;
}

// ─── Reusable Components ─────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <h3 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isPlaceholder = false }: { icon: React.ElementType, label: string, value: string | React.ReactNode, isPlaceholder?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 dark:bg-white/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        {isPlaceholder ? (
          <p className="mt-1 text-sm font-medium italic text-slate-400 dark:text-slate-500">{value}</p>
        ) : (
          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</div>
        )}
      </div>
    </div>
  );
}

// ─── 1. Overview Tab ────────────────────────────────────────────────────────

export function OverviewTab({ employee }: TabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <InfoCard title="About">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {employee.name} is an active member of the {employee.department} department.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email Address" value={employee.email} />
            <InfoRow icon={Phone} label="Phone Number" value={employee.phone || 'Not provided'} isPlaceholder={!employee.phone} />
            <InfoRow icon={Briefcase} label="Role" value={employee.role} />
            <InfoRow icon={Calendar} label="Join Date" value={new Date(employee.joinDate).toLocaleDateString()} />
          </div>
        </InfoCard>
      </div>
      <div className="space-y-6 lg:col-span-1">
        <InfoCard title="Quick Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status</span>
              <StatusBadge status={employee.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Employee ID</span>
              <span className="font-bold text-slate-900 dark:text-white">{employee.employeeId}</span>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

// ─── 2. Personal Tab ────────────────────────────────────────────────────────

export function PersonalTab({ employee }: TabProps) {
  return (
    <div className="space-y-6">
      <InfoCard title="Personal Details">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={User} label="Full Name" value={employee.name} />
          <InfoRow icon={Mail} label="Email" value={employee.email} />
          <InfoRow icon={Phone} label="Phone" value={employee.phone || 'Not provided'} isPlaceholder={!employee.phone} />
          <InfoRow icon={Calendar} label="Date of Birth" value="Not provided yet" isPlaceholder />
          <InfoRow icon={MapPin} label="Residential Address" value="Address pending update" isPlaceholder />
          <InfoRow icon={Users} label="Gender" value="Not provided" isPlaceholder />
        </div>
      </InfoCard>
      
      <InfoCard title="Emergency Contacts">
        <EmptyState
          icon={<Phone className="h-8 w-8 text-slate-400" />}
          title="No emergency contacts"
          description="Please update your emergency contact details via HR."
        />
      </InfoCard>
    </div>
  );
}

// ─── 3. Employment Tab ──────────────────────────────────────────────────────

export function EmploymentTab({ employee }: TabProps) {
  return (
    <div className="space-y-6">
      <InfoCard title="Employment Information">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={Shield} label="Employee ID" value={employee.employeeId} />
          <InfoRow icon={Building} label="Department" value={employee.department} />
          <InfoRow icon={Briefcase} label="Designation" value={employee.role} />
          <InfoRow icon={Calendar} label="Joining Date" value={new Date(employee.joinDate).toLocaleDateString()} />
          <InfoRow icon={Users} label="Reporting Manager" value="Not assigned yet" isPlaceholder />
          <InfoRow icon={Clock} label="Employment Type" value="Full-Time (Standard)" isPlaceholder />
        </div>
      </InfoCard>
    </div>
  );
}

// ─── 4. Payroll & Bank Tab ──────────────────────────────────────────────────

export function PayrollBankTab({ employee }: TabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InfoCard title="Payroll Configuration">
        <div className="space-y-6">
          <InfoRow icon={CreditCard} label="Basic Pay" value={`₹${employee.basicPay.toLocaleString()}`} />
          <InfoRow icon={FileText} label="Tax Regime" value="Not declared" isPlaceholder />
          <InfoRow icon={Shield} label="PF Number" value="Pending verification" isPlaceholder />
          <InfoRow icon={Shield} label="UAN" value="Pending verification" isPlaceholder />
        </div>
      </InfoCard>

      <InfoCard title="Bank Information">
        <EmptyState
          icon={<Building className="h-8 w-8 text-slate-400" />}
          title="Bank Details Unavailable"
          description="Your bank account details have not been verified yet."
        />
        <div className="mt-6 space-y-6 opacity-50 grayscale pointer-events-none">
          <InfoRow icon={CreditCard} label="Account Number" value="XXXX-XXXX-XXXX" isPlaceholder />
          <InfoRow icon={Building} label="Bank Name" value="Pending" isPlaceholder />
          <InfoRow icon={Shield} label="IFSC Code" value="Pending" isPlaceholder />
        </div>
      </InfoCard>
    </div>
  );
}

// ─── 5. Documents Tab ───────────────────────────────────────────────────────

export function DocumentsTab() {
  return (
    <InfoCard title="Employee Documents">
      <EmptyState
        icon={<FileText className="h-8 w-8 text-slate-400" />}
        title="No Documents Found"
        description="Your employment documents, ID proofs, and signed agreements will appear here once uploaded by HR."
      />
    </InfoCard>
  );
}

// ─── 6. Skills & Activity Tab ───────────────────────────────────────────────

export function SkillsActivityTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InfoCard title="Skills & Certifications">
        <EmptyState
          icon={<Award className="h-8 w-8 text-slate-400" />}
          title="No Skills Added"
          description="Your verified skills and certifications will be listed here."
        />
      </InfoCard>

      <InfoCard title="Recent Activity">
        <div className="relative border-l-2 border-slate-100 pl-6 dark:border-white/10 mt-4">
          <div className="mb-8 relative">
            <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Just Now</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Profile Viewed</h3>
            <p className="mt-1 text-xs text-slate-500">You accessed your employee profile.</p>
          </div>
          
          <div className="relative">
            <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 ring-4 ring-white dark:bg-white/20 dark:ring-slate-950" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">System Event</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Profile Created</h3>
            <p className="mt-1 text-xs text-slate-500">Your employee profile was initialized in HRMSPro.</p>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}
