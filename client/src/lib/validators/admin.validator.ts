// src/lib/validators/admin.validator.ts
import { z } from "zod";
import { Gender, UserRole } from "../../types/enum.types";

/**
 * Validateur pour la connexion admin
 * Utilité : Valider email et mot de passe avant envoi à l'API
 */
export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

/**
 * Validateur pour l'enregistrement admin
 * Utilité : Valider tous les champs requis pour créer un nouvel admin
 */
export const registerSchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), "Date invalide"),
    gender: z.nativeEnum(Gender),
    phoneNumber: z.string().min(10, "Numéro invalide"),
    imageUrl: z.string().url("URL de l'image invalide").or(z.literal("")),
});

/**
 * Validateur pour la mise à jour du profil
 * Utilité : Valider les modifications du profil (tous les champs sont optionnels)
 */
export const updateAdminSchema = registerSchema.partial().omit({ email: true });

/**
 * Validateur pour l'oubli de mot de passe
 * Utilité : Valider email avant envoi de la demande
 */
export const forgotPasswordSchema = z.object({
    email: z.string().email("Email invalide")
});

/**
 * Validateur pour la réinitialisation du mot de passe
 * Utilité : Valider token et nouveau mot de passe
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token invalide"),
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
});