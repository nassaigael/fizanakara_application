import api from '../api/axios.config';
import { DistrictDto } from '../lib/types/models/common.type';

const BASE_URL = '/admins/districts';

export const DistrictService = {
    getAll: async (): Promise<DistrictDto[]> => {
        const response = await api.get(BASE_URL);
        return response.data;
    },
    getById: async (id: number): Promise<DistrictDto> => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },
    create: async (data: DistrictDto): Promise<DistrictDto> => {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },
    update: async (id: number, data: DistrictDto): Promise<DistrictDto> => {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    }
};