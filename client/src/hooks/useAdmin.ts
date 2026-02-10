import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminService from "../services/admin.services";
import { 
    LoginRequestModel, 
    RegisterRequestModel, 
    AdminUpdateModel,
} from "../lib/types/models/admin.models.types";
import toast from "react-hot-toast";

export const useAdmin = () => {
    const queryClient = useQueryClient();

    // Récupérer le profil de l'admin connecté
    const { 
        data: currentAdmin, 
        isLoading: loadingCurrentAdmin,
        refetch: refetchCurrentAdmin
    } = useQuery({
        queryKey: ["admin", "me"],
        queryFn: AdminService.getMe,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Récupérer tous les administrateurs
    const { 
        data: allAdmins = [], 
        isLoading: loadingAllAdmins 
    } = useQuery({
        queryKey: ["admins", "all"],
        queryFn: AdminService.getAllAdmins,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Mutation : Connexion
    const login = useMutation({
        mutationFn: (credentials: LoginRequestModel) => AdminService.login(credentials),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "me"] });
            toast.success(`Bienvenue ${data.user.firstName}`);
        },
        onError: () => {
            toast.error("Identifiants invalides");
        }
    });

    // Mutation : Enregistrement d'un nouvel admin
    const register = useMutation({
        mutationFn: (data: RegisterRequestModel) => AdminService.register(data),
        onSuccess: (newAdmin) => {
            queryClient.invalidateQueries({ queryKey: ["admins", "all"] });
            toast.success(`Admin ${newAdmin.firstName} créé avec succès`);
        },
        onError: () => {
            toast.error("Erreur lors de l'enregistrement");
        }
    });

    // Mutation : Mise à jour du profil
    const updateProfile = useMutation({
        mutationFn: (data: AdminUpdateModel) => AdminService.updateMe(data),
        onSuccess: (response) => {
            queryClient.setQueryData(["admin", "me"], response.user);
            queryClient.invalidateQueries({ queryKey: ["admins", "all"] });
            toast.success("Profil mis à jour");
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour");
        }
    });

    // Mutation : Suppression d'un admin
    const deleteAdmin = useMutation({
        mutationFn: (id: string) => AdminService.deleteAdmin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admins", "all"] });
            toast.success("Admin supprimé");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        }
    });

    // Mutation : Suppression du profil connecté
    const deleteMe = useMutation({
        mutationFn: () => AdminService.deleteMe(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "me"] });
            queryClient.invalidateQueries({ queryKey: ["admins", "all"] });
            toast.success("Compte supprimé");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        }
    });

    // Mutation : Demande de réinitialisation de mot de passe
    const forgotPassword = useMutation({
        mutationFn: (email: string) => AdminService.forgotPassword(email),
        onSuccess: () => {
            toast.success("Vérifiez votre email pour réinitialiser votre mot de passe");
        },
        onError: () => {
            toast.error("Email non trouvé");
        }
    });

    // Mutation : Réinitialisation du mot de passe avec token
    const resetPassword = useMutation({
        mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
            AdminService.resetPassword(token, newPassword),
        onSuccess: () => {
            toast.success("Mot de passe réinitialisé avec succès");
        },
        onError: () => {
            toast.error("Erreur lors de la réinitialisation");
        }
    });

    return {
        // Queries
        currentAdmin,
        loadingCurrentAdmin,
        allAdmins,
        loadingAllAdmins,
        refetchCurrentAdmin,
        // Mutations
        login,
        register,
        updateProfile,
        deleteAdmin,
        deleteMe,
        forgotPassword,
        resetPassword
    };
};