import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { LoginRequest, AdminResponse, UpdateAdminRequest } from '../lib/types';
import { getErrorMessage } from '../lib/helper';

export const useAuth = () => {
    const [user, setUser] = useState<AdminResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await AuthService.getMe();
            setUser(userData);
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (credentials: LoginRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthService.login(credentials);
            
            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                await loadUser();
                
                const targetPath = response.role === 'SUPERADMIN' 
                    ? '/superadmin/dashboard' 
                    : '/admin/dashboard';
                navigate(targetPath, { replace: true });
            }
            return response;
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(() => {
        AuthService.logout();
        setUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    const updateProfile = async (data: UpdateAdminRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthService.updateMe(data);
            await loadUser();
            return response;
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;
        
        try {
            const response = await AuthService.refreshToken(refreshToken);
            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
            }
            return response;
        } catch {
            logout();
            return null;
        }
    };

    return {
        user,
        loading,
        error,
        login,
        logout,
        updateProfile,
        refreshToken,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'SUPERADMIN'
    };
};