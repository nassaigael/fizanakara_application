// src/lib/validators/finance.validator.ts
import { z } from "zod";
import { ContributionStatus, PaymentStatus } from "../types/enum.types";

/**
 * Validateur pour créer un paiement
 * Utilité : Valider le montant, date et statut avant enregistrement
 */
export const paymentSchema = z.object({
    amountPayed: z.number().positive("Le montant doit être positif"),
    paymentDate: z.string().refine(date => !isNaN(Date.parse(date)), "Date invalide"),
    paymentStatus: z.nativeEnum(PaymentStatus),
    contributionId: z.string().min(1, "Cotisation ID requis")
});

/**
 * Validateur pour mettre à jour une cotisation
 * Utilité : Valider les changements de statut ou montant
 */
export const updateContributionSchema = z.object({
    amount: z.number().positive("Le montant doit être positif").optional(),
    contributionStatus: z.nativeEnum(ContributionStatus),
    memberId: z.string().optional()
});

/**
 * Validateur pour générer les cotisations annuelles
 * Utilité : Valider l'année avant génération en masse
 */
export const generateContributionSchema = z.object({
    year: z.number()
        .min(2000, "L'année doit être >= 2000")
        .max(new Date().getFullYear() + 5, "L'année dépasse le maximum autorisé")
});

/**
 * Validateur pour filtrer les cotisations
 * Utilité : Valider les paramètres de recherche
 */
export const filterContributionSchema = z.object({
    personId: z.string().optional(),
    year: z.number().optional(),
    status: z.nativeEnum(ContributionStatus).optional()
});