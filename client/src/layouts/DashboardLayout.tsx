import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName?: string;
  userRole?: string;
}

export default function DashboardLayout({
  children,
  title,
  userName,
  userRole,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
        <Navbar title={title} userName={userName} userRole={userRole} />
        <main className="px-4 py-6 sm:px-6">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
