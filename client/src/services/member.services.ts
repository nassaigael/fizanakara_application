import api from "../api/axios.config";
import { 
    PersonModel, 
    PersonResponseModel 
} from "../lib/types/models/person.models.types";
import { GenericResponse } from "../lib/types/auth.types";

const MemberService = {
    getAll: async (): Promise<PersonResponseModel[]> => {
        // URL complète : /api/admins/persons
        const response = await api.get<PersonResponseModel[]>('/admins/persons');
        return response.data;
    },

    getById: async (id: string): Promise<PersonResponseModel> => {
        // URL : /api/admins/persons/{id}
        const response = await api.get<PersonResponseModel>(`/admins/persons/${id}`);
        return response.data;
    },

    create: async (data: PersonModel): Promise<PersonResponseModel> => {
        // URL : /api/admins/persons
        const response = await api.post<PersonResponseModel>('/admins/persons', data);
        return response.data;
    },

    promote: async (id: string): Promise<PersonResponseModel> => {
        // URL : /api/admins/persons/{id}/promote
        const response = await api.post<PersonResponseModel>(`/admins/persons/${id}/promote`);
        return response.data;
    },

    addChild: async (parentId: string, childData: PersonModel): Promise<PersonResponseModel> => {
        // URL : /api/admins/persons/{parentId}/children
        const response = await api.post<PersonResponseModel>(
            `/admins/persons/${parentId}/children`, 
            childData
        );
        return response.data;
    },

    getChildren: async (parentId: string): Promise<PersonResponseModel[]> => {
        // URL : /api/admins/persons/{parentId}/children
        const response = await api.get<PersonResponseModel[]>(
            `/admins/persons/${parentId}/children`
        );
        return response.data;
    },

    update: async (id: string, data: PersonModel): Promise<PersonResponseModel> => {
        // URL : /api/admins/persons/{id}
        const response = await api.put<PersonResponseModel>(`/admins/persons/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<GenericResponse> => {
        // URL : /api/admins/persons/{id}
        const response = await api.delete<GenericResponse>(`/admins/persons/${id}`);
        return response.data;
    },

    deleteAll: async (): Promise<GenericResponse> => {
        // URL : /api/admins/persons/delete-all
        const response = await api.delete<GenericResponse>('/admins/persons/delete-all');
        return response.data;
    }
};

export default MemberService;