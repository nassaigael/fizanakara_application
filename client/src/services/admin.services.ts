import api from './api/axios.config';
import { RegisterRequest, AdminResponse } from '../lib/types';

export const AdminService = {
	getAll: async (): Promise<AdminResponse[]> => {
		const response = await api.get<AdminResponse[]>('/api/admins/all');
		return response.data;
	},

	create: async (data: RegisterRequest): Promise<AdminResponse> => {
		const response = await api.post<AdminResponse>('/register', data);
		return response.data;
	},

	delete: async (id: string): Promise<string> => {
		const response = await api.delete<string>(`/api/${id}`);
		return response.data;
	}
};