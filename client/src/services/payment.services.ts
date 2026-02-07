// services/payment.service.ts
import api from "../api/axios.config";
import { 
    PaymentModel, 
    PaymentResponseModel 
} from "../lib/types/models/payment.models.types";

const PaymentService = {
    /**
     * Récupère tous les paiements liés à une cotisation spécifique.
     * @path GET /api/admins/payments/contribution/{contributionId}
     */
    getByContributionId: async (contributionId: string): Promise<PaymentResponseModel[]> => {
        const response = await api.get<PaymentResponseModel[]>(`/admins/payments/contribution/${contributionId}`);
        return response.data;
    },

    /**
     * Enregistre un nouveau paiement.
     * @path POST /api/admins/payments
     */
    create: async (data: PaymentModel): Promise<PaymentResponseModel> => {
        // Note: Le DTO Java utilise amountPayed, assure-toi que ton interface TS est alignée
        const response = await api.post<PaymentResponseModel>('/admins/payments', data);
        return response.data;
    },

    /**
     * Met à jour un paiement existant.
     * @path PUT /api/admins/payments/{id}
     */
    update: async (id: string, data: PaymentModel): Promise<PaymentResponseModel> => {
        const response = await api.put<PaymentResponseModel>(`/admins/payments/${id}`, data);
        return response.data;
    },

    /**
     * Supprime un paiement.
     * @path DELETE /api/admins/payments/{id}
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`/admins/payments/${id}`);
    }
};

export default PaymentService;