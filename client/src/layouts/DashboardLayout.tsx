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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#020817] dark:text-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        <Navbar title={title} userName={displayName} userRole={displayRole} />
        <main className="flex-1 px-4 py-5 sm:px-5">
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
