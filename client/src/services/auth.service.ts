import api from '../api/axios.config';
import { 
    LoginRequestDTO, 
    RegisterRequestDTO, 
    AdminResponseDto, 
    UpdateAdminDto 
} from '../lib/types/models/admin.type';

export const AuthService = {

    login: async (credentials: LoginRequestDTO): Promise<{ token: string; admin: AdminResponseDto }> => {
        const response = await api.post('/login', credentials);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },


    register: async (data: RegisterRequestDTO): Promise<AdminResponseDto> => {
        const response = await api.post('/register', data);
        return response.data;
    },


    getMe: async (): Promise<AdminResponseDto> => {
        const response = await api.get('/admins/me');
        return response.data;
    },


    updateMe: async (data: UpdateAdminDto): Promise<AdminResponseDto> => {
        const response = await api.patch('/admins/me', data);
        return response.data;
    },


    forgotPassword: async (email: string) => {
        return await api.post('/forgot-password', { email });
    },

    verifyResetToken: async (token: string) => {
        const response = await api.get(`/auth/verify-reset-token`, { params: { token } });
        return response.data;
    },

    resetPassword: async (data: { token: string; newPassword: string }) => {
        return await api.post('/reset-password', data);
    },


    logout: () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    }
};