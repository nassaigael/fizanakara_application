import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContributionService } from '../services/contribution.services';
import { PaymentService } from '../services/payment.services';
import { 
    ContributionYearRequest, 
    ContributionUpdateRequest,
    PaymentRequest,
} from '../lib/types';
import { getPaymentPercentage } from '../lib/helper';
import toast from 'react-hot-toast';

export const useFinance = (personId?: string, year?: number) => {
    const queryClient = useQueryClient();

    const { 
        data: contributions = [], 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['contributions', personId, year],
        queryFn: () => personId && year 
            ? ContributionService.getByPersonAndYear(personId, year)
            : ContributionService.getAll(),
        staleTime: 2 * 60 * 1000,
    });

    const usePayments = (contributionId: string) => {
        return useQuery({
            queryKey: ['payments', contributionId],
            queryFn: () => PaymentService.getByContributionId(contributionId),
            enabled: !!contributionId,
        });
    };

    const generateAnnualContributions = useMutation({
        mutationFn: (data: ContributionYearRequest) => 
            ContributionService.generateForYear(data),
        onSuccess: (newContributions) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success(`${newContributions.length} cotisations générées pour ${newContributions[0]?.year}`);
        },
        onError: () => {
            toast.error('Erreur lors de la génération');
        }
    });

    const updateContribution = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ContributionUpdateRequest }) =>
            ContributionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success('Cotisation mise à jour');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour');
        }
    });

    // Supprimer une cotisation
    const deleteContribution = useMutation({
        mutationFn: (id: string) => ContributionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success('Cotisation supprimée');
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
        }
    });

    const addPayment = useMutation({
        mutationFn: (data: PaymentRequest) => PaymentService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', variables.contributionId] });
            toast.success('Paiement enregistré');
        },
        onError: () => {
            toast.error('Erreur lors du paiement');
        }
    });

    const updatePayment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: PaymentRequest }) =>
            PaymentService.update(id, data),
        onSuccess: (_, { data }) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', data.contributionId] });
            toast.success('Paiement mis à jour');
        }
    });

    const deletePayment = useMutation({
        mutationFn: (id: string) => PaymentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success('Paiement supprimé');
        }
    });

    const getContributionStats = () => {
        const total = contributions.reduce((sum, c) => sum + c.amount, 0);
        const paid = contributions.reduce((sum, c) => sum + c.totalPaid, 0);
        const remaining = total - paid;
        const percentage = getPaymentPercentage(paid, total);

        return { total, paid, remaining, percentage };
    };

    const getMemberContributions = (memberId: string) => {
        return contributions.filter(c => c.memberId === memberId);
    };

    return {
        // Données
        contributions,
        isLoading,
        error,
        usePayments,
        
        // Actions cotisations
        generateAnnualContributions,
        updateContribution,
        deleteContribution,
        
        // Actions paiements
        addPayment,
        updatePayment,
        deletePayment,
        
        // Helpers
        getContributionStats,
        getMemberContributions,
    };
};