import { z } from 'zod';
import { ContributionStatus, PaymentStatus } from '../types/index';

export const paymentSchema = z.object({
    amountPaid: z.number().positive('Amount must be positive'),
    paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
    status: z.nativeEnum(PaymentStatus).optional(),
    contributionId: z.string().min(1, 'Contribution ID is required'),
});

export const updateContributionSchema = z.object({
    amount: z.number().positive().optional(),
    status: z.nativeEnum(ContributionStatus),
    memberId: z.string().optional(),
});

export const generateContributionSchema = z.object({
    year: z
        .number()
        .min(2000, 'Minimum year: 2000')
        .max(new Date().getFullYear() + 5, 'Maximum year: ' + (new Date().getFullYear() + 5)),
});

export const filterContributionSchema = z.object({
    personId: z.string().optional(),
    year: z.number().optional(),
    status: z.nativeEnum(ContributionStatus).optional(),
});