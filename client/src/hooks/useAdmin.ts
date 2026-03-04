import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '../services/admin.services';
import { RegisterRequest } from '../lib/types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/helper';

export const useAdmin = () => {
    const queryClient = useQueryClient();

    const { 
        data: admins = [], 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['admins'],
        queryFn: AdminService.getAll,
        staleTime: 5 * 60 * 1000,
    });

    const createAdmin = useMutation({
        mutationFn: async (data: RegisterRequest) => {
            console.log('🔵 Tentative de création avec:', data);
            try {
                const result = await AdminService.create(data);
                console.log('✅ Création réussie:', result);
                return result;
            } catch (error: any) {
                console.error('❌ Erreur création:', {
                    status: error?.response?.status,
                    data: error?.response?.data,
                    message: error?.message
                });
                throw error;
            }
        },
        onSuccess: (newAdmin) => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            toast.success(`Admin ${newAdmin.firstName} ${newAdmin.lastName} créé`);
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error));
        }
    });

    const deleteAdmin = useMutation({
        mutationFn: async (id: string) => {
            console.log('Deleting admin with ID:', id);
            try {
                const result = await AdminService.delete(id);
                console.log('Delete result:', result);
                return result;
            } catch (error) {
                console.error('Delete error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            toast.success('Admin supprimé avec succès');
        },
        onError: (error) => {
            console.error('Mutation error:', error);
            toast.error(getApiErrorMessage(error));
        }
    });

    return {
        admins,
        isLoading,
        error,
        createAdmin,
        deleteAdmin
    };
};