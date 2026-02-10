// src/hooks/useTribute.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TributeService from "../services/tribute.services";
import { TributeModel } from "../lib/types/models/localisation.models.types";
import toast from "react-hot-toast";

export const useTribute = (tributeId?: number) => {
    const queryClient = useQueryClient();

    // Récupérer tous les tributs
    const { 
        data: tributes = [], 
        isLoading: loadingTributes 
    } = useQuery({
        queryKey: ["tributes"],
        queryFn: TributeService.getAll,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Récupérer un tribut spécifique
    const { 
        data: currentTribute, 
        isLoading: loadingCurrentTribute 
    } = useQuery({
        queryKey: ["tributes", tributeId],
        queryFn: () => tributeId ? TributeService.getById(tributeId) : Promise.resolve(null),
        enabled: !!tributeId,
    });

    // Mutation : Créer un tribut
    const createTribute = useMutation({
        mutationFn: (data: TributeModel) => TributeService.create(data),
        onSuccess: (newTribute) => {
            queryClient.invalidateQueries({ queryKey: ["tributes"] });
            toast.success(`Tribut "${newTribute.name}" créé`);
        },
        onError: () => {
            toast.error("Erreur lors de la création du tribut");
        }
    });

    // Mutation : Mettre à jour un tribut
    const updateTribute = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TributeModel }) =>
            TributeService.update(id, data),
        onSuccess: (updatedTribute) => {
            queryClient.invalidateQueries({ queryKey: ["tributes"] });
            queryClient.setQueryData(["tributes", updatedTribute.id], updatedTribute);
            toast.success(`Tribut "${updatedTribute.name}" mis à jour`);
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour");
        }
    });

    // Mutation : Supprimer un tribut
    const deleteTribute = useMutation({
        mutationFn: (id: number) => TributeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tributes"] });
            toast.success("Tribut supprimé");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        }
    });

    // Mutation : Supprimer tous les tributs (Action critique)
    const deleteAllTributes = useMutation({
        mutationFn: () => TributeService.deleteAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tributes"] });
            toast.success("Tous les tributs ont été supprimés");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        }
    });

    return {
        tributes,
        loadingTributes,
        currentTribute,
        loadingCurrentTribute,
        createTribute,
        updateTribute,
        deleteTribute,
        deleteAllTributes
    };
};