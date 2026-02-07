import api from "../api/axios.config";
import { TributeModel } from "../lib/types/models/localistion.models.types";
import { GenericResponse } from "../lib/types/auth.types";

export interface TributeResponse extends TributeModel {
    name: any;
    id: number;
}

const TributeService = {
    getAll: async (): Promise<TributeResponse[]> => {
        const response = await api.get<TributeResponse[]>('/admins/tributes');
        return response.data;
    },

    getById: async (id: number): Promise<TributeResponse> => {
        const response = await api.get<TributeResponse>(`/admins/tributes/${id}`);
        return response.data;
    },

    create: async (data: TributeModel): Promise<TributeResponse> => {
        const response = await api.post<TributeResponse>('/admins/tributes', data);
        return response.data;
    },

    update: async (id: number, data: TributeModel): Promise<TributeResponse> => {
        const response = await api.put<TributeResponse>(`/admins/tributes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>(`/admins/tributes/${id}`);
        return response.data;
    },

    deleteAll: async (): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>('/admins/tributes/delete-all');
        return response.data;
    }
};

export default TributeService;