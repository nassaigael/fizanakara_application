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
import { applyThemeToDOM } from './lib/helper/themeHelper';

export function App() {
	const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();

	useEffect(() => {
		const savedColor = localStorage.getItem('app-theme-color');
		applyThemeToDOM(savedColor || '#E51A1A');
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white p-8 flex flex-col items-center gap-4 shadow-xl rounded-[2rem]">
					<div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
					<p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
						Chargement de Fizanakara...
					</p>
				</div>
			</div>
		);
	}

	return (
		<Routes>
			<Route
				path="/login"
				element={!isAuthenticated ? <Login /> : <Navigate to="/admin/dashboard" replace />}
			/>
			<Route path="/forgot-password" element={<ForgotPassword />} />

			{isAuthenticated ? (
				<Route element={<MainLayout />}>
					<Route index element={<Navigate to="/admin/dashboard" replace />} />
					<Route path="/admin/dashboard" element={<Dashboard />} />
					<Route path="/admin/members" element={<MemberManagement />} />
					<Route path="/admin/cotisations" element={<ContributionManagement />} />
					<Route path="/admin/profile" element={<Profile />} />

					{isSuperAdmin && (
						<Route path="/admin/management" element={<AdminManagement />} />
					)}
				</Route>
			) : (
				<Route path="*" element={<Navigate to="/login" replace />} />
			)}

			<Route path="*" element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />} />
		</Routes>
	);
}