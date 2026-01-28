import { 
    AiOutlineUser, AiOutlineSetting, AiOutlineLogout, 
    AiOutlineMessage, AiOutlineDashboard, 
    AiOutlineUsergroupAdd, AiOutlineWallet 
} from "react-icons/ai";
import { MemberStatus } from "../types/models/person.type";

// --- CONFIGURATION GITHUB ASSETS ---
const GITHUB_ACCOUNT = "mekill404";
const REPO_NAME = "image_membre_fizankara";
const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_ACCOUNT}/${REPO_NAME}/main`;

export const GITHUB_URLS = {
    ADMIN: `${BASE_RAW_URL}/admin`,
    MEMBER: `${BASE_RAW_URL}/membre`,
    ASSETS: `${BASE_RAW_URL}/assets/images`
} as const;

// --- HELPER: GENERATE IMAGE URL ---
export const getImageUrl = (
    imagePath: string | null | undefined,
    nameForAvatar?: string,
    category: 'admin' | 'member' | 'assets' = 'member'
): string => {
    // 1. Fallback si pas d'image : UI Avatars (Style Fizanakara avec Background Rouge)
    if (!imagePath || imagePath.trim() === "") {
        const initials = nameForAvatar ? encodeURIComponent(nameForAvatar) : "User";
        return `https://ui-avatars.com/api/?name=${initials}&background=FF4B4B&color=fff&bold=true`;
    }

    // 2. Si c'est déjà une URL complète
    if (imagePath.startsWith('http')) return imagePath;

    // 3. Nettoyage du path (remplacement des espaces par des underscores)
    let cleanPath = imagePath.trim().replace(/\s+/g, '_');

    // 4. Ajout de l'extension par défaut si manquante
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!extensions.some(ext => cleanPath.toLowerCase().endsWith(ext))) {
        cleanPath += '.jpg';
    }

    // 5. Mapping des catégories vers les URLs GitHub
    const base = category === 'admin' ? GITHUB_URLS.ADMIN : 
                 category === 'assets' ? GITHUB_URLS.ASSETS : 
                 GITHUB_URLS.MEMBER;

    return `${base}/${cleanPath}`;
};

// --- UI CONFIGURATIONS ---
export const COTISATION_UI_STATUS = {
    PAID: { label: "Payé", color: "text-green-600", bg: "bg-green-50", icon: "AiOutlineCheck" },
    PENDING: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50", icon: "AiOutlineClockCircle" },
    PARTIAL: { label: "Partiel", color: "text-blue-600", bg: "bg-blue-50", icon: "AiOutlineInfoCircle" },
    OVERDUE: { label: "En retard", color: "text-red-600", bg: "bg-red-50", icon: "AiOutlineWarning" },
} as const;

export const SITUATIONS = [
    { label: "Étudiant", value: "STUDENT" as MemberStatus },
    { label: "Travailleur", value: "WORKER" as MemberStatus }
] as const;

// --- NAVIGATION ---
export const sidebarLinks = [
    { title: "Tableau de bord", path: "/admin/dashboard", icon: AiOutlineDashboard },
    { title: "Membres", path: "/admin/members", icon: AiOutlineUsergroupAdd },
    { title: "Cotisations", path: "/admin/cotisations", icon: AiOutlineWallet },
    { title: "Paramètres", path: "/admin/settings", icon: AiOutlineSetting },
] as const;

export const PROFILE_MENU = [
    { label: "Mon Profil", path: "profiles", icon: AiOutlineUser },
    { label: "Paramètres", path: "settings", icon: AiOutlineSetting },
    { label: "Messages", path: "messages", icon: AiOutlineMessage },
    { label: "Déconnexion", path: "/", icon: AiOutlineLogout, isDestructive: true },
];