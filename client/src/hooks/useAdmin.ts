import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '../services/admin.services';
import { RegisterRequest} from '../lib/types';
import toast from 'react-hot-toast';

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
        mutationFn: (data: RegisterRequest) => AdminService.create(data),
        onSuccess: (newAdmin) => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            toast.success(`Admin ${newAdmin.firstName} ${newAdmin.lastName} créé`);
        },
        onError: () => {
            toast.error('Erreur lors de la création de l\'admin');
        }
    });

    const deleteAdmin = useMutation({
        mutationFn: (id: string) => AdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            toast.success('Admin supprimé avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
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