import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applyThemeToDOM } from '../lib/helper';
import { UserRole } from '../lib/types';

import MainLayout from '../components/layout/MainLayout';
import LoadingScreen from '../components/ui/LoadingScreen';
import { ProtectedRoute } from './ProtectedRoute';

const Login = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Unauthorized = lazy(() => import('../pages/common/Unauthorized'));
const NotFound = lazy(() => import('../pages/common/NotFound'));

const SuperAdminDashboard = lazy(() => import('../pages/superadmin/Dashboard'));
const SuperAdminManagement = lazy(() => import('../pages/superadmin/Management'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminMembers = lazy(() => import('../pages/admin/Members'));
const AdminFinance = lazy(() => import('../pages/admin/Finance'));
const PaymentHistory = lazy(() => import('../pages/admin/PaymentHistory'));
const Profile = lazy(() => import('../pages/common/Profile'));

export function App() {
    const { isAuthenticated, isSuperAdmin } = useAuth();

    useEffect(() => {
        const savedColor = localStorage.getItem('app-theme-color');
        applyThemeToDOM(savedColor || '#E51A1A');
    }, []);

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                <Route
                    path="/login"
                    element={
                        !isAuthenticated ?
                            <Login /> :
                            <Navigate to={isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard"} replace />
                    }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route element={<MainLayout />}>
                    <Route element={<ProtectedRoute requiredRole={UserRole.SUPERADMIN} />}>
                        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                        <Route path="/superadmin/management" element={<SuperAdminManagement />} />
                        <Route path="/superadmin/profile" element={<Profile />} />
                        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
                    </Route>

                    <Route element={<ProtectedRoute requiredRole={UserRole.ADMIN} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/members" element={<AdminMembers />} />
                        <Route path="/admin/finance" element={<AdminFinance />} />
                        <Route path="/admin/payment-history" element={<PaymentHistory />} />
                        <Route path="/admin/profile" element={<Profile />} />
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>

                    <Route
                        path="/"
                        element={<Navigate to={isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard"} replace />}
                    />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}