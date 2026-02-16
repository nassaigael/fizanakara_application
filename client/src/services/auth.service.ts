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
        return ((await api.post('/register', data)).data);
    },
    getMe: async (): Promise<AdminResponseModel> => {
        return ((await api.get('/api/admin/me')).data);
    },
    updateMe: async (data: AdminUpdateModel): Promise<AdminResponseModel> => {
        return (await api.patch('/api/admin/me', data)).data;
    },
    verifyResetToken: async (token: string) =>{
        return ((await api.get(`/auth/verify-reset-token?token=${token}`)).data);
    },
    forgotPassword: async (email: string) => {
        return await api.post('/forgot-password', { email });
    },
    resetPassword: async (data: { token: string; newPassword: string }) => {
        return await api.post('/reset-password', data);
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    }
};