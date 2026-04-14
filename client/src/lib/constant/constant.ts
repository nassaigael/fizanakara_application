import {
    AiOutlineCheckCircle,
    AiOutlineClockCircle,
    AiOutlineInfoCircle,
    AiOutlineWarning,
} from 'react-icons/ai';

import man from "../../assets/default-avatar-man.png";
import woman from "../../assets/default-avatar-woman.png";
import admin from "../../assets/default-avatar-admin.png";
import defaultAvatar from "../../assets/default-avatar.png";


import { MemberStatus, Gender } from '../types';

const GITHUB_ACCOUNT = 'nassaigael';
const REPO_NAME = 'image_membre_fizanakara';
const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_ACCOUNT}/${REPO_NAME}/main`;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

export const GITHUB_URLS = {
    ADMIN: `${BASE_RAW_URL}/admin`,
    MEMBER: `${BASE_RAW_URL}/member`,
    ASSETS: `${BASE_RAW_URL}/assets/images`,
} as const;

export const DEFAULT_IMAGES = {
    [Gender.MALE]: man,
    [Gender.FEMALE]: woman,
    ADMIN: admin,
    DEFAULT: defaultAvatar,
} as const;

export const getDefaultImage = (
    gender?: Gender,
    type: 'admin' | 'member' = 'member'
): string => {
    if (type === 'admin') {
        return DEFAULT_IMAGES.ADMIN;
    }
    if (gender === Gender.MALE) {
        return DEFAULT_IMAGES[Gender.MALE];
    }
    if (gender === Gender.FEMALE) {
        return DEFAULT_IMAGES[Gender.FEMALE];
    }
    return DEFAULT_IMAGES.DEFAULT;
};

export const getImageUrl = (
    imagePath: string | null | undefined,
    category: 'admin' | 'member' | 'assets' = 'member',
    gender?: Gender,
): string => {
    if (!imagePath) {
        return getDefaultImage(gender, category === 'admin' ? 'admin' : 'member');
    }

    if (imagePath.startsWith('http://') ||
        imagePath.startsWith('https://') ||
        imagePath.startsWith('data:') ||
        imagePath.startsWith('/')) {
        return imagePath;
    }

    let cleanPath = imagePath.trim().replace(/\s+/g, '_');

    const hasExtension = IMAGE_EXTENSIONS.some((ext) => cleanPath.toLowerCase().endsWith(ext));
    if (!hasExtension) {
        cleanPath += '.jpg';
    }

    const base =
        category === 'admin'
            ? GITHUB_URLS.ADMIN
            : category === 'assets'
                ? GITHUB_URLS.ASSETS
                : GITHUB_URLS.MEMBER;
    const fullUrl = `${base}/${cleanPath}`;

    return fullUrl;
};

export const getValidImageUrl = async (
    imagePath: string | null | undefined,
    category: 'admin' | 'member' | 'assets' = 'member',
    gender?: Gender,
): Promise<string> => {
    const url = getImageUrl(imagePath, category, gender);

    if (url.startsWith('/')) {
        return url;
    }

    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            return url;
        }
    } catch (error) {
        console.warn(`Image not found: ${url}`, error);
    }

    return getDefaultImage(gender, category === 'admin' ? 'admin' : 'member');
};

export const FONT = {
    h1: 'font-black text-4xl',
    h2: 'font-bold text-2xl',
    small: 'text-sm',
    muted: 'text-sm text-gray-500',
    default: '',
} as const;

export const CARD = {
    default: 'bg-white rounded-2xl shadow-md border border-gray-100',
} as const;

export const THEME = {
    colors: {
        primary: '#E51A1A',
        secondary: '#1A1A1A',
        accent: '#F5F5F7',
        text: '#2D2D2D',
        muted: '#6B7280',
        white: '#FFFFFF',
    },
    animations: {
        transition: 'transition-all duration-300 ease-in-out',
        hoverScale: 'hover:scale-[1.02] active:scale-[0.98]',
    },
    shadows: {
        card: 'shadow-sm border border-gray-100 hover:shadow-md',
    },
    font: FONT,
    card: CARD,
} as const;

export const CONTRIBUTION_STATUS_UI = {
    PAID: {
        label: 'Payé',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: AiOutlineCheckCircle,
    },
    PENDING: {
        label: 'En attente',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: AiOutlineClockCircle,
    },
    PARTIAL: {
        label: 'Partiel',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: AiOutlineInfoCircle,
    },
    OVERDUE: {
        label: 'En retard',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: AiOutlineWarning,
    },
} as const;

export const COTISATION_UI = CONTRIBUTION_STATUS_UI;

export const SITUATIONS = [
    { label: 'Étudiant', value: MemberStatus.STUDENT },
    { label: 'Travailleur', value: MemberStatus.WORKER },
] as const;

export const UI_CLASSES = {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    card: `bg-white rounded-2xl ${THEME.shadows.card} ${THEME.animations.transition}`,
    input: 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E51A1A] focus:border-transparent outline-none transition-all',
    buttonPrimary: `bg-[#E51A1A] text-white px-6 py-2 rounded-lg font-medium ${THEME.animations.hoverScale} ${THEME.animations.transition} disabled:bg-gray-400 disabled:cursor-not-allowed`,
    buttonOutline: `border-2 border-[#E51A1A] text-[#E51A1A] px-6 py-2 rounded-lg font-medium hover:bg-red-50 ${THEME.animations.transition}`,
} as const;