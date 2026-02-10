// src/hooks/useDistrict.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DistrictService from "../services/district.services";
import { DistrictModel } from "../lib/types/models/localisation.models.types";
import toast from "react-hot-toast";

export const useDistrict = (districtId?: number) => {
    const queryClient = useQueryClient();

    // Récupérer tous les districts
    const { 
        data: districts = [], 
        isLoading: loadingDistricts 
    } = useQuery({
        queryKey: ["districts"],
        queryFn: DistrictService.getAll,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Récupérer un district spécifique
    const { 
        data: currentDistrict, 
        isLoading: loadingCurrentDistrict 
    } = useQuery({
        queryKey: ["districts", districtId],
        queryFn: () => districtId ? DistrictService.getById(districtId) : Promise.resolve(null),
        enabled: !!districtId,
    });

    // Mutation : Créer un district
    const createDistrict = useMutation({
        mutationFn: (data: DistrictModel) => DistrictService.create(data),
        onSuccess: (newDistrict) => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
            toast.success(`District "${newDistrict.name}" créé`);
        },
        onError: () => {
            toast.error("Erreur lors de la création du district");
        }
    });

    // Mutation : Mettre à jour un district
    const updateDistrict = useMutation({
        mutationFn: ({ id, data }: { id: number; data: DistrictModel }) =>
            DistrictService.update(id, data),
        onSuccess: (updatedDistrict) => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
            queryClient.setQueryData(["districts", updatedDistrict.id], updatedDistrict);
            toast.success(`District "${updatedDistrict.name}" mis à jour`);
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour");
        }
    });

    // Mutation : Supprimer un district
    const deleteDistrict = useMutation({
        mutationFn: (id: number) => DistrictService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
            toast.success("District supprimé");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        }
    });

    // Mutation : Supprimer tous les districts (Action critique)
    const deleteAllDistricts = useMutation({
        mutationFn: () => DistrictService.deleteAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["districts"] });
            toast.success("Tous les districts ont été supprimés");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        }
    });

    return {
        districts,
        loadingDistricts,
        currentDistrict,
        loadingCurrentDistrict,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        deleteAllDistricts
    };
};