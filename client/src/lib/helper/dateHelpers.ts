// src/lib/helpers/dateHelpers.ts
/**
 * Helper pour formater une date en français
 * @param date - Date à formater
 * @param format - Format désiré (court/long)
 * @returns Date formatée
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = format === 'short'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    
    return dateObj.toLocaleDateString('fr-FR', options);
};

/**
 * Helper pour calculer l'âge à partir de la date de naissance
 * @param birthDate - Date de naissance
 * @returns Âge en années
 */
export const calculateAge = (birthDate: string | Date): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

/**
 * Helper pour vérifier si une personne peut être promue (18+ ans)
 * @param birthDate - Date de naissance
 * @returns true si l'âge >= 18
 */
export const isEligibleForPromotion = (birthDate: string | Date): boolean => {
    return calculateAge(birthDate) >= 18;
};

/**
 * Helper pour obtenir le nombre de jours restants avant une date limite
 * @param dueDate - Date limite
 * @returns Nombre de jours restants (négatif si en retard)
 */
export const getDaysRemaining = (dueDate: string | Date): number => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};