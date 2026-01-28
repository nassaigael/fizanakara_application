import { z } from "zod";

const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

export const adminBaseSchema = z.object({
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    birthDate: z.string().refine((date) => calculateAge(date) >= 18, {
        message: "Un administrateur doit être majeur (>= 18 ans)"
    }),
    gender: z.enum(["MALE", "FEMALE"]),
    imageUrl: z.string().url("URL d'image invalide").or(z.string().min(1)),
    phoneNumber: z.string().regex(/^[0-9]{10,}$/, "Numéro de téléphone invalide"),
    email: z.string().email("Email invalide"),
});

export const loginSchema = z.object({
    email: z.string().email("Email requis"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export const registerSchema = adminBaseSchema.extend({
    password: z.string().min(6, "Le mot de passe est trop court"),
});