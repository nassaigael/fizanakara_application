import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MemberService from "../services/member.services";
import { PersonModel, PersonResponseModel } from "../lib/types/models/person.models.types";
import toast from "react-hot-toast";

export const useMembers = (parentId?: string) => {
    const queryClient = useQueryClient();

    // Queries
    const { data: members = [], isLoading } = useQuery({
        queryKey: ["members"],
        queryFn: MemberService.getAll
    });

    const { data: children = [], isLoading: loadingChildren } = useQuery({
        queryKey: ["members", parentId, "children"],
        queryFn: () => parentId ? MemberService.getChildren(parentId) : Promise.resolve([]),
        enabled: !!parentId
    });

    // --- MUTATIONS CORRIGÉES ---

    // Création simple
    const createMember = useMutation({
        mutationFn: (data: PersonModel) => MemberService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            toast.success("Membre créé avec succès");
        }
    });

    // Ajout enfant : Typage explicite des variables { parentId, childData }
    const addChild = useMutation<PersonResponseModel, Error, { parentId: string; childData: PersonModel }>({
        mutationFn: ({ parentId, childData }) => MemberService.addChild(parentId, childData),
        onSuccess: (_, variables) => {
            // Ici variables contient bien parentId et childData
            queryClient.invalidateQueries({ queryKey: ["members", variables.parentId, "children"] });
            queryClient.invalidateQueries({ queryKey: ["members"] });
            toast.success("Enfant ajouté");
        }
    });

    // Mise à jour : Typage explicite des variables { id, data }
    const updateMember = useMutation<PersonResponseModel, Error, { id: string; data: PersonModel }>({
        mutationFn: ({ id, data }) => MemberService.update(id, data),
        onSuccess: (_, variables) => {
            // Ici variables contient bien id et data
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
            toast.success("Membre mis à jour");
        }
    });

    // Promotion
    const promoteMember = useMutation({
        mutationFn: (id: string) => MemberService.promote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            toast.success("Membre promu au statut ACTIF");
        }
    });

    // Suppression
    const deleteMember = useMutation({
        mutationFn: (id: string) => MemberService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            toast.success("Membre supprimé");
        }
    });

    return {
        members,
        isLoading,
        children,
        loadingChildren,
        createMember,
        addChild,
        updateMember,
        promoteMember,
        deleteMember
    };
};