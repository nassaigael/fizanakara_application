import { PaymentStatus } from "./common.type";

/**
 * Données d'entrée pour un paiement (PaymentDto.java)
 */
export interface PaymentDto {
    amountPaid: number;
    paymentDate?: string;
    status: PaymentStatus;
    contributionId: string;
}

export interface PaymentResponseDto {
    id: string;
    amountPaid: number;
    paymentDate: string;
    status: PaymentStatus;
    contributionId: string;
}