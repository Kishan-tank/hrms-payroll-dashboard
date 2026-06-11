import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { User } from '../types';

interface RoleGuardProps {
  /** Roles that are allowed to see the wrapped content */
  allowedRoles: User['role'][];
  children: ReactNode;
  /** Where to redirect when access is denied (defaults to /dashboard) */
  redirectTo?: string;
}

/**
 * Wraps a route element and redirects unauthorized users.
 *
 * Usage:
 *   <RoleGuard allowedRoles={['hr', 'admin']}>
 *     <EmployeesPage />
 *   </RoleGuard>
 */
export default function RoleGuard({
  allowedRoles,
  children,
  redirectTo = '/dashboard',
}: RoleGuardProps) {
  const { user } = useAuthContext();

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" replace />;

  // Role not in the allowed list → redirect
  if (!allowedRoles.includes(user.role))
    return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
