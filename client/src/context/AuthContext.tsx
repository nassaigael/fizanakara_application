import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminResponseModel, LoginRequestModel } from "../lib/types/models/admin.models.types";
import { AuthService } from "../services/auth.service";
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

const AuthContext = createContext<any>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminResponseModel | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () =>{
            const token = localStorage.getItem('accessToken');
            const savedUser = localStorage.getItem('userData');


            if (savedUser && token)
            {
                try{
                    setUser(JSON.parse(savedUser));
                }catch{
                    console.error("Session expirée ou invalide");
                    handleLogoutSilent();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials: LoginRequestModel) => {
        try {
            const data = await AuthService.login(credentials);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('userRole', data.role);
            setUser(data.user);
            navigate('/dashboard');
        } catch (error:any) {
            const message = error.response?.data?.error || "Identifiants invalides";
            toast.error(message.toUpperCase());
            throw error;
        }
    };

    const handleLogoutSilent = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
        navigate('/login');
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

    const isAuthenticated = !!user;
    const isSuperAdmin = (user?.role || localStorage.getItem('userRole')) === 'SUPERADMIN';
    const isAdmin = localStorage.getItem('userRole')?.trim() === 'ADMIN' || localStorage.getItem('userRole')?.trim() === 'SUPERADMIN';

    return (
        <AuthContext.Provider value={{ 
            user,
            token,
            isAuthenticated,
            isSuperAdmin,
            isAdmin,
            loading, 
            login,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);