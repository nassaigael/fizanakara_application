import api from './api/axios.config';
import { RegisterRequest, AdminResponse } from '../lib/types';

export const AdminService = {
    getAll: async (): Promise<AdminResponse[]> => {
        const response = await api.get<AdminResponse[]>('/admins/all');
        return response.data;
    },

    create: async (data: RegisterRequest): Promise<AdminResponse> => {
        console.log('🔵 Tentative de création avec:', data);
        
        // Essayer différentes variantes d'URL
        const endpoints = [
            '/register',
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🟡 Essai sur ${endpoint}...`);
                const response = await api.post<AdminResponse>(endpoint, data);
                console.log(`✅ Succès sur ${endpoint}:`, response.data);
                return response.data;
            } catch (error: any) {
                console.log(`❌ Échec sur ${endpoint}:`, error?.response?.status);
            }
        }
        
        throw new Error('Aucun endpoint de register n\'a fonctionné');
    },

    delete: async (id: string): Promise<string> => {
        const response = await api.delete<string>(`/${id}`);
        return response.data;
    }
};