import api from "../api/axios.config";
import { DistrictModel } from "../lib/types/models/localisation.models.types";
import { GenericResponse } from "../lib/types/auth.types";

export interface DistrictResponse extends DistrictModel {
    name: any;
    id: number;
}

const DistrictService = {
    getAll: async (): Promise<DistrictResponse[]> => {
        const response = await api.get<DistrictResponse[]>('/api/admins/districts');
        return response.data;
    },

    getById: async (id: number): Promise<DistrictResponse> => {
        const response = await api.get<DistrictResponse>(`/api/admins/districts/${id}`);
        return response.data;
    },

    create: async (data: DistrictModel): Promise<DistrictResponse> => {
        const response = await api.post<DistrictResponse>('/api/admins/districts', data);
        return response.data;
    },

    update: async (id: number, data: DistrictModel): Promise<DistrictResponse> => {
        const response = await api.put<DistrictResponse>(`/api/admins/districts/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>(`/api/admins/districts/${id}`);
        return response.data;
    },

    deleteAll: async (): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>('/api/admins/districts/delete-all');
        return response.data;
    }
};

export default DistrictService;