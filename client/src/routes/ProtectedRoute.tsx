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
    if (!user.role || !allowedRoles.includes(user.role)) {
      const fallback = user.role === 'employee' ? '/employee-dashboard' : '/hr-dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  return <Outlet />;
}
