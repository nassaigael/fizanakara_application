import api from './api/axios.config';
import { PaymentRequest, PaymentResponse, ApiResponse } from '../lib/types';

export const PaymentService = {
    getByContributionId: async (contributionId: string): Promise<PaymentResponse[]> => {
        const response = await api.get<PaymentResponse[]>(
            `/api/admins/payments/contribution/${contributionId}`
        );
        return response.data;
    },

    create: async (data: PaymentRequest): Promise<PaymentResponse> => {
        const response = await api.post<PaymentResponse>('/api/admins/payments', data);
        return response.data;
    },

    update: async (id: string, data: PaymentRequest): Promise<PaymentResponse> => {
        const response = await api.put<PaymentResponse>(`/api/admins/payments/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/api/admins/payments/${id}`);
        return response.data;
    }
};