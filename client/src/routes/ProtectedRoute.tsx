import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  /** Roles allowed to access the nested routes. Omit to allow any logged-in user. */
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = String(user.role || '').toLowerCase();
    const isAllowed = allowedRoles.includes(userRole) || userRole === 'admin';
    if (!isAllowed) {
      const fallback =
        userRole === 'admin'
          ? '/admin/users'
          : userRole === 'employee'
          ? '/employee-dashboard'
          : '/hr-dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  return <Outlet />;
}
