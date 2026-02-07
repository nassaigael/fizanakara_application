// src/lib/helpers/stringHelpers.ts
/**
 * Helper pour obtenir les initiales d'un nom
 * @param firstName - Prénom
 * @param lastName - Nom
 * @returns Initiales (ex: "JD" pour John Doe)
 */
export const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Helper pour générer un numéro de séquence formaté
 * @param number - Numéro à formater
 * @param prefix - Préfixe optionnel
 * @returns Numéro formaté (ex: "MBR-001234")
 */
export const formatSequenceNumber = (number: number, prefix: string = 'MBR'): string => {
    return `${prefix}-${String(number).padStart(6, '0')}`;
};

/**
 * Helper pour tronquer un texte avec ellipsis
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Texte tronqué
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Helper pour obtenir le nom complet formaté
 * @param firstName - Prénom
 * @param lastName - Nom
 * @returns Nom complet (ex: "Doe, John")
 */
export const getFullName = (firstName: string, lastName: string): string => {
    return `${lastName}, ${firstName}`;
};

/**
 * Helper pour convertir texte en majuscules/minuscules intelligentes
 * @param text - Texte à convertir
 * @returns Texte avec capitalisation
 */
export const toTitleCase = (text: string): string => {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};