import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TributeService } from '../services/tribute.services';
import { TributeDto } from '../lib/types';
import toast from 'react-hot-toast';

export const useTribute = (tributeId?: number) => {
    const queryClient = useQueryClient();

    const {
        data: tributes = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['tributes'],
        queryFn: TributeService.getAll,
        staleTime: 10 * 60 * 1000,
    });

    const {
        data: currentTribute,
        isLoading: loadingCurrent,
    } = useQuery({
        queryKey: ['tributes', tributeId],
        queryFn: () => (tributeId ? TributeService.getById(tributeId) : Promise.resolve(null)),
        enabled: !!tributeId,
    });

    const createTribute = useMutation({
        mutationFn: (data: TributeDto) => TributeService.create(data),
        onSuccess: (newTribute) => {
            queryClient.invalidateQueries({ queryKey: ['tributes'] });
            toast.success(`Tribute "${newTribute.name}" created`);
        },
        onError: () => {
            toast.error('Failed to create tribute');
        },
    });

    const updateTribute = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TributeDto }) =>
            TributeService.update(id, data),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['tributes'] });
            queryClient.setQueryData(['tributes', updated.id], updated);
            toast.success(`Tribute "${updated.name}" updated`);
        },
        onError: () => {
            toast.error('Failed to update tribute');
        },
    });

    const deleteTribute = useMutation({
        mutationFn: (id: number) => TributeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tributes'] });
            toast.success('Tribute deleted');
        },
        onError: () => {
            toast.error('Failed to delete tribute');
        },
    });

    const deleteAllTributes = useMutation({
        mutationFn: () => TributeService.deleteAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tributes'] });
            toast.success('All tributes deleted');
        },
        onError: () => {
            toast.error('Failed to delete tributes');
        },
    });

    return {
        tributes,
        currentTribute,
        isLoading,
        loadingCurrent,
        error,
        createTribute,
        updateTribute,
        deleteTribute,
        deleteAllTributes,
    };
};