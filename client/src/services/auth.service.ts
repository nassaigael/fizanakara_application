import api from './api/axios.config';
import {
    LoginRequest,
    LoginResponse,
    AdminResponse,
    UpdateAdminRequest,
    UpdateMeResponse,
} from '../lib/types';

export const AuthService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/login', credentials);
        return response.data;
    },

    refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
        const response = await api.post<{ accessToken: string }>('/refresh', { refreshToken });
        return response.data;
    },

    forgotPassword: async (email: string): Promise<void> => {
        await api.post('/forgot-password', { email });
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        await api.post('/reset-password', { token, newPassword });
    },

    getMe: async (): Promise<AdminResponse> => {
        const response = await api.get<AdminResponse>('/admins/me');
        return response.data;
    },

    updateMe: async (data: UpdateAdminRequest): Promise<UpdateMeResponse> => {
        const response = await api.patch<UpdateMeResponse>('/admins/me', data);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    },
};