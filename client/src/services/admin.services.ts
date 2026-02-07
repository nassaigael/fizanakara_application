// services/admin.service.ts
import api from "../api/axios.config";
import { 
    AdminResponseModel, 
    LoginRequestModel, 
    RegisterRequestModel, 
    AdminUpdateModel 
} from "../lib/types/models/admin.models.types";
import { LoginResponse, UpdateMeResponse, GenericResponse } from "../lib/types/auth.types";

const AdminService = {
    /**
     * Authentification de l'administrateur.
     * @path POST /api/login
     */
    login: async (credentials: LoginRequestModel): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/login', credentials);
        return response.data;
    },

    /**
     * Enregistrement d'un nouvel admin (SUPERADMIN uniquement).
     * @path POST /api/register
     */
    register: async (data: RegisterRequestModel): Promise<AdminResponseModel> => {
        const response = await api.post<AdminResponseModel>('/register', data);
        return response.data;
    },

    /**
     * Récupère le profil de l'admin connecté.
     * @path GET /api/admins/me
     */
    getMe: async (): Promise<AdminResponseModel> => {
        const response = await api.get<AdminResponseModel>('/admins/me');
        return response.data;
    },

    /**
     * Récupère tous les administrateurs.
     * @path GET /api/admins/all
     */
    getAllAdmins: async (): Promise<AdminResponseModel[]> => {
        const response = await api.get<AdminResponseModel[]>('/admins/all');
        return response.data;
    },

    /**
     * Met à jour le profil de l'admin connecté.
     * @path PATCH /api/admins/me
     */
    updateMe: async (data: AdminUpdateModel): Promise<UpdateMeResponse> => {
        const response = await api.patch<UpdateMeResponse>('/admins/me', data);
        return response.data;
    },

    /**
     * Supprime un administrateur par ID. suel de super Admin peut le faire.
     * @path DELETE /api/{id}
     */
    deleteAdmin: async (id: string): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>(`/${id}`);
        return response.data;
    },
    /**
     * Supprime un administrateur par ID.
     * @path DELETE /api/admins/me
     */
    deleteMe: async (): Promise<GenericResponse> => {
        const response = await api.delete<GenericResponse>(`/admins/me`);
        return response.data;
    },

    /**
     * Demande de réinitialisation de mot de passe.
     * @path POST /api/forgot-password
     */
    forgotPassword: async (email: string): Promise<string> => {
        const response = await api.post<string>('/forgot-password', { email });
        return response.data;
    },

    /**
     * Réinitialisation effective du mot de passe avec le token.
     * @path POST /api/reset-password
     */
    resetPassword: async (token: string, newPassword: string): Promise<string> => {
        const response = await api.post<string>('/reset-password', { token, newPassword });
        return response.data;
    }
};

export default AdminService;