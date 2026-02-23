import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Pages d'authentification
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Pages du dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Pages membres
import MemberList from '../pages/members/MemberList';
import MemberDetail from '../pages/members/MemberDetail';
import MemberCreate from '../pages/members/MemberCreate';
import MemberEdit from '../pages/members/MemberEdit';

// Pages cotisations
import ContributionList from '../pages/contributions/ContributionList';
import ContributionDetail from '../pages/contributions/ContributionDetail';
import ContributionEdit from '../pages/contributions/ContributionEdit';
import ContributionGenerate from '../pages/contributions/ContributionGenerate';
import ContributionPayments from '../pages/contributions/ContibutionPayments';

// Pages paiements
import PaymentList from '../pages/payments/PaymentList';

// Pages districts
import DistrictList from '../pages/districts/DistrictList';
import DistrictCreate from '../pages/districts/DistrictCreate';
import DistrictEdit from '../pages/districts/DistrictEdit';

// Pages tribus
import TributeList from '../pages/tributes/TributeList';
import TributeCreate from '../pages/tributes/TributeCreate';
import TributeEdit from '../pages/tributes/TributeEdit';

// Pages admin
import Profile from '../pages/admin/Profile';
import AdminList from '../pages/admin/AdminList';
import AdminCreate from '../pages/admin/AdminCreate';
import AdminEdit from '../pages/admin/AdminEdit';
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
  const { isLoading } = useAuth();

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

      {/* Routes protégées - Layout principal */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Membres */}
          <Route path="/members">
            <Route index element={<MemberList />} />
            <Route path="create" element={<MemberCreate />} />
            <Route path=":id" element={<MemberDetail />} />
            <Route path=":id/edit" element={<MemberEdit />} />
          </Route>

          {/* Cotisations */}
          <Route path="/contributions">
            <Route index element={<ContributionList />} />
            <Route path="generate" element={<ContributionGenerate />} />
            <Route path=":id" element={<ContributionDetail />} />
            <Route path=":id/edit" element={<ContributionEdit />} />
            <Route path=":id/payments" element={<ContributionPayments />} />
          </Route>

          {/* Paiements */}
          <Route path="/payments">
            <Route index element={<PaymentList />} />
          </Route>

          {/* Districts */}
          <Route path="/districts">
            <Route index element={<DistrictList />} />
            <Route path="create" element={<DistrictCreate />} />
            <Route path=":id/edit" element={<DistrictEdit />} />
          </Route>

          {/* Tribus */}
          <Route path="/tributes">
            <Route index element={<TributeList />} />
            <Route path="create" element={<TributeCreate />} />
            <Route path=":id/edit" element={<TributeEdit />} />
          </Route>

          {/* Admin */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/admins">
            <Route index element={<AdminList />} />
            <Route path="create" element={<AdminCreate />} />
            <Route path=":id/edit" element={<AdminEdit />} />
          </Route>

          {/* Rapports */}
          <Route path="/reports">
            <Route path="financial" element={<FinancialReport />} />
            <Route path="members" element={<MemberReport />} />
            <Route path="export" element={<ExportData />} />
          </Route>

          {/* Super Admin uniquement */}
          <Route element={<ProtectedRoute requiredRole="SUPERADMIN" />}>
            <Route path="/admin/management" element={<AdminManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}