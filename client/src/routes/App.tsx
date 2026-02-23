// src/routes/AppRoutes.tsx (version simplifiée)
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Pages d'authentification
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Pages principales
import Dashboard from '../pages/dashboard/Dashboard';
import MemberList from '../pages/members/MemberList';
import ContributionList from '../pages/contributions/ContributionList';
import DistrictList from '../pages/districts/DistrictList';
import TributeList from '../pages/tributes/TributeList';
import AdminList from '../pages/admin/AdminList';
import Profile from '../pages/admin/Profile';
import AdminManagement from '../pages/admin/AdminManagement';

// Pages rapports
import FinancialReport from '../pages/reports/FinancialReport';
import MemberReport from '../pages/reports/MemberReport';
import ExportData from '../pages/reports/ExportData';

// Pages d'erreur
import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';
import ServerError from '../pages/errors/ServerError';

// Guards
import ProtectedRoute from './ProtectedRoute';
import { applyThemeToDOM } from '../lib/helper/themeHelper';
import LoadingScreen from '../components/ui/LoadingScreen';

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const savedColor = localStorage.getItem('app-theme-color');
    applyThemeToDOM(savedColor || '#E51A1A');
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/server-error" element={<ServerError />} />

      {/* Routes protégées */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<MemberList />} />
          <Route path="/contributions" element={<ContributionList />} />
          <Route path="/districts" element={<DistrictList />} />
          <Route path="/tributes" element={<TributeList />} />
          <Route path="/admins" element={<AdminList />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Rapports */}
          <Route path="/reports/financial" element={<FinancialReport />} />
          <Route path="/reports/members" element={<MemberReport />} />
          <Route path="/reports/export" element={<ExportData />} />

          {/* Super Admin */}
          <Route element={<ProtectedRoute requiredRole="SUPERADMIN" />}>
            <Route path="/admin/management" element={<AdminManagement />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}