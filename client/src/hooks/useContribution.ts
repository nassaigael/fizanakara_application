import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContributionService } from '../services/contribution.service';
import { PaymentService } from '../services/payment.service';
import { ContributionResponseDto } from '../lib/types/models/contribution.type';
import toast from 'react-hot-toast';

export const useContribution = (year: number = new Date().getFullYear()) => {
    const [contributions, setContributions] = useState<ContributionResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchContributions = useCallback(async () => {
        setLoading(true);
        try {
            // Note: On utilise generate car dans ta logique, 
            // cela initialise ou récupère les cotisations de l'année.
            const data = await ContributionService.generateForYear({ year });
            setContributions(data);
        } catch (error: any) {
            toast.error("Impossible de récupérer les cotisations");
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchContributions();
    }, [fetchContributions]);

    // --- Filtrage ---
    const filteredData = useMemo(() => {
        return contributions.filter(c => 
            c.memberName.toLowerCase().includes(search.toLowerCase()) ||
            c.memberId.toLowerCase().includes(search.toLowerCase())
        );
    }, [contributions, search]);

    // --- Statistiques calculées (Utile pour l'UI) ---
    const stats = useMemo(() => {
        const totalExpected = contributions.reduce((acc, curr) => acc + curr.amount, 0);
        const totalCollected = contributions.reduce((acc, curr) => acc + curr.totalPaid, 0);
        return {
            totalExpected,
            totalCollected,
            percent: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
            remaining: totalExpected - totalCollected
        };
    }, [contributions]);

    const addPayment = async (contributionId: string, amount: number) => {
        if (amount <= 0) return toast.error("Le montant doit être supérieur à 0");

        try {
            await PaymentService.create({
                contributionId,
                amountPaid: amount,
                status: 'COMPLETED',
                paymentDate: new Date().toISOString()
            });
            
            toast.success("Paiement enregistré avec succès");
            await fetchContributions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors du paiement");
        }
    };

    return {
        contributions: filteredData,
        allContributions: contributions,
        stats,
        loading,
        search,
        setSearch,
        addPayment,
        refresh: fetchContributions
    };
};