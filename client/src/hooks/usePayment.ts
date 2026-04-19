import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '../services/payment.services';
import { PaymentRequest, PaymentResponse } from '../lib/types';
import toast from 'react-hot-toast';

export const usePayment = () => {
    const queryClient = useQueryClient();

    const addPayment = useMutation({
        mutationFn: (data: PaymentRequest) => PaymentService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', variables.contributionId] });
            toast.success('Paiement enregistré avec succès');
        },
        onError: (error: any) => {
            console.error('Payment error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de l\'enregistrement du paiement';
            toast.error(errorMessage);
        },
    });

    const updatePayment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: PaymentRequest }) =>
            PaymentService.update(id, data),
        onSuccess: (_, { data }) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', data.contributionId] });
            toast.success('Paiement modifié avec succès');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la modification';
            toast.error(errorMessage);
        },
    });

    const deletePayment = useMutation({
        mutationFn: (id: string) => PaymentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            toast.success('Paiement supprimé avec succès');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors de la suppression';
            toast.error(errorMessage);
        },
    });

    return {
        addPayment,
        updatePayment,
        deletePayment,
    };
};