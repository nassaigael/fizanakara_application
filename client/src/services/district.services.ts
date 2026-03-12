import api from './api/axios.config';
import { District, DistrictDto, ApiResponse } from '../lib/types';

export const DistrictService = {
    getAll: async (): Promise<District[]> => {
        const response = await api.get<District[]>('/api/admins/districts');
        return response.data;
    },

    getById: async (id: number): Promise<District> => {
        const response = await api.get<District>(`/api/admins/districts/${id}`);
        return response.data;
    },

    create: async (data: DistrictDto): Promise<District> => {
        const response = await api.post<District>('/api/admins/districts', data);
        return response.data;
    },

    update: async (id: number, data: DistrictDto): Promise<District> => {
        const response = await api.put<District>(`/api/admins/districts/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/api/admins/districts/${id}`);
        return response.data;
    },

    deleteAll: async (): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>('/api/admins/districts/delete-all');
        return response.data;
    }
};