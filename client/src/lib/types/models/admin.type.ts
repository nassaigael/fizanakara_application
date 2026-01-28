import { Gender, Role } from "./common.type";

/**
 * Base de l'utilisateur (Champs communs à toutes les étapes)
 * Correspond à la structure logique partagée par le Backend
 */
export interface IBaseAdmin {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: Gender;
    imageUrl: string;
    phoneNumber: string;
    email: string;
}

/**
 * Pour l'enregistrement (RegisterRequestDTO)
 * On ajoute le mot de passe qui est requis à la création
 */
export interface RegisterRequestDTO extends IBaseAdmin {
   password: string;
}

/**
 * Pour la réponse API (AdminResponseDto)
 * On ajoute les données générées par le serveur (ID, metadata)
 */
export interface AdminResponseDto extends IBaseAdmin {
   id: string;
   verified: boolean;
   createdAt: string;
   role: Role;
}

/**
 * Pour la mise à jour (UpdateAdminDto)
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface UpdateAdminDto extends Partial<RegisterRequestDTO> {
   verified?: boolean;
}

/**
 * Authentification (LoginRequestDTO)
 * Strictement limité aux identifiants
 */
export interface LoginRequestDTO extends Pick<IBaseAdmin, 'email'> {
   password: string;
}

