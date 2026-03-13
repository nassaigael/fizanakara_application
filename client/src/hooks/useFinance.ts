import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContributionService } from '../services/contribution.services';
import { PaymentService } from '../services/payment.services';
import { ContributionYearRequest, ContributionUpdateRequest, PaymentRequest } from '../lib/types';
import { getPaymentPercentage } from '../lib/helper';
import toast from 'react-hot-toast';

export const useFinance = (personId?: string, year?: number) => {
    const queryClient = useQueryClient();

    const {
        data: contributions = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['contributions', personId, year],
        queryFn: () =>
            personId && year
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
        mutationFn: (data: ContributionYearRequest) => ContributionService.generateForYear(data),
        onSuccess: (newContributions) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success(
                `${newContributions.length} contributions generated for ${newContributions[0]?.year}`,
            );
        },
        onError: () => {
            toast.error('Failed to generate contributions');
        },
    });

    const updateContribution = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ContributionUpdateRequest }) =>
            ContributionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success('Contribution updated');
        },
        onError: () => {
            toast.error('Failed to update contribution');
        },
    });

    const deleteContribution = useMutation({
        mutationFn: (id: string) => ContributionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success('Contribution deleted');
        },
        onError: () => {
            toast.error('Failed to delete contribution');
        },
    });

    const addPayment = useMutation({
        mutationFn: (data: PaymentRequest) => PaymentService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', variables.contributionId] });
            toast.success('Payment recorded');
        },
        onError: () => {
            toast.error('Failed to record payment');
        },
    });

    const updatePayment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: PaymentRequest }) =>
            PaymentService.update(id, data),
        onSuccess: (_, { data }) => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['payments', data.contributionId] });
            toast.success('Payment updated');
        },
    });

    const deletePayment = useMutation({
        mutationFn: (id: string) => PaymentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            toast.success('Payment deleted');
        },
    });

    const getContributionStats = () => {
        const total = contributions.reduce((sum, c) => sum + c.amount, 0);
        const paid = contributions.reduce((sum, c) => sum + c.totalPaid, 0);
        const remaining = total - paid;
        const percentage = getPaymentPercentage(paid, total);
        return { total, paid, remaining, percentage };
    };

    const getMemberContributions = (memberId: string) => {
        return contributions.filter((c) => c.memberId === memberId);
    };

    return {
        contributions,
        isLoading,
        error,
        usePayments,
        generateAnnualContributions,
        updateContribution,
        deleteContribution,
        addPayment,
        updatePayment,
        deletePayment,
        getContributionStats,
        getMemberContributions,
    };
};