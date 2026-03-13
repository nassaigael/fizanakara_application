import api from './api/axios.config';
import { Tribute, TributeDto, ApiResponse } from '../lib/types';

export const TributeService = {
    getAll: async (): Promise<Tribute[]> => {
        const response = await api.get<Tribute[]>('/api/admins/tributes');
        return response.data;
    },

    getById: async (id: number): Promise<Tribute> => {
        const response = await api.get<Tribute>(`/api/admins/tributes/${id}`);
        return response.data;
    },

    create: async (data: TributeDto): Promise<Tribute> => {
        const response = await api.post<Tribute>('/api/admins/tributes', data);
        return response.data;
    },

    update: async (id: number, data: TributeDto): Promise<Tribute> => {
        const response = await api.put<Tribute>(`/api/admins/tributes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/api/admins/tributes/${id}`);
        return response.data;
    },

    deleteAll: async (): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>('/api/admins/tributes/delete-all');
        return response.data;
    }
};