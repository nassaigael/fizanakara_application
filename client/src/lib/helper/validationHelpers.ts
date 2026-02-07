// src/lib/helpers/validationHelpers.ts
/**
 * Helper pour valider un numéro de téléphone
 * @param phone - Numéro de téléphone
 * @returns true si valide
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    // Accepte les numéros avec au moins 10 chiffres
    return /^\d{10,}$/.test(phone.replace(/\D/g, ''));
};

/**
 * Helper pour valider une URL d'image
 * @param url - URL à valider
 * @returns true si valide
 */
export const isValidImageUrl = (url: string): boolean => {
    if (!url) return true; // URL vide est acceptable
    try {
        const urlObj = new URL(url);
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const extension = urlObj.pathname.split('.').pop()?.toLowerCase();
        return validExtensions.includes(extension || '');
    } catch {
        return false;
    }
};

/**
 * Helper pour valider un email
 * @param email - Email à valider
 * @returns true si valide
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Helper pour valider une date de naissance (doit être < 18 ans du futur)
 * @param birthDate - Date de naissance
 * @returns true si valide
 */
export const isValidBirthDate = (birthDate: string): boolean => {
    const date = new Date(birthDate);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() + 18, today.getMonth(), today.getDate());
    
    return date < maxDate && date < today;
};