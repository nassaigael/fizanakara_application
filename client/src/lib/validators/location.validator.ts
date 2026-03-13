import { z } from 'zod';

export const districtSchema = z.object({
    name: z
        .string()
        .min(2, 'Name too short (min 2 characters)')
        .max(50, 'Name too long (max 50 characters)'),
});

export const tributeSchema = z.object({
    name: z
        .string()
        .min(2, 'Name too short (min 2 characters)')
        .max(50, 'Name too long (max 50 characters)'),
});