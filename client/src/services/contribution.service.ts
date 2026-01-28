import api from '../api/axios.config';
import { 
    ContributionResponseDto, 
    ContributionYearDto, 
    ContributionUpdateDto 
} from '../lib/types/models/contribution.type';

// On retire le prefixe '/api' car il est déjà dans la config Axios
const BASE_URL = '/admins/contributions';

export const ContributionService = {
    /**
     * Récupère les cotisations d'un membre pour une année spécifique
     */
    getByPersonAndYear: async (personId: string, year: number): Promise<ContributionResponseDto[]> => {
        const response = await api.get(`${BASE_URL}/person/${personId}/year/${year}`);
        return response.data;
    },

    /**
     * Déclenche la génération massive des cotisations pour tous les membres actifs
     * pour une année donnée (Action souvent réservée au SuperAdmin)
     */
    generateForYear: async (data: ContributionYearDto): Promise<ContributionResponseDto[]> => {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    /**
     * Met à jour le montant ou le statut d'une cotisation spécifique
     */
    update: async (id: string, data: ContributionUpdateDto): Promise<ContributionResponseDto> => {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Récupère toutes les cotisations pour une année (utile pour le Dashboard)
     */
    getAllByYear: async (year: number): Promise<ContributionResponseDto[]> => {
        const response = await api.get(`${BASE_URL}/year/${year}`);
        return response.data;
    }
};