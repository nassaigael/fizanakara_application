import { z } from "zod";

export const districtSchema = z.object({
    name: z.string()
        .min(2, "Nom trop court (min 2 caractères)")
        .max(50, "Nom trop long (max 50 caractères)")
});

export const tributeSchema = z.object({
    name: z.string()
        .min(2, "Nom trop court (min 2 caractères)")
        .max(50, "Nom trop long (max 50 caractères)")
});