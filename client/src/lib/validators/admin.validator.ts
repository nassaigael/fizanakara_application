import { z } from "zod";
import { Gender } from "../types/index";

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe: minimum 6 caractères")
});

export const registerSchema = z.object({
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe: minimum 6 caractères"),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), "Date invalide"),
    gender: z.nativeEnum(Gender),
    phoneNumber: z.string().min(10, "Téléphone: minimum 10 chiffres"),
    // The field accepts either a GitHub filename or a full URL.  A blank value
    // is permitted so that users don't have to provide an avatar when creating
    // or updating accounts.
    imageUrl: z.string().optional(),
});

export const updateAdminSchema = registerSchema.partial().omit({ email: true });

export const forgotPasswordSchema = z.object({
    email: z.string().email("Email invalide")
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token requis"),
    newPassword: z.string().min(6, "Mot de passe: minimum 6 caractères"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
});