/**
 * Global employee quick-view drawer.
 * Usage: const { openDrawer } = useEmployeeDrawer();
 *        openDrawer(employee) — opens drawer from any component.
 * Provider: mounted in AppRouter.tsx wrapping all authenticated routes.
 * Renderer: DashboardLayout.tsx renders <EmployeeDrawer> driven by this context.
 */

import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ApiEmployee } from '../services/hrmsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeDrawerContextValue {
  selectedEmployee: ApiEmployee | null;
  openDrawer: (employee: ApiEmployee) => void;
  closeDrawer: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const EmployeeDrawerContext = createContext<EmployeeDrawerContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EmployeeDrawerProvider({ children }: { children: ReactNode }) {
  const [selectedEmployee, setSelectedEmployee] = useState<ApiEmployee | null>(null);

  const openDrawer = useCallback((employee: ApiEmployee) => {
    setSelectedEmployee(employee);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedEmployee(null);
  }, []);

  return (
    <EmployeeDrawerContext.Provider value={{ selectedEmployee, openDrawer, closeDrawer }}>
      {children}
    </EmployeeDrawerContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEmployeeDrawer(): EmployeeDrawerContextValue {
  const ctx = useContext(EmployeeDrawerContext);
  if (!ctx) {
    throw new Error('useEmployeeDrawer must be used within EmployeeDrawerProvider');
  }
  return ctx;
}
