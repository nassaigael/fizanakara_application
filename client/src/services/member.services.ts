import api from './api/axios.config';
import { PersonDto, PersonResponse } from '../lib/types';

export const MemberService = {
    getAll: async (): Promise<PersonResponse[]> => {
        const response = await api.get<PersonResponse[]>('/api/admins/persons');
        return response.data;
    },

    getById: async (id: string): Promise<PersonResponse> => {
        const response = await api.get<PersonResponse>(`/api/admins/persons/${id}`);
        return response.data;
    },

    create: async (data: PersonDto): Promise<PersonResponse> => {
        const response = await api.post<PersonResponse>('/api/admins/persons', data);
        return response.data;
    },

    update: async (id: string, data: PersonDto): Promise<PersonResponse> => {
        const response = await api.put<PersonResponse>(`/api/admins/persons/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<string> => {
        const response = await api.delete<string>(`/api/admins/persons/${id}`);
        return response.data;
    },

    promote: async (id: string): Promise<PersonResponse> => {
        const response = await api.post<PersonResponse>(`/api/admins/persons/${id}/promote`);
        return response.data;
    },

    addChild: async (parentId: string, childData: PersonDto): Promise<PersonResponse> => {
        const response = await api.post<PersonResponse>(
            `/api/admins/persons/${parentId}/children`, 
            childData
        );
        return response.data;
    },

    getChildren: async (parentId: string): Promise<PersonResponse[]> => {
        const response = await api.get<PersonResponse[]>(`/api/admins/persons/${parentId}/children`);
        return response.data;
    },

    deleteAll: async (): Promise<string> => {
        const response = await api.delete<string>('/api/admins/persons/delete-all');
        return response.data;
    }
};