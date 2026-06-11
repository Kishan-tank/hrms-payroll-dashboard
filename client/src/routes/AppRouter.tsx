import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import Home from '../pages/Home';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import HRDashboard from '../pages/HRDashboard';
import EmployeeManagement from '../pages/EmployeeManagement';
import AttendancePage from '../pages/AttendancePage';
import PayrollPage from '../pages/PayrollPage';
import LeavePage from '../pages/LeavePage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';
import DesignSystemPage from '../pages/DesignSystemPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        <Route path="/dashboard/hr" element={<HRDashboard />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
