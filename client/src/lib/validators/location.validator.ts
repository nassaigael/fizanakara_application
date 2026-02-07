// src/lib/validators/location.validator.ts
import { z } from "zod";

/**
 * Validateur pour créer/modifier un district
 * Utilité : Valider le nom du district avant création/modification
 */
export const districtSchema = z.object({
    name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom ne doit pas dépasser 50 caractères")
});

/**
 * Validateur pour créer/modifier un tribut
 * Utilité : Valider le nom du tribut avant création/modification
 */
export const tributeSchema = z.object({
    name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom ne doit pas dépasser 50 caractères")
});