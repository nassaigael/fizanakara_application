import { z } from "zod";
import { Gender, MemberStatus } from "../types/enum.types";

/**
 * Validateur pour créer/modifier un membre
 * Utilité : Valider les infos personnelles avant création ou mise à jour
 */
export const personSchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), "Date invalide"),
    gender: z.nativeEnum(Gender),
    phoneNumber: z.string().min(10, "Numéro invalide"),
    districtId: z.number().positive("Sélectionnez un district"),
    tributeId: z.number().positive("Sélectionnez un hommage"),
    status: z.nativeEnum(MemberStatus),
    imageUrl: z.string()
        .max(255, "Le nom du fichier est trop long")
        .or(z.literal(""))
        .optional(),});

/**
 * Validateur pour ajouter un enfant
 * Utilité : Valider les données de l'enfant et l'ID parent
 */
export const addChildSchema = z.object({
    parentId: z.string().min(1, "Parent ID requis"),
    childData: personSchema
});