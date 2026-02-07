// src/lib/helpers/arrayHelpers.ts
/**
 * Helper pour grouper un tableau par clé
 * @param array - Tableau à grouper
 * @param key - Clé de groupement
 * @returns Objet avec clés groupées
 */
export const groupBy = <T extends Record<string, any>>(array: T[], key: string): Record<string, T[]> => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {} as Record<string, T[]>);
};

/**
 * Helper pour trier un tableau par clé
 * @param array - Tableau à trier
 * @param key - Clé de tri
 * @param order - Ordre (asc/desc)
 * @returns Tableau trié
 */
export const sortBy = <T extends Record<string, any>>(
    array: T[],
    key: string,
    order: 'asc' | 'desc' = 'asc'
): T[] => {
    const sorted = [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
    return sorted;
};

/**
 * Helper pour dédupliquer un tableau
 * @param array - Tableau avec doublons
 * @param key - Clé unique (optionnel)
 * @returns Tableau dédupliqué
 */
export const uniqueBy = <T extends Record<string, any>>(array: T[], key?: string): T[] => {
    if (!key) {
        return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    });
};

/**
 * Helper pour rechercher dans un tableau
 * @param array - Tableau à rechercher
 * @param query - Terme de recherche
 * @param searchKeys - Clés à rechercher
 * @returns Tableau filtré
 */
export const searchInArray = <T extends Record<string, any>>(
    array: T[],
    query: string,
    searchKeys: string[]
): T[] => {
    if (!query.trim()) return array;
    
    const lowerQuery = query.toLowerCase();
    return array.filter(item =>
        searchKeys.some(key =>
            String(item[key]).toLowerCase().includes(lowerQuery)
        )
    );
};

/**
 * Helper pour paginer un tableau
 * @param array - Tableau à paginer
 * @param page - Numéro de page (1-indexed)
 * @param pageSize - Taille de la page
 * @returns Tableau paginé
 */
export const paginate = <T>(array: T[], page: number = 1, pageSize: number = 10): T[] => {
    const start = (page - 1) * pageSize;
    return array.slice(start, start + pageSize);
};