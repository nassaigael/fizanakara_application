import api from './api/axios.config';
import { 
    ContributionResponse, 
    ContributionYearRequest, 
    ContributionUpdateRequest 
} from '../lib/types';

export const ContributionService = {
    getAll: async (): Promise<ContributionResponse[]> => {
        const response = await api.get<ContributionResponse[]>('/api/admins/contributions');
        return response.data;
    },

    getByPersonAndYear: async (personId: string, year: number): Promise<ContributionResponse[]> => {
        const response = await api.get<ContributionResponse[]>(
            `/api/admins/contributions/person/${personId}/year/${year}`
        );
        return response.data;
    },

    generateForYear: async (data: ContributionYearRequest): Promise<ContributionResponse[]> => {
        const response = await api.post<ContributionResponse[]>('/api/admins/contributions', data);
        return response.data;
    },

    update: async (id: string, data: ContributionUpdateRequest): Promise<ContributionResponse> => {
        const response = await api.put<ContributionResponse>(`/api/admins/contributions/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/admins/contributions/${id}`);
    }
};