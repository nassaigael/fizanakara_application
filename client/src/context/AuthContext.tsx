import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// Importation avec les noms corrigés (Dto au lieu de DTO)
import { AdminResponseDto, LoginRequestDto } from "../lib/types/models/admin.type";
import AuthService from "../services/auth.service";
import toast from "react-hot-toast";

interface AuthContextType {
    user: AdminResponseDto | null;
    token: string | null;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequestDto) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AdminResponseDto | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem("auth_token");
            if (savedToken) {
                try {
                    // Récupération via /admins/me
                    const userData = await AuthService.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error("Session expirée ou invalide");
                    handleLogoutSilent();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials: LoginRequestDto) => {
        try {
            const response = await AuthService.login(credentials);
            // On s'assure que la structure match avec le retour du backend Spring
            const { accessToken, admin } = response.data;

            localStorage.setItem("auth_token", accessToken);
            setToken(accessToken);
            setUser(admin);
            
            toast.success(`Bienvenue, ${admin.firstName} !`);
        } catch (error: any) {
            const message = error.response?.data?.message || "Identifiants invalides";
            toast.error(message.toUpperCase());
            throw error;
        }
    };

    /**
     * Version silencieuse pour l'initialisation (évite les toasts au chargement)
     */
    const handleLogoutSilent = () => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
    };

    const logout = () => {
        handleLogoutSilent();
        toast.success("DÉCONNEXION RÉUSSIE");
    };

    const refreshUser = async () => {
        try {
            const userData = await AuthService.getMe();
            setUser(userData);
        } catch (error) {
            console.error("Échec du rafraîchissement des données admin");
        }
    };

    // Dérivations d'état
    const isAuthenticated = !!token && !!user;
    
    /**
     * Vérification du rôle Super Admin. 
     * Note: On compare avec la valeur exacte de votre Enum Java.
     */
    const isSuperAdmin = user?.role === "SUPERADMIN";

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isAuthenticated, 
            isSuperAdmin, 
            isLoading, 
            login, 
            logout, 
            refreshUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};