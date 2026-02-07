// src/lib/helpers/enumHelpers.ts
import { Gender, MemberStatus, ContributionStatus, PaymentStatus, UserRole } from "../types/enum.types";

/**
 * Helper pour obtenir le label en français d'un genre
 * @param gender - Enum Gender
 * @returns Texte formaté en français
 */
export const getGenderLabel = (gender: Gender): string => {
    const labels: Record<Gender, string> = {
        [Gender.FEMELLE]: "Femme",
        [Gender.HOMME]: "Homme"
    };
    return labels[gender] || "Inconnu";
};

/**
 * Helper pour obtenir le label d'un statut de membre
 * @param status - Enum MemberStatus
 * @returns Texte formaté en français
 */
export const getMemberStatusLabel = (status: MemberStatus): string => {
    const labels: Record<MemberStatus, string> = {
        [MemberStatus.TRAVAILLEUR]: "Travailleur",
        [MemberStatus.ETUDIANT]: "Étudiant"
    };
    return labels[status] || "Inconnu";
};

/**
 * Helper pour obtenir le label d'un statut de cotisation
 * @param status - Enum ContributionStatus
 * @returns Texte formaté en français
 */
export const getContributionStatusLabel = (status: ContributionStatus): string => {
    const labels: Record<ContributionStatus, string> = {
        [ContributionStatus.PENDING]: "En attente",
        [ContributionStatus.PARTIAL]: "Partiellement payée",
        [ContributionStatus.PAID]: "Payée",
        [ContributionStatus.OVERDUE]: "En retard"
    };
    return labels[status] || "Inconnu";
};

/**
 * Helper pour obtenir le label d'un statut de paiement
 * @param status - Enum PaymentStatus
 * @returns Texte formaté en français
 */
export const getPaymentStatusLabel = (status: PaymentStatus): string => {
    const labels: Record<PaymentStatus, string> = {
        [PaymentStatus.COMPLETED]: "Complété",
        [PaymentStatus.PENDING]: "En attente",
        [PaymentStatus.REFUNDED]: "Remboursé"
    };
    return labels[status] || "Inconnu";
};

/**
 * Helper pour obtenir le label d'un rôle utilisateur
 * @param role - Enum UserRole
 * @returns Texte formaté en français
 */
export const getUserRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        [UserRole.ADMIN]: "Administrateur",
        [UserRole.SUPERADMIN]: "Super Administrateur"
    };
    return labels[role] || "Inconnu";
};

/**
 * Helper pour obtenir la couleur associée à un statut
 * @param status - Statut (contribution ou paiement)
 * @returns Code couleur (utility tailwind)
 */
export const getStatusColor = (status: ContributionStatus | PaymentStatus): string => {
    const contributionColors: Record<ContributionStatus, string> = {
        [ContributionStatus.PENDING]: "bg-yellow-100 text-yellow-800",
        [ContributionStatus.PARTIAL]: "bg-blue-100 text-blue-800",
        [ContributionStatus.PAID]: "bg-green-100 text-green-800",
        [ContributionStatus.OVERDUE]: "bg-red-100 text-red-800"
    };
    const paymentColors: Record<PaymentStatus, string> = {
        [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800",
        [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
        [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-800"
    };

    if (Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        return paymentColors[status as PaymentStatus] || "bg-gray-100 text-gray-800";
    }
    return contributionColors[status as ContributionStatus] || "bg-gray-100 text-gray-800";
};

