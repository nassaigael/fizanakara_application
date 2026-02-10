import api from '../api/axios.config'; 
import {
    LoginRequestModel,
    RegisterRequestModel,
    AdminResponseModel,
    AdminUpdateModel
} from '../lib/types/models/admin.models.types';

export const AuthService = {
    login: async (credentials: LoginRequestModel) => {
        const response = await api.post('/login', credentials);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response.data;
    },

    register: async (data: RegisterRequestModel): Promise<AdminResponseModel> => {
        const response = await api.post('/register', data);
        return response.data;
    },

    getMe: async (): Promise<AdminResponseModel> => {
        const response = await api.get('/admins/me');
        return response.data;
    },

    updateMe: async (data: AdminUpdateModel): Promise<AdminResponseModel> => {
        const response = await api.patch('/admins/me', data);
        return response.data;
    },

    forgotPassword: async (email: string) => {
        // POST sur /api/forgot-password
        return await api.post('/forgot-password', { email });
    },

    resetPassword: async (data: { token: string; newPassword: string }) => {
        // POST sur /api/reset-password
        return await api.post('/reset-password', data);
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    }
};