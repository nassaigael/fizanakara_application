import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { LoginRequestDTO, AdminResponseDto } from '../lib/types/models/admin.type';
import toast from 'react-hot-toast';

interface AuthContextType {
	user: AdminResponseDto | null;
	isAuthenticated: boolean;
	isSuperAdmin: boolean;
	isAdmin: boolean;
	loading: boolean;
	login: (credentials: LoginRequestDTO) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const navigate = useNavigate();
	const [user, setUser] = useState<AdminResponseDto | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshUser = useCallback(async () => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			setLoading(false);
			return;
		}

		try {
			const userData = await AuthService.getMe();
			setUser(userData);
			localStorage.setItem('userData', JSON.stringify(userData));
			localStorage.setItem('userRole', userData.role);
		} catch (error) {
			console.error("Session expirée ou invalide");
			logout();
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshUser();
	}, [refreshUser]);

	const login = async (credentials: LoginRequestDTO) => {
		try {
			const data = await AuthService.login(credentials);
			localStorage.setItem('accessToken', data.token);
			localStorage.setItem('userData', JSON.stringify(data.admin));
			localStorage.setItem('userRole', data.admin.role);

			setUser(data.admin);
			toast.success(`Bienvenue, ${data.admin.firstName} !`);
			navigate('/admin/dashboard');
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Identifiants invalides");
			throw error;
		}
	};

	const logout = () => {
		localStorage.clear();
		setUser(null);
		navigate('/login');
		toast.success("Déconnexion réussie");
	};

	const value = {
		user,
		isAuthenticated: !!user,
		isSuperAdmin: user?.role === 'SUPERADMIN',
		isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
		loading,
		login,
		logout,
		refreshUser
	};

	if (loading) return (
		<div className="h-screen w-full flex items-center justify-center bg-brand-bg">
			<div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary"></div>
		</div>
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
	return context;
};