import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  /** Roles allowed to access the nested routes. Omit to allow any logged-in user. */
  allowedRoles?: string[];
}

/**
 * Layout-style route guard that uses <Outlet /> to render child routes.
 *
 * Usage in AppRouter:
 *   <Route element={<ProtectedRoute allowedRoles={['hr', 'admin']} />}>
 *     <Route path="/employees" element={<EmployeeManagement />} />
 *   </Route>
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // 1. Check if user is logged in
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr) as { role?: string };

    // 2. If specific roles are required, verify the user has one
    if (allowedRoles && allowedRoles.length > 0) {
      if (!user.role || !allowedRoles.includes(user.role)) {
        // Wrong role → redirect to the correct dashboard
        const fallback =
          user.role === 'employee' ? '/employee-dashboard' : '/hr-dashboard';
        return <Navigate to={fallback} replace />;
      }
    }

    // 3. Authorised — render the child route
    return <Outlet />;
  } catch {
    // Corrupt data → force re-login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
}
