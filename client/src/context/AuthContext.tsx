import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import {
    LoginRequest,
    AdminResponse,
    UpdateAdminRequest,
    LoginResponse,
    UserRole,
} from '../lib/types';
import { getErrorMessage } from '../lib/helper';
import api from '../services/api/axios.config';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: AdminResponse | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginRequest) => Promise<LoginResponse | undefined>;
    logout: () => void;
    updateProfile: (data: UpdateAdminRequest) => Promise<any>;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    hasRole: (role: UserRole) => boolean;
    resetPassword: (token: string, password: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        const cachedUser = localStorage.getItem('user');

        if (!token) {
            setLoading(false);
            return;
        }

        if (cachedUser) {
            setUser(JSON.parse(cachedUser));
        }

        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const userData = await AuthService.getMe();

            // Keep the role from cache if getMe doesn't return it
            if (userData && !userData.role && cachedUser) {
                userData.role = JSON.parse(cachedUser).role;
            }

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (credentials: LoginRequest): Promise<LoginResponse | undefined> => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthService.login(credentials);

            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);

                // Map login response user (lowercase fields) to AdminResponse
                const fullUserData: AdminResponse = {
                    id: response.user.id,
                    email: response.user.email,
                    firstName: response.user.firstName,
                    lastName: response.user.lastName,
                    gender: response.user.gender,
                    role: response.role,
                    imageUrl: '',
                    phoneNumber: '',
                    birthDate: '',
                    verified: false,
                    createdAt: '',
                } as AdminResponse;

                setUser(fullUserData);
                localStorage.setItem('user', JSON.stringify(fullUserData));
                api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;

                toast.success('Login successful');

                if (response.role === UserRole.SUPERADMIN) {
                    navigate('/superadmin/dashboard', { replace: true });
                } else {
                    navigate('/admin/dashboard', { replace: true });
                }

                return response;
            }
        } catch (err: any) {
            const message = getErrorMessage(err);
            setError(message);
            toast.error(message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const hasRole = useCallback(
        (role: UserRole): boolean => {
            if (!user || !user.role) return false;
            return user.role === role;
        },
        [user],
    );

    const updateProfile = async (data: UpdateAdminRequest) => {
        try {
            const payload: UpdateAdminRequest = { ...data };
            if (payload.imageUrl) {
                payload.imageUrl = payload.imageUrl.trim().replace(/\s+/g, '_');
                if (payload.imageUrl === '') {
                    payload.imageUrl = null;
                }
            }

            const response = await AuthService.updateMe(payload);
            const updated = await AuthService.getMe();
            if (user?.role) updated.role = user.role;
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
            toast.success('Profile updated');
            return response;
        } catch (err) {
            toast.error(getErrorMessage(err));
            throw err;
        }
    };

    const resetPassword = async (token: string, password: string) => {
        await AuthService.resetPassword(token, password);
        navigate('/login');
    };

    const forgotPassword = async (email: string) => {
        await AuthService.forgotPassword(email);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateProfile,
        forgotPassword,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === UserRole.SUPERADMIN,
        hasRole,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};