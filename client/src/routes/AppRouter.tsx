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
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage'));
const HelpCenterPage = lazy(() => import('../pages/HelpCenterPage'));
<<<<<<< HEAD
const CompanyHubPage = lazy(() => import('../pages/CompanyHubPage'));

=======
const PerformancePage = lazy(() => import('../pages/PerformancePage')); // <-- ADD THIS
const CompanyHubPage = lazy(() => import('../pages/CompanyHubPage')); // <-- ADD THIS
>>>>>>> origin/main
export default function AppRouter() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider lives INSIDE BrowserRouter so useNavigate() works.
        ProtectedRoute reads localStorage directly so it needs no context.
        EmployeeDrawerProvider wraps all authenticated routes so any page
        can call useEmployeeDrawer() to open the global employee drawer.
      */}
      <AuthProvider>
        <EmployeeDrawerProvider>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public routes – no login required ── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* /design-system is a dev-only tool — unreachable in production builds */}
                {import.meta.env.DEV && (
                  <Route path="/design-system" element={<DesignSystemPage />} />
                )}

<<<<<<< HEAD
                {/* ── Authenticated routes — wrapped with EmployeeDrawerProvider ── */}
                <Route element={<ProtectedRoute />}>
                  {/* Any logged-in user */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/attendance" element={<AttendancePage />} />
                  <Route path="/leave" element={<LeavePage />} />
                  <Route path="/payroll" element={<PayrollPage />} />
                  <Route path="/company-hub" element={<CompanyHubPage />} />
                </Route>
=======
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
>>>>>>> origin/main

                {/* ── Employee-only routes ── */}
                <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
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

                {/* ── Catch-all: proper 404 instead of silent redirect ── */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </EmployeeDrawerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
