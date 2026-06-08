import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import Home from '../pages/Home';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import HRDashboard from '../pages/HRDashboard';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Navigate to="/employee-dashboard" replace />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
