import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

import Login from './views/Login';
import ForgotPassword from './views/ForgotPassword';
import Dashboard from './views/Dashboard';
import MemberManagement from './views/MemberManagement';
import ContributionManagement from './views/ContributionManagement';
import AdminManagement from './views/AdminManagment';
import Profile from './views/Profile';

import MainLayout from './components/layout/MainLayout';
import { applyThemeToDOM } from './lib/helper/helperTheme';
import { THEME } from './styles/theme';

export function App() {
    const { isAuthenticated, isSuperAdmin, loading } = useAuth();

    useEffect(() => {
        const savedColor = localStorage.getItem('app-theme-color');
        applyThemeToDOM(savedColor || '#E51A1A');
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className={`${THEME.card} p-8 flex flex-col items-center gap-4 shadow-xl`}>
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Chargement de Fizanakara...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {isAuthenticated ? (
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/members" element={<MemberManagement />} />
                    <Route path="/cotisations" element={<ContributionManagement />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {isSuperAdmin && (
                        <Route path="/management" element={<AdminManagement />} />
                    )}
                </Route>
            ) : (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}

            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
    );
}