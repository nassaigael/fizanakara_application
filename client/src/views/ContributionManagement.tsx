import React, { useState, useMemo, memo } from "react";
import { AiOutlineSearch, AiOutlineCheck, AiOutlineUser } from "react-icons/ai";
// Correction : Utilisation du bon hook et des types existants
import { useFinance } from "../hooks/useFinance";
import { PaymentStatus } from "../lib/types/enum.types";
import { THEME } from "../styles/theme";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ContributionManagement: React.FC = () => {
    // Utilisation de useFinance qui contient déjà la logique des contributions et paiements
    const { contributions, loadingContribs, addPayment } = useFinance();
    
    // État local pour la recherche
    const [searchTerm, setSearchTerm] = useState("");
    
    // État pour stocker les montants saisis par ligne (id_cotisation: montant)
    const [inputAmounts, setInputAmounts] = useState<Record<string, string>>({});

    // Filtrage des membres selon la recherche
    const filteredContributions = useMemo(() => {
        return contributions.filter((c) =>
            c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.childName && c.childName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [contributions, searchTerm]);

    const handleAmountChange = (id: string, value: string) => {
        setInputAmounts(prev => ({ ...prev, [id]: value }));
    };

    const handleProcessPayment = async (contributionId: string) => {
        const amount = Number(inputAmounts[contributionId]);
        
        if (!amount || amount <= 0) return;

        try {
            await addPayment.mutateAsync({
                amountPayed: amount,
                paymentDate: new Date().toISOString(),
                paymentStatus: PaymentStatus.COMPLETED,
                contributionId: contributionId
            });
            // Réinitialiser le champ après succès
            handleAmountChange(contributionId, "");
        } catch (error) {
            // L'erreur est déjà gérée par toast dans useFinance
            console.error("Erreur de paiement", error);
        }
    };

    const TABLE_HEADERS = [
        { label: "Membre", align: "text-left" },
        { label: "Total Dû", align: "text-center" },
        { label: "Déjà Payé", align: "text-center" },
        { label: "Reste à percevoir", align: "text-center" },
        { label: "Encaisser", align: "text-right" },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`${THEME.font.black} text-3xl tracking-tighter uppercase`}>
                        Saisie des Cotisations
                    </h1>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1 italic">
                        Exercice {new Date().getFullYear()}
                    </p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-brand-primary/5 border-2 border-brand-primary border-b-4 rounded-2xl">
                    <AiOutlineUser className="text-brand-primary" size={20} />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                        {contributions.length} Dossiers éligibles
                    </span>
                </div>
            </div>

            {/* Barre de Recherche */}
            <div className="w-full max-w-2xl">
                <Input
                    placeholder="Rechercher un membre par nom..."
                    icon={<AiOutlineSearch size={22} />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-3xl shadow-sm"
                />
            </div>

            {/* Table des cotisations */}
            <div className="bg-white dark:bg-brand-border-dark rounded-[2.5rem] border-2 border-brand-border border-b-8 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-bg/50 border-b-2 border-brand-border">
                                {TABLE_HEADERS.map((header, index) => (
                                    <th
                                        key={index}
                                        className={`p-6 text-[9px] font-black uppercase text-brand-muted tracking-[0.2em] ${header.align}`}
                                    >
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-brand-bg">
                            {loadingContribs ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center font-black uppercase opacity-20 tracking-widest">
                                        Chargement des données...
                                    </td>
                                </tr>
                            ) : filteredContributions.map((c) => (
                                <tr key={c.id} className="group hover:bg-brand-primary/5 transition-colors">
                                    <td className="p-6">
                                        <div className={`${THEME.font.black} text-[11px] text-brand-text group-hover:text-brand-primary transition-colors uppercase`}>
                                            {c.memberName} {c.childName && <span className="text-brand-muted font-bold ml-1">(Enfant: {c.childName})</span>}
                                        </div>
                                        <div className={`text-[8px] font-black uppercase mt-1 ${c.remaining === 0 ? 'text-green-500' : 'text-brand-muted'}`}>
                                            {c.remaining === 0 ? '● Dossier Soldé' : '○ En attente de paiement'}
                                        </div>
                                    </td>

                                    <td className="p-6 text-center">
                                        <span className="font-black text-xs">{c.amount.toLocaleString()}</span>
                                        <span className="text-[8px] ml-1 opacity-40 font-bold">AR</span>
                                    </td>

                                    <td className="p-6 text-center">
                                        <span className="font-black text-xs text-green-600">+{c.totalPaid.toLocaleString()}</span>
                                    </td>

                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] border ${c.remaining > 0
                                            ? 'bg-red-50 text-red-500 border-red-100'
                                            : 'bg-green-50 text-green-600 border-green-100'
                                            }`}>
                                            {c.remaining === 0 ? "TERMINÉ" : `${c.remaining.toLocaleString()} Ar`}
                                        </span>
                                    </td>

                                    <td className="p-6">
                                        <div className="flex gap-3 justify-end items-center">
                                            <Input
                                                type="number"
                                                placeholder="Montant..."
                                                disabled={c.remaining === 0 || addPayment.isPending}
                                                className="w-32! py-2! rounded-xl! text-xs! bg-brand-bg/10!"
                                                value={inputAmounts[c.id] || ""}
                                                onChange={(e) => handleAmountChange(c.id, e.target.value)}
                                            />
                                            <Button
                                                onClick={() => handleProcessPayment(c.id)}
                                                disabled={!inputAmounts[c.id] || c.remaining === 0 || addPayment.isPending}
                                                isLoading={addPayment.isPending}
                                                className="p-3! rounded-xl!"
                                            >
                                                <AiOutlineCheck size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default memo(ContributionManagement);