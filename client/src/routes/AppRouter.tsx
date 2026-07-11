import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { EmployeeDrawerProvider } from '../context/EmployeeDrawerContext';
import ProtectedRoute from './ProtectedRoute';
import PageLoader from '../components/common/PageLoader';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Eagerly loaded (critical path)
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import ForgotPasswordPage from '../pages/Login/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Login/ResetPasswordPage';
import Home from '../pages/Home';
import NotFoundPage from '../pages/NotFoundPage';

// Lazy loaded (heavy pages)
const DesignSystemPage = lazy(() => import('../pages/DesignSystemPage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const EmployeeDashboard = lazy(() => import('../pages/EmployeeDashboard'));
const HRDashboard = lazy(() => import('../pages/HRDashboard'));
const EmployeeManagement = lazy(() => import('../pages/EmployeeManagement'));
const AttendancePage = lazy(() => import('../pages/AttendancePage'));
const PayrollPage = lazy(() => import('../pages/PayrollPage'));
const LeavePage = lazy(() => import('../pages/LeavePage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage'));
const HelpCenterPage = lazy(() => import('../pages/HelpCenterPage'));
const PerformancePage = lazy(() => import('../pages/PerformancePage')); // <-- ADD THIS
const CompanyHubPage = lazy(() => import('../pages/CompanyHubPage')); // <-- ADD THIS
const TasksPage = lazy(() => import('../pages/TasksPage'));
export default function AppRouter() {
  return (
    <BrowserRouter>
      {/*
        ErrorBoundary is outside AuthProvider intentionally.
        This ensures its fallback UI never renders components that
        call useAuthContext(), which would cause a secondary crash.

        AuthProvider lives INSIDE BrowserRouter so useNavigate() works.
        EmployeeDrawerProvider wraps all authenticated routes so any page
        can call useEmployeeDrawer() to open the global employee drawer.
      */}
      <ErrorBoundary>
        <AuthProvider>
          <EmployeeDrawerProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public routes – no login required ── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                {/* /design-system is a dev-only tool — unreachable in production builds */}
                {import.meta.env.DEV && (
                  <Route path="/design-system" element={<DesignSystemPage />} />
                )}

            {/* ── Any logged-in user ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leave" element={<LeavePage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              
              <Route path="/company-hub" element={<CompanyHubPage />} /> {/* <-- ADD THIS */}
              <Route path="/performance" element={<PerformancePage />} /> {/* <-- ADD THIS */}
            </Route>

                {/* ── Employee-only routes ── */}
                <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/dashboard" element={<EmployeeDashboard />} />
                  <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
                  <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                </Route>

                {/* ── HR / Admin / Manager-only routes ── */}
                <Route element={<ProtectedRoute allowedRoles={['hr-manager']} />}>
                  <Route path="/hr-dashboard" element={<HRDashboard />} />
                  <Route path="/dashboard/hr" element={<HRDashboard />} />
                  <Route path="/employees" element={<EmployeeManagement />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>

                {/* ── Catch-all: proper 404 instead of silent redirect ── */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
          </EmployeeDrawerProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
