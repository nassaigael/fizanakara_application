import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ContributionService from "../services/contribution.services";
import PaymentService from "../services/payment.services";
import { PaymentModel } from "../lib/types/models/payment.models.types";
import { ContributionUpdateModel, ContributionYearModel } from "../lib/types/models/contribution.models.types";
import toast from "react-hot-toast";

export const useFinance = (personId?: string, year?: number) => {
    const queryClient = useQueryClient();

    // Récupérer les contributions (filtrées ou non)
    const { data: contributions = [], isLoading: loadingContribs } = useQuery({
        queryKey: ["contributions", personId, year],
        queryFn: () => personId && year 
            ? ContributionService.getByPersonAndYear(personId, year)
            : ContributionService.getAll(),
    });

    // Mutation : Créer un paiement
    const addPayment = useMutation({
        mutationFn: (data: PaymentModel) => PaymentService.create(data),
        onSuccess: (_, { contributionId }) => {
            // CRUCIAL : On invalide les cotisations ET les paiements
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            queryClient.invalidateQueries({ queryKey: ["payments", contributionId] });
            toast.success("Paiement enregistré");
        }
    });

    // Mutation : Mettre à jour une cotisation
    const updateContribution = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ContributionUpdateModel }) =>
            ContributionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            toast.success("Cotisation mise à jour");
        }
    });

    // Mutation : Supprimer une cotisation
    const deleteContribution = useMutation({
        mutationFn: (id: string) => ContributionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            toast.success("Cotisation supprimée");
        }
    });

    // Mutation : Générer les cotisations de l'année (Action SUPERADMIN/ADMIN)
    const generateAnnualContribs = useMutation({
        mutationFn: (data: ContributionYearModel) => ContributionService.generateForYear(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contributions"] });
            toast.success("Cotisations annuelles générées");
        }
    });

    return { 
        contributions, 
        loadingContribs, 
        addPayment, 
        updateContribution,
        deleteContribution,
        generateAnnualContribs 
    };
};