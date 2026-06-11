import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuthContext } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  /** Fallback name shown if no authenticated user is found */
  userName?: string;
  /** Fallback role label shown if no authenticated user is found */
  userRole?: string;
}

export default function DashboardLayout({
  children,
  title,
  userName,
  userRole,
}: DashboardLayoutProps) {
  const { user } = useAuthContext();

  // Prefer values from the auth context; fall back to props for pages that
  // pass them explicitly (backwards-compatible).
  const displayName = user?.name ?? userName ?? 'User';
  const displayRole =
    user
      ? user.role === 'hr' || user.role === 'admin' || user.role === 'manager'
        ? 'HR Manager'
        : 'Employee'
      : (userRole ?? 'Employee');

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
        <Navbar title={title} userName={displayName} userRole={displayRole} />
        <main className="px-4 py-6 sm:px-6">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
