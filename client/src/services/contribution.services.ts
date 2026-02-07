// services/contribution.service.ts
import api from "../api/axios.config";
import { 
    ContributionResponseModel, 
    ContributionUpdateModel,
    ContributionYearModel 
} from "../types/models/contribution.models.types";

const ContributionService = {
    /**
     * Récupère toutes les contributions (cotisations).
     * @path GET /api/admins/contributions
     */
    getAll: async (): Promise<ContributionResponseModel[]> => {
        const response = await api.get<ContributionResponseModel[]>('/admins/contributions');
        return response.data;
    },

    /**
     * Récupère les cotisations d'une personne spécifique pour une année donnée.
     * @path GET /api/admins/contributions/person/{personId}/year/{year}
     */
    getByPersonAndYear: async (personId: string, year: number): Promise<ContributionResponseModel[]> => {
        const response = await api.get<ContributionResponseModel[]>(
            `/admins/contributions/person/${personId}/year/${year}`
        );
        return response.data;
    },

    /**
     * Génère les cotisations annuelles pour tous les membres éligibles.
     * @path POST /api/admins/contributions
     */
    generateForYear: async (data: ContributionYearModel): Promise<ContributionResponseModel[]> => {
        const response = await api.post<ContributionResponseModel[]>('/admins/contributions', data);
        return response.data;
    },

    /**
     * Met à jour une cotisation (statut ou montant).
     * @path PUT /api/admins/contributions/{id}
     */
    update: async (id: string, data: ContributionUpdateModel): Promise<ContributionResponseModel> => {
        const response = await api.put<ContributionResponseModel>(`/admins/contributions/${id}`, data);
        return response.data;
    },

    /**
     * Supprime une cotisation.
     * @path DELETE /api/admins/contributions/{id}
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`/admins/contributions/${id}`);
    }
};

export default ContributionService;