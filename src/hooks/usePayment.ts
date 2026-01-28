import { useState } from 'react';
import { PaymentService } from '../services/payment.service';
import { ContributionResponseDto } from '../lib/types/models/contribution.type';
import toast from 'react-hot-toast';

export const usePayment = (onSuccess: () => void) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const processPayment = async (contribution: ContributionResponseDto, amount: number) => {
        if (amount <= 0) {
            toast.error("Le montant doit être supérieur à 0 Ar");
            return;
        }

        if (amount > contribution.remaining) {
            toast.error(`Le montant dépasse le reste à payer (${contribution.remaining} Ar)`);
            return;
        }

        setIsSubmitting(true);

        try {
            await PaymentService.create({
                contributionId: contribution.id,
                amountPaid: amount,
                paymentDate: new Date().toISOString(),
                status: "COMPLETED"
            });

            toast.success(`Paiement de ${amount.toLocaleString()} Ar enregistré pour ${contribution.memberName}`);
            
            onSuccess();
        } catch (error: any) {
            const serverMsg = error.response?.data?.message || "Erreur lors de l'enregistrement";
            toast.error(serverMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { processPayment, isSubmitting };
};