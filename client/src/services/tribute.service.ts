import api from '../api/axios.config';
import { TributeDto } from '../lib/types/models/common.type';

const BASE_URL = '/admins/tributes';

export const TributeService = {
    /**
     * Récupère la liste de toutes les tribus/clans
     */
    getAll: async (): Promise<TributeDto[]> => {
        const response = await api.get(BASE_URL);
        return response.data;
    },

    /**
     * Crée une nouvelle tribu
     */
    create: async (data: TributeDto): Promise<TributeDto> => {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    /**
     * Modifie le nom d'une tribu existante
     */
    update: async (id: number, data: TributeDto): Promise<TributeDto> => {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Supprime une tribu (Attention : vérifier si des membres y sont rattachés)
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    }
};