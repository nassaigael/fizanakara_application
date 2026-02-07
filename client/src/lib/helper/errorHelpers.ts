// src/lib/helpers/errorHelpers.ts
/**
 * Helper pour obtenir un message d'erreur lisible
 * @param error - Erreur quelconque
 * @returns Message d'erreur en français
 */
export const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.message) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.toString();
    }
    return "Une erreur inattendue s'est produite";
};

/**
 * Helper pour vérifier si c'est une erreur réseau
 * @param error - Erreur à vérifier
 * @returns true si erreur réseau
 */
export const isNetworkError = (error: any): boolean => {
    return !error?.response || error?.code === 'NETWORK_ERROR';
};

/**
 * Helper pour vérifier si c'est une erreur d'authentification
 * @param error - Erreur à vérifier
 * @returns true si erreur 401 ou 403
 */
export const isAuthError = (error: any): boolean => {
    const status = error?.response?.status;
    return status === 401 || status === 403;
};

/**
 * Helper pour formater les erreurs de validation Zod
 * @param errors - Erreurs de validation
 * @returns Objet avec erreurs formatées
 */
export const formatValidationErrors = (errors: any): Record<string, string> => {
    const formatted: Record<string, string> = {};
    
    if (errors?.fieldErrors) {
        Object.entries(errors.fieldErrors).forEach(([key, value]: [string, any]) => {
            formatted[key] = Array.isArray(value) ? value[0] : value;
        });
    }
    
    return formatted;
};