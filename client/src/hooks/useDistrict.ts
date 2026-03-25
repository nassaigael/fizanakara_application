import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DistrictService } from '../services/district.services';
import { DistrictDto } from '../lib/types';
import toast from 'react-hot-toast';

export const useDistrict = (districtId?: number) => {
    const queryClient = useQueryClient();

    const {
        data: districts = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['districts'],
        queryFn: DistrictService.getAll,
        staleTime: 10 * 60 * 1000,
    });

    const {
        data: currentDistrict,
        isLoading: loadingCurrent,
    } = useQuery({
        queryKey: ['districts', districtId],
        queryFn: () => (districtId ? DistrictService.getById(districtId) : Promise.resolve(null)),
        enabled: !!districtId,
    });

    const createDistrict = useMutation({
        mutationFn: (data: DistrictDto) => DistrictService.create(data),
        onSuccess: (newDistrict) => {
            queryClient.invalidateQueries({ queryKey: ['districts'] });
            toast.success(`District "${newDistrict.name}" created`);
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to create district';
            toast.error(message);
        },
    });

    const updateDistrict = useMutation({
        mutationFn: ({ id, data }: { id: number; data: DistrictDto }) =>
            DistrictService.update(id, data),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['districts'] });
            queryClient.setQueryData(['districts', updated.id], updated);
            toast.success(`District "${updated.name}" updated`);
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update district';
            toast.error(message);
        },
    });

    const deleteDistrict = useMutation({
        mutationFn: (id: number) => DistrictService.delete(id),
        onSuccess: () => {
            // Invalidate and refetch districts list
            queryClient.invalidateQueries({ queryKey: ['districts'] });
            toast.success('District deleted successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete district';
            toast.error(message);
        },
    });

    const deleteAllDistricts = useMutation({
        mutationFn: () => DistrictService.deleteAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['districts'] });
            toast.success('All districts deleted');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete districts';
            toast.error(message);
        },
    });

    return {
        districts,
        currentDistrict,
        isLoading,
        loadingCurrent,
        error,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        deleteAllDistricts,
    };
};