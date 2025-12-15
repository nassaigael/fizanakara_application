import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberService } from '../services/member.services';
import { PersonDto, PersonResponse } from '../lib/types';
import { calculateAge, canPromoteToWorker, getMemberType } from '../lib/helper';
import toast from 'react-hot-toast';

export const useMembers = (parentId?: string) => {
    const queryClient = useQueryClient();


    const { 
        data: members = [], 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['members'],
        queryFn: MemberService.getAll,
        staleTime: 2 * 60 * 1000,
    });

    const { 
        data: children = [], 
        isLoading: loadingChildren 
    } = useQuery({
        queryKey: ['members', parentId, 'children'],
        queryFn: () => parentId ? MemberService.getChildren(parentId) : Promise.resolve([]),
        enabled: !!parentId,
    });

    const fetchMemberById = async (id: string): Promise<PersonResponse | null> => {
        try {
            return await MemberService.getById(id);
        } catch {
            toast.error('Impossible de charger le membre');
            return null;
        }
    };

    const createMember = useMutation({
        mutationFn: (data: PersonDto) => MemberService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Membre créé avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la création');
        }
    });

    const updateMember = useMutation({
        mutationFn: ({ id, data }: { id: string; data: PersonDto }) => 
            MemberService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Membre mis à jour');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour');
        }
    });

    const deleteMember = useMutation({
        mutationFn: (id: string) => MemberService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Membre supprimé');
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
        }
    });

    // Promouvoir un membre (STUDENT → WORKER)
    const promoteMember = useMutation({
        mutationFn: (id: string) => MemberService.promote(id),
        onSuccess: (member) => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success(`${member.firstName} ${member.lastName} est maintenant WORKER`);
        },
        onError: () => {
            toast.error('Erreur lors de la promotion');
        }
    });


    const addChild = useMutation({
        mutationFn: ({ parentId, childData }: { parentId: string; childData: PersonDto }) =>
            MemberService.addChild(parentId, childData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['members', variables.parentId, 'children'] });
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('Enfant ajouté avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de l\'ajout de l\'enfant');
        }
    });

    const getMemberAge = (birthDate: string) => calculateAge(birthDate);
    
    const canPromote = (birthDate: string) => canPromoteToWorker(birthDate);
    
    const getMemberTypeLabel = (member: PersonResponse) => getMemberType(member);

    return {

        members,
        children,
        isLoading,
        loadingChildren,
        error,
        
        createMember,
        updateMember,
        deleteMember,
        promoteMember,
        addChild,
        fetchMemberById,

        getMemberAge,
        canPromote,
        getMemberTypeLabel,
    };
};