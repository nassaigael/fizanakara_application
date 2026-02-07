// src/lib/helpers/currencyHelpers.ts
/**
 * Helper pour formater un montant en devises
 * @param amount - Montant à formater
 * @param currency - Code devise (défaut: EUR)
 * @returns Montant formaté avec symbole
 */
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Helper pour vérifier si une cotisation est entièrement payée
 * @param remaining - Montant restant à payer
 * @returns true si remaining === 0
 */
export const isFullyPaid = (remaining: number): boolean => {
    return remaining <= 0;
};

/**
 * Helper pour calculer le pourcentage payé
 * @param paid - Montant payé
 * @param total - Montant total
 * @returns Pourcentage entre 0 et 100
 */
export const calculatePaymentPercentage = (paid: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((paid / total) * 100);
};

/**
 * Helper pour obtenir le statut de paiement visuel
 * @param percentage - Pourcentage payé
 * @returns Statut 'pending' | 'partial' | 'paid'
 */
export const getPaymentStatusVisual = (percentage: number): 'pending' | 'partial' | 'paid' => {
    if (percentage === 0) return 'pending';
    if (percentage === 100) return 'paid';
    return 'partial';
};