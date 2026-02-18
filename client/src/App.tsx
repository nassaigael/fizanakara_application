// App.tsx (modifié)
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

import Login from './views/Login';
import ForgotPassword from './views/ForgotPassword';
import Dashboard from './views/Dashboard';
import MemberManagement from './views/MemberManagement';
import MemberDetail from './views/MemberDetail';
import ContributionManagement from './views/ContributionManagement';
import AdminManagement from './views/AdminManagment';
import Profile from './views/Profile';

import MainLayout from './components/layout/MainLayout';
import { applyThemeToDOM } from './lib/helper/themeHelper';
import LoadingScreen from './components/ui/LoadingScreen';

export function App() {
	const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();

	useEffect(() => {
		const savedColor = localStorage.getItem('app-theme-color');
		(isAuthenticated && savedColor) 
			? applyThemeToDOM(savedColor) 
			: applyThemeToDOM(savedColor || '#E51A1A');
	}, [isAuthenticated]);

	if (isLoading) {
		return <LoadingScreen />;
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
					<Route path="/admin/members/:id" element={<MemberDetail />} />
					<Route path="/admin/cotisations" element={<ContributionManagement />} />
					<Route path="/admin/profile" element={<Profile />} />

					{isSuperAdmin && (
						<Route path="/superadmin/management" element={<AdminManagement />} />
					)}

					<Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
				</Route>
			) : (
				<Route path="*" element={<Navigate to="/login" replace />} />
			)}

			<Route path="*" element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />} />
		</Routes>
	);
}