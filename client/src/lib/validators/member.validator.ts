import { z } from "zod";
import { Gender, MemberStatus } from "../types/index";

export const personSchema = z.object({
    firstName: z.string().min(2, "Prénom requis (min 2 caractères)"),
    lastName: z.string().min(2, "Nom requis (min 2 caractères)"),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), "Date invalide (format YYYY-MM-DD)"),
    gender: z.nativeEnum(Gender),
    phoneNumber: z.string()
        .min(8, "Téléphone: minimum 8 chiffres")
        .regex(/^[0-9+\-\s]+$/, "Format de téléphone invalide"),
    districtId: z.number().positive("District requis"),
    tributeId: z.number().positive("Tribu requise"),
    status: z.nativeEnum(MemberStatus),
    imageUrl: z.string().max(500).optional().nullable(),
    parentId: z.string().optional().nullable(),
});

export const addChildSchema = z.object({
    parentId: z.string().min(1, "Parent requis"),
    childData: personSchema
});

export type PersonFormData = z.infer<typeof personSchema>;