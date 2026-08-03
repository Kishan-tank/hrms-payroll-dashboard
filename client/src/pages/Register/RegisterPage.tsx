import { Navigate } from 'react-router-dom';

/**
 * Public self-registration has been disabled in HRMSPro.
 * Automatically redirect any direct navigate attempts to /login.
 */
export default function RegisterPage() {
  return <Navigate to="/login" replace />;
}
