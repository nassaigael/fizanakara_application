// src/constants/index.ts
import { 
    AiOutlineUser, AiOutlineSetting, AiOutlineLogout, 
    AiOutlineMessage, AiOutlineDashboard, 
    AiOutlineUsergroupAdd, AiOutlineWallet,
    AiOutlineCheckCircle, AiOutlineClockCircle,
    AiOutlineInfoCircle, AiOutlineWarning
} from "react-icons/ai";
import { MemberStatus } from "../types/enum.types";

// ==========================================
// 1. CONFIGURATION GITHUB ASSETS
// ==========================================
const GITHUB_ACCOUNT = "mekill404";
const REPO_NAME = "image_membre_fizankara";
const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_ACCOUNT}/${REPO_NAME}/main`;

export const GITHUB_URLS = {
    ADMIN: `${BASE_RAW_URL}/admin`,
    MEMBER: `${BASE_RAW_URL}/membre`,
    ASSETS: `${BASE_RAW_URL}/assets/images`
} as const;

/**
 * Génère l'URL de l'image avec fallback automatique vers UI-Avatars
 */
export const getImageUrl = (
    imagePath: string | null | undefined,
    nameForAvatar?: string,
    category: 'admin' | 'member' | 'assets' = 'member'
): string => {
    if (!imagePath || imagePath.trim() === "") {
        const initials = nameForAvatar ? encodeURIComponent(nameForAvatar) : "User";
        return `https://ui-avatars.com/api/?name=${initials}&background=FF4B4B&color=fff&bold=true`;
    }

    if (imagePath.startsWith('http')) return imagePath;

    let cleanPath = imagePath.trim().replace(/\s+/g, '_');
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!extensions.some(ext => cleanPath.toLowerCase().endsWith(ext))) {
        cleanPath += '.jpg';
    }

    const base = category === 'admin' ? GITHUB_URLS.ADMIN : 
                 category === 'assets' ? GITHUB_URLS.ASSETS : 
                 GITHUB_URLS.MEMBER;

    return `${base}/${cleanPath}`;
};

// ==========================================
// 2. DESIGN TOKENS (COULEURS & UI)
// ==========================================
export const THEME = {
    colors: {
        primary: "#FF4B4B",     // Rouge Fizanakara
        secondary: "#1A1A1A",   // Noir SideBar
        accent: "#F5F5F7",      // Fond de page gris clair
        text: "#2D2D2D",
        muted: "#6B7280",
        white: "#FFFFFF"
    },
    animations: {
        transition: "transition-all duration-300 ease-in-out",
        hoverScale: "hover:scale-[1.02] active:scale-[0.98]",
    },
    shadows: {
        card: "shadow-sm border border-gray-100 hover:shadow-md",
    }
} as const;

// ==========================================
// 3. ÉTATS DES COTISATIONS & SITUATIONS
// ==========================================
export const COTISATION_UI = {
    PAID: { 
        label: "Payé", 
        color: "text-green-600", 
        bg: "bg-green-50", 
        border: "border-green-200",
        icon: AiOutlineCheckCircle 
    },
    PENDING: { 
        label: "En attente", 
        color: "text-amber-600", 
        bg: "bg-amber-50", 
        border: "border-amber-200",
        icon: AiOutlineClockCircle 
    },
    PARTIAL: { 
        label: "Partiel", 
        color: "text-blue-600", 
        bg: "bg-blue-50", 
        border: "border-blue-200",
        icon: AiOutlineInfoCircle 
    },
    OVERDUE: { 
        label: "En retard", 
        color: "text-red-600", 
        bg: "bg-red-50", 
        border: "border-red-200",
        icon: AiOutlineWarning 
    },
} as const;

export const SITUATIONS = [
    { label: "Étudiant", value: "STUDENT" as MemberStatus },
    { label: "Travailleur", value: "WORKER" as MemberStatus }
] as const;

// ==========================================
// 4. NAVIGATION CONFIGURATION
// ==========================================
export const SIDEBAR_LINKS = [
    { title: "Tableau de bord", path: "/admin/dashboard", icon: AiOutlineDashboard },
    { title: "Membres", path: "/admin/members", icon: AiOutlineUsergroupAdd },
    { title: "Cotisations", path: "/admin/cotisations", icon: AiOutlineWallet },
    { title: "Configuration", path: "/admin/settings", icon: AiOutlineSetting },
] as const;

export const PROFILE_MENU = [
    { label: "Mon Profil", path: "/admin/profile", icon: AiOutlineUser },
    { label: "Messages", path: "/admin/messages", icon: AiOutlineMessage },
    { label: "Paramètres", path: "/admin/settings", icon: AiOutlineSetting },
    { label: "Déconnexion", path: "/logout", icon: AiOutlineLogout, isDestructive: true },
] as const;

// ==========================================
// 5. STYLES RÉUTILISABLES (TAILWIND)
// ==========================================
export const UI_CLASSES = {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    card: `bg-white rounded-2xl ${THEME.shadows.card} ${THEME.animations.transition}`,
    input: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF4B4B] focus:border-transparent outline-none transition-all",
    buttonPrimary: `bg-[#FF4B4B] text-white px-6 py-2 rounded-lg font-medium ${THEME.animations.hoverScale} ${THEME.animations.transition} disabled:bg-gray-400`,
    buttonOutline: `border-2 border-[#FF4B4B] text-[#FF4B4B] px-6 py-2 rounded-lg font-medium hover:bg-red-50 ${THEME.animations.transition}`,
} as const;