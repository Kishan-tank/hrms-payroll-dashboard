import { type ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FloatingAIAssistant from '../components/common/FloatingAIAssistant';
import { useAuthContext } from '../context/AuthContext';
import EmployeeDrawer from '../components/employees/EmployeeDrawer';
import { useEmployeeDrawer } from '../context/EmployeeDrawerContext';

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
  const { user } = useAuthContext();
  const { selectedEmployee, closeDrawer } = useEmployeeDrawer();

  const displayName = user?.name ?? userName ?? 'User';
  const normalizedRole = user?.role?.toLowerCase() || '';
  const displayRole = user
    ? ['hr-manager', 'hr manager', 'hr', 'manager'].includes(normalizedRole)
      ? 'HR Manager'
      : 'Employee'
    : (userRole ?? 'Employee');

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0B1121] dark:text-slate-50 relative overflow-hidden">
      {/* Ambient background blobs to give the glass something to refract */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-[120px]" />

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col pb-24 lg:pb-0 h-screen">
        <Navbar title={title} userName={displayName} userRole={displayRole} />
        <main className="glass m-4 flex flex-1 flex-col overflow-y-auto custom-scrollbar rounded-3xl p-5 sm:m-5">
          {children}
        </main>
        
        <FloatingAIAssistant />
        <EmployeeDrawer
          open={selectedEmployee !== null}
          employee={selectedEmployee}
          onClose={closeDrawer}
        />
      </div>
    </div>
  );
}
