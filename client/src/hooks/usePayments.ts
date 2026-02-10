// src/hooks/usePayments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PaymentService from "../services/payment.services";
import { PaymentModel } from "../lib/types/models/payment.models.types";
import toast from "react-hot-toast";

export const usePayments = (contributionId?: string) => {
    const queryClient = useQueryClient();

    // Récupérer les paiements d'une cotisation
    const { data: payments = [], isLoading: loadingPayments } = useQuery({
        queryKey: ["payments", contributionId],
        queryFn: () => contributionId 
            ? PaymentService.getByContributionId(contributionId)
            : Promise.resolve([]),
        enabled: !!contributionId
    });

    // Mutation : Créer un paiement
    const createPayment = useMutation({
        mutationFn: (data: PaymentModel) => PaymentService.create(data),
        onSuccess: (_, { contributionId }) => {
            queryClient.invalidateQueries({ queryKey: ["payments", contributionId] });
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            toast.success("Paiement enregistré");
        }
    });

    // Mutation : Mettre à jour un paiement
    const updatePayment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: PaymentModel }) =>
            PaymentService.update(id, data),
        onSuccess: (_, { data }) => {
            queryClient.invalidateQueries({ queryKey: ["payments", data.contributionId] });
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            toast.success("Paiement mis à jour");
        }
    });

    // Mutation : Supprimer un paiement
    const deletePayment = useMutation({
        mutationFn: (id: string) => PaymentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            toast.success("Paiement supprimé");
        }
    });

    return {
        payments,
        loadingPayments,
        createPayment,
        updatePayment,
        deletePayment
    };
};