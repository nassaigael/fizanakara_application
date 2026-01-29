import { ContributionStatus, PaymentStatus, UserRole, Gender, PersonResponse, MemberStatus } from '../types';

export const getGenderLabel = (gender: Gender | string): string => {
    const labels: Record<string, string> = {
        [Gender.FEMALE]: "Femme",
        [Gender.MALE]: "Homme"
    };
    return labels[gender] || "Non spécifié";
};

export const getMemberStatusLabel = (status: MemberStatus | string): string => {
    const labels: Record<string, string> = {
        [MemberStatus.STUDENT]: "Étudiant",
        [MemberStatus.WORKER]: "Travailleur"
    };
    return labels[status] || "Inconnu";
};

export const getContributionStatusLabel = (status: ContributionStatus): string => {
    const labels: Record<ContributionStatus, string> = {
        [ContributionStatus.PENDING]: "En attente",
        [ContributionStatus.PARTIAL]: "Partiel",
        [ContributionStatus.PAID]: "Payé",
        [ContributionStatus.OVERDUE]: "En retard"
    };
    return labels[status] || "Inconnu";
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
    const labels: Record<PaymentStatus, string> = {
        [PaymentStatus.COMPLETED]: "Complété",
        [PaymentStatus.PENDING]: "En attente",
        [PaymentStatus.REFUNDED]: "Remboursé"
    };
    return labels[status] || "Inconnu";
};

export const getUserRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        [UserRole.ADMIN]: "Administrateur",
        [UserRole.SUPERADMIN]: "Super Administrateur"
    };
    return labels[role] || "Inconnu";
};

export const getStatusColor = (status: any): string => {
    // ContributionStatus
    const contributionColorMap: Record<ContributionStatus, string> = {
        [ContributionStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
        [ContributionStatus.PARTIAL]: "bg-blue-100 text-blue-800 border-blue-200",
        [ContributionStatus.PAID]: "bg-green-100 text-green-800 border-green-200",
        [ContributionStatus.OVERDUE]: "bg-red-100 text-red-800 border-red-200"
    };
    
    // PaymentStatus
    const paymentColorMap: Record<PaymentStatus, string> = {
        [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
        [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
        [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    // MemberStatus
    const memberColorMap: Record<MemberStatus, string> = {
        [MemberStatus.STUDENT]: "bg-blue-100 text-blue-800 border-blue-200",
        [MemberStatus.WORKER]: "bg-purple-100 text-purple-800 border-purple-200"
    };

    if (Object.values(ContributionStatus).includes(status)) {
        return contributionColorMap[status as ContributionStatus] || "bg-gray-100 text-gray-800 border-gray-200";
    }
    
    if (Object.values(PaymentStatus).includes(status)) {
        return paymentColorMap[status as PaymentStatus] || "bg-gray-100 text-gray-800 border-gray-200";
    }
    
    if (Object.values(MemberStatus).includes(status)) {
        return memberColorMap[status as MemberStatus] || "bg-gray-100 text-gray-800 border-gray-200";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200";
};

export const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export const canPromoteToWorker = (birthDate: string): boolean => {
    return calculateAge(birthDate) >= 18;
};

export const formatDate = (date: string, format: 'short' | 'long' = 'short'): string => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = format === 'short'
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    return d.toLocaleDateString('fr-FR', options);
};

export const daysUntil = (date: string): number => {
    const target = new Date(date);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================
// HELPERS DE MEMBRE
// ============================================

export const getMemberType = (member: PersonResponse): string => {
    const age = calculateAge(member.birthDate);
    
    if (member.status === MemberStatus.STUDENT) {
        return age < 18 ? 'Enfant' : 'Étudiant';
    }
    return 'Travailleur';
};

/**
 * Calcule le montant de cotisation selon le statut et l'âge
 */
export const calculateContributionAmount = (
    member: PersonResponse, 
    baseAmount: number
): number => {
    if (member.status === MemberStatus.WORKER) {
        return baseAmount;
    }
    
    const age = calculateAge(member.birthDate);
    return age < 18 ? 0 : baseAmount / 2;
};

export const canHaveChildren = (member: PersonResponse): boolean => {
    return member.status === MemberStatus.WORKER;
};

// ============================================
// HELPERS DE COTISATION
// ============================================

export const getContributionStatusInfo = (status: string) => {
    const statusMap = {
        PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', progress: 0 },
        PARTIAL: { label: 'Partiel', color: 'bg-blue-100 text-blue-800', progress: 50 },
        PAID: { label: 'Payé', color: 'bg-green-100 text-green-800', progress: 100 },
        OVERDUE: { label: 'En retard', color: 'bg-red-100 text-red-800', progress: 0 }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
};

export const getPaymentPercentage = (totalPaid: number, amount: number): number => {
    if (amount === 0) return 0;
    return Math.min(100, Math.round((totalPaid / amount) * 100));
};

// ============================================
// HELPERS DE FORMATAGE
// ============================================

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-MG', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace('MGA', 'Ar').trim();
};

/**
 * Génère les initiales d'une personne
 */
export const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
};

export const truncate = (text: string, maxLength: number = 50): string => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// ============================================
// HELPERS D'ERREUR
// ============================================

/**
 * Extrait un message d'erreur lisible
 */
export const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.response?.data?.error) {
        return error.response.data.error;
    }
    if (error?.message) {
        return error.message;
    }
    return 'Une erreur inattendue est survenue';
};

/**
 * Extrait un message d'erreur depuis l'API (peut être une string directe)
 */
export const getApiErrorMessage = (error: any): string => {
    if (error?.response?.data) {
        // Si la réponse est une string (comme pour DELETE)
        if (typeof error.response.data === 'string') {
            return error.response.data;
        }
        // Si c'est un objet avec message
        if (error.response.data.message) {
            return error.response.data.message;
        }
    }
    return getErrorMessage(error);
};

// ============================================
// HELPERS DE PERMISSIONS
// ============================================

export const can = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy: Record<string, number> = {
        'ADMIN': 1,
        'SUPERADMIN': 2
    };
    
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

// ============================================
// HELPERS DE THÈME
// ============================================

export const darkenColor = (hex: string, amount: number): string => {
    const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
    const num = parseInt(hex.replace("#", ""), 16);
    const r = clamp((num >> 16) - amount);
    const g = clamp(((num >> 8) & 0xff) - amount);
    const b = clamp((num & 0xff) - amount);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;
};

export const applyThemeToDOM = (color: string): void => {
    const root = document.documentElement;
    const dark = darkenColor(color, 40);
    const light = `${color}20`;

    root.style.setProperty("--app-primary", color);
    root.style.setProperty("--app-primary-dark", dark);
    root.style.setProperty("--app-primary-light", light);

    localStorage.setItem("app-theme-color", color);
};