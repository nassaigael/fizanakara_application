import api from "../api/axios.config";
import { 
    AdminResponseModel, 
    LoginRequestModel, 
    RegisterRequestModel, 
    AdminUpdateModel 
} from "../lib/types/models/admin.models.types";
import { LoginResponse, UpdateMeResponse, GenericResponse } from "../lib/types/auth.types";

const AdminService = {
    login: async (credentials: LoginRequestModel): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/login', credentials);
        return response.data;
    },

    register: async (data: RegisterRequestModel): Promise<AdminResponseModel> => {
        const response = await api.post<AdminResponseModel>('/register', data);
        return response.data;
    },

    getMe: async (): Promise<AdminResponseModel> => {
        const response = await api.get<AdminResponseModel>('/admins/me');
        return response.data;
    },

    getAllAdmins: async (): Promise<AdminResponseModel[]> => {
        const response = await api.get<AdminResponseModel[]>('/admins/all');
        return response.data;
    },

    updateMe: async (data: AdminUpdateModel): Promise<UpdateMeResponse> => {
        const response = await api.patch<UpdateMeResponse>('/admins/me', data);
        return response.data;
    },

    deleteAdmin: async (id: string): Promise<GenericResponse> => {
        // URL : /api/{id} (selon le backend)
        const response = await api.delete<GenericResponse>(`/${id}`);
        return response.data;
    },

    deleteMe: async (): Promise<GenericResponse> => {
        // Vérifier si cette route existe dans le backend
        const response = await api.delete<GenericResponse>('/admins/me');
        return response.data;
    },

    forgotPassword: async (email: string): Promise<string> => {
        const response = await api.post<string>('/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<string> => {
        const response = await api.post<string>('/reset-password', { token, newPassword });
        return response.data;
    }
};

export default AdminService;