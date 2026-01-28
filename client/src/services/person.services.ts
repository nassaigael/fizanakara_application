import api from '../api/axios.config';
import { PersonDto, PersonResponseDto } from '../lib/types/models/person.type';

const BASE_URL = '/admins/persons';

export const PersonService = {
    /**
     * Récupère la liste complète des membres (souvent paginée côté backend)
     */
    getAll: async (): Promise<PersonResponseDto[]> => {
        const response = await api.get(BASE_URL);
        return response.data;
    },

    /**
     * Récupère un membre spécifique avec ses détails et ses enfants
     */
    getById: async (id: string): Promise<PersonResponseDto> => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Création d'un membre racine (chef de famille ou membre indépendant)
     */
    create: async (data: PersonDto): Promise<PersonResponseDto> => {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    /**
     * Ajoute un enfant à un parent existant (création de lien hiérarchique)
     */
    addChild: async (parentId: string, data: PersonDto): Promise<PersonResponseDto> => {
        const response = await api.post(`${BASE_URL}/${parentId}/children`, data);
        return response.data;
    },

    /**
     * Met à jour les informations d'un membre
     */
    update: async (id: string, data: Partial<PersonDto>): Promise<PersonResponseDto> => {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Action spéciale pour changer le statut ou le rang d'un membre
     */
    promote: async (id: string): Promise<PersonResponseDto> => {
        const response = await api.post(`${BASE_URL}/${id}/promote`);
        return response.data;
    },

    /**
     * Suppression d'un membre (Attention: vérifie l'impact sur les enfants rattachés)
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    }
};