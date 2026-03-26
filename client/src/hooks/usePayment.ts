import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '../services/payment.services';
import { PaymentRequest } from '../lib/types';
import toast from 'react-hot-toast';

export const usePayment = () => {
    const queryClient = useQueryClient();

    const addPayment = useMutation({
        mutationFn: (data: PaymentRequest) => PaymentService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', variables.contributionId] });
            toast.success('Payment recorded successfully');
        },
        onError: (error: any) => {
            console.error('Payment error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to record payment';
            toast.error(errorMessage);
        },
    });

    return {
        addPayment,
    };
};