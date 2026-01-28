import api from '../api/axios.config';
import { PaymentDto, PaymentResponseDto } from '../lib/types/models/payment.type';

const BASE_URL = '/admins/payments';

export const PaymentService = {
    /**
     * Historique des versements pour une cotisation précise
     */
    getByContribution: async (contributionId: string): Promise<PaymentResponseDto[]> => {
        const response = await api.get(`${BASE_URL}/contribution/${contributionId}`);
        return response.data;
    },

    /**
     * Enregistrer un nouveau versement (Arrivée de cash)
     */
    create: async (data: PaymentDto): Promise<PaymentResponseDto> => {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    /**
     * Correction d'une erreur de saisie sur un paiement
     */
    update: async (id: string, data: PaymentDto): Promise<PaymentResponseDto> => {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Annulation d'un paiement (Action sensible)
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    }
};