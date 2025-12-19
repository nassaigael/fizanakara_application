import { z } from "zod";
import { ContributionStatus, PaymentStatus } from "../types/index";

export const paymentSchema = z.object({
    amountPayed: z.number().positive("Montant positif requis"),
    paymentDate: z.string().refine(date => !isNaN(Date.parse(date)), "Date invalide"),
    paymentStatus: z.nativeEnum(PaymentStatus),
    contributionId: z.string().min(1, "ID cotisation requis")
});

export const updateContributionSchema = z.object({
    amount: z.number().positive().optional(),
    contributionStatus: z.nativeEnum(ContributionStatus),
    memberId: z.string().optional()
});

export const generateContributionSchema = z.object({
    year: z.number()
        .min(2000, "Année minimum: 2000")
        .max(new Date().getFullYear() + 5, "Année maximum: " + (new Date().getFullYear() + 5))
});

export const filterContributionSchema = z.object({
    personId: z.string().optional(),
    year: z.number().optional(),
    status: z.nativeEnum(ContributionStatus).optional()
});