import api from './api/axios.config';
import { RegisterRequest, AdminResponse, ApiResponse } from '../lib/types';

export const AdminService = {
    getAll: async (): Promise<AdminResponse[]> => {
        const response = await api.get<AdminResponse[]>('/admins/all');
        return response.data;
    },

    create: async (data: RegisterRequest): Promise<AdminResponse> => {
        const response = await api.post<AdminResponse>('/register', data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/${id}`);
        return response.data;
    },
};