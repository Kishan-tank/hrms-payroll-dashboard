import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import Home from '../pages/Home';
import DesignSystemPage from '../pages/DesignSystemPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import HRDashboard from '../pages/HRDashboard';
import EmployeeManagement from '../pages/EmployeeManagement';
import AttendancePage from '../pages/AttendancePage';
import PayrollPage from '../pages/PayrollPage';
import LeavePage from '../pages/LeavePage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider lives INSIDE BrowserRouter so useNavigate() works.
        ProtectedRoute reads localStorage directly so it needs no context.
      */}
      <AuthProvider>
        <Routes>
          {/* ── Public routes – no login required ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />

          {/* ── Any logged-in user ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/payroll" element={<PayrollPage />} />
          </Route>

          {/* ── Employee-only routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          </Route>

          {/* ── HR / Admin / Manager-only routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['hr-manager']} />}>
            <Route path="/hr-dashboard" element={<HRDashboard />} />
            <Route path="/dashboard/hr" element={<HRDashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
