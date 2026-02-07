// services/member.service.ts
import api from "../api/axios.config";
import { 
    PersonModel, 
    PersonResponseModel 
} from "../lib/types/models/person.models.types";
import { GenericResponse } from "../lib/types/auth.types";

const MemberService = {
    /**
     * Récupère tous les membres/personnes.
     * @path GET /api/admins/persons
     */
    getAll: async (): Promise<PersonResponseModel[]> => {
        const response = await api.get<PersonResponseModel[]>('/admins/persons');
        return response.data;
    },

    /**
     * Récupère un membre par son ID.
     * @path GET /api/admins/persons/{id}
     */
    getById: async (id: string): Promise<PersonResponseModel> => {
        const response = await api.get<PersonResponseModel>(`/admins/persons/${id}`);
        return response.data;
    },

    /**
     * Crée une nouvelle personne (isolée ou avec parentId dans le body).
     * @path POST /api/admins/persons
     */
    create: async (data: PersonModel): Promise<PersonResponseModel> => {
        const response = await api.post<PersonResponseModel>('/admins/persons', data);
        return response.data;
    },

    /**
     * Promotion d'un membre à 18 ans (devient membre actif).
     * @path POST /api/admins/persons/{id}/promote
     */
    promote: async (id: string): Promise<PersonResponseModel> => {
        const response = await api.post<PersonResponseModel>(`/admins/persons/${id}/promote`);
        return response.data;
    },

    /**
     * Ajoute un enfant spécifiquement à un parent.
     * @path POST /api/admins/persons/{parentId}/children
     */
    addChild: async (parentId: string, childData: PersonModel): Promise<PersonResponseModel> => {
        const response = await api.post<PersonResponseModel>(`/admins/persons/${parentId}/children`, childData);
        return response.data;
    },

    /**
     * Récupère la liste des enfants d'un parent.
     * @path GET /api/admins/persons/{parentId}/children
     */
    getChildren: async (parentId: string): Promise<PersonResponseModel[]> => {
        const response = await api.get<PersonResponseModel[]>(`/admins/persons/${parentId}/children`);
        return response.data;
    },

    /**
     * Met à jour les informations d'une personne.
     * @path PUT /api/admins/persons/{id}
     */
    update: async (id: string, data: PersonModel): Promise<PersonResponseModel> => {
        const response = await api.put<PersonResponseModel>(`/admins/persons/${id}`, data);
        return response.data;
    },

    /**
     * Supprime une personne par son ID.
     * @path DELETE /api/admins/persons/{id}
     */
    delete: async (id: string): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>(`/admins/persons/${id}`);
        return response.data;
    },

    /**
     * Supprime TOUS les membres (Action critique).
     * @path DELETE /api/admins/persons/delete-all
     */
    deleteAll: async (): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>('/admins/persons/delete-all');
        return response.data;
    }
};

export default MemberService;