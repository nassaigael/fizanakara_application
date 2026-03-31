import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineDollar,
    AiOutlineCalendar,
    AiOutlineCheckCircle,
<<<<<<< Updated upstream
    AiOutlineClockCircle,
    AiOutlineInfoCircle,
    AiOutlineWarning
=======
    AiOutlineInfoCircle
>>>>>>> Stashed changes
} from 'react-icons/ai';
import { useForm } from '../../../hooks/useForm';
import { usePayment } from '../../../hooks/usePayment';
import { paymentSchema } from '../../../lib/validators/finance.validator';
import { PaymentStatus } from '../../../lib/types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../lib/helper';
<<<<<<< Updated upstream
=======
import { generatePaymentInvoice } from '../../../services/invoice.service';
import { useAuth } from '../../../context/AuthContext';
>>>>>>> Stashed changes

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributionId: string;
    memberName?: string;
<<<<<<< Updated upstream
=======
    memberId?: string;
    memberPhone?: string;
    memberEmail?: string;
>>>>>>> Stashed changes
    contributionAmount?: number;
    remainingAmount?: number;
    year?: number;
    onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    contributionId,
    memberName,
<<<<<<< Updated upstream
=======
    memberId,
    memberPhone,
    memberEmail,
>>>>>>> Stashed changes
    contributionAmount,
    remainingAmount,
    year,
    onSuccess
}) => {
    const { addPayment } = usePayment();
    const { user } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number>(remainingAmount || 0);
    const [amountError, setAmountError] = useState<string | null>(null);
    const [generatedInvoice, setGeneratedInvoice] = useState(false);

    // Déterminer automatiquement le statut en fonction du montant
    const getAutoStatus = (amount: number): PaymentStatus => {
        if (!contributionAmount || !remainingAmount) return PaymentStatus.PENDING;
        const totalPaidAfter = (contributionAmount - remainingAmount) + amount;
        if (totalPaidAfter >= contributionAmount) {
            return PaymentStatus.COMPLETED;
        }
        return PaymentStatus.PENDING;
    };

    const validateAmount = (amount: number): boolean => {
        if (amount > (remainingAmount || 0)) {
            setAmountError(`Le montant ne peut pas dépasser le solde restant de ${formatCurrency(remainingAmount || 0)}`);
            return false;
        }
        setAmountError(null);
        return true;
    };

    const autoStatus = getAutoStatus(selectedAmount);

    const {
        values,
        errors,
        touched,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue
    } = useForm<any>({
        initialValues: {
            amountPaid: remainingAmount || 0,
            paymentDate: new Date().toISOString(),
            status: autoStatus,
            contributionId
        },
        validationSchema: paymentSchema,
        onSubmit: async (formData) => {
            if (formData.amountPaid > (remainingAmount || 0)) {
                setAmountError(`Le montant ne peut pas dépasser le solde restant de ${formatCurrency(remainingAmount || 0)}`);
                return;
            }

            try {
                const paymentDate = formData.paymentDate instanceof Date
                    ? formData.paymentDate.toISOString()
                    : new Date(formData.paymentDate).toISOString();

                const result = await addPayment.mutateAsync({
                    amountPaid: formData.amountPaid,
                    paymentDate: paymentDate,
                    status: autoStatus, // ← Statut automatique
                    contributionId: formData.contributionId
                });

                setShowSuccess(true);

                // Générer la facture après le paiement réussi
                if (!generatedInvoice && result) {
                    await generatePaymentInvoice({
                        invoiceNumber: `INV-${Date.now()}`,
                        memberName: memberName || 'Membre',
                        memberId: memberId || 'N/A',
                        memberPhone: memberPhone,
                        memberEmail: memberEmail,
                        contributionId: contributionId,
                        year: year || new Date().getFullYear(),
                        amount: contributionAmount || 0,
                        paidAmount: formData.amountPaid,
                        remaining: (remainingAmount || 0) - formData.amountPaid,
                        paymentDate: paymentDate,
                        paymentMethod: 'Espèces / Virement',
                        paymentStatus: autoStatus === PaymentStatus.COMPLETED ? 'PAID' : 'PARTIAL',
                        generatedBy: `${user?.firstName} ${user?.lastName}`
                    });
                    setGeneratedInvoice(true);
                }

                setTimeout(() => {
                    setShowSuccess(false);
                    setGeneratedInvoice(false);
                    resetForm();
                    onSuccess?.();
                    onClose();
                }, 2000);
            } catch (error) {
                console.error('Payment error:', error);
            }
        }
    });


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;
        if (!validateAmount(amount)) {
            setSelectedAmount(amount);
            setFieldValue('amountPaid', amount);
            return;
        }
        setSelectedAmount(amount);
        setFieldValue('amountPaid', amount);
<<<<<<< Updated upstream
        
        // Le statut est automatiquement mis à jour via autoStatus
        // On synchronise aussi la valeur dans le formulaire
        setFieldValue('status', autoStatus);
=======
        setFieldValue('status', getAutoStatus(amount));
>>>>>>> Stashed changes
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            const isoDate = new Date(dateValue).toISOString();
            setFieldValue('paymentDate', isoDate);
        } else {
            setFieldValue('paymentDate', '');
        }
    };

    const getDisplayDate = () => {
        if (!values.paymentDate) return '';
        try {
            return new Date(values.paymentDate).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const isFullPayment = selectedAmount >= (remainingAmount || 0);
    const isOverPayment = selectedAmount > (remainingAmount || 0);
    const remainingAfterPayment = Math.max(0, (remainingAmount || 0) - selectedAmount);

    const getStatusLabel = () => {
        return autoStatus === PaymentStatus.COMPLETED ? 'Complété' : 'En attente';
    };


    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Header */}
                    <div className="bg-black p-6 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-brand-primary transition-all"
                        >
                            <AiOutlineClose size={20} />
                        </button>

                        <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center mb-4 border-2 border-white">
                            <AiOutlineDollar size={28} className="text-white" />
                        </div>
                        <h2 className="text-xl font-black uppercase">
                            Enregistrement Paiement
                        </h2>
                        {memberName && (
                            <p className="text-xs font-bold text-brand-primary mt-1">
                                {memberName}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Summary */}
                        <div className="bg-gray-50 border-2 border-black rounded-2xl p-4">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Total dû</p>
                                    <p className="font-black text-lg">{formatCurrency(contributionAmount || 0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-400 uppercase">Reste à payer</p>
                                    <p className="font-black text-lg text-red-600">{formatCurrency(remainingAmount || 0)}</p>
                                </div>
                            </div>

                            {selectedAmount > 0 && !isOverPayment && (
                                <div className={`mt-3 pt-3 border-t border-gray-200 flex justify-between items-center ${isFullPayment ? 'text-green-600' : 'text-orange-500'}`}>
                                    <p className="text-[9px] font-black uppercase">Après ce paiement</p>
                                    <p className="text-sm font-black">
                                        {isFullPayment ? (
                                            <span className="flex items-center gap-1">
                                                Totalement réglé
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                Reste: {formatCurrency(remainingAfterPayment)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Alerte de dépassement */}
                            {isOverPayment && (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                        <AiOutlineWarning size={14} className="text-red-500" />
                                        <p className="text-[9px] font-black text-red-600 uppercase">
                                            Overpayment detected! Maximum allowed: {formatCurrency(remainingAmount || 0)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                Montant payé
                            </label>
                            <Input
                                name="amountPaid"
                                type="number"
                                value={selectedAmount.toString()}
                                onChange={handleAmountChange}
                                onBlur={handleBlur}
                                error={touched.amountPaid ? errors.amountPaid : (amountError || undefined)}
                                icon={<AiOutlineDollar />}
                                placeholder="Saisir le montant"
                                max={remainingAmount}
                                step="1000"
                            />

                            {remainingAmount && remainingAmount > 0 && !isOverPayment && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const halfAmount = Math.min(Math.round((remainingAmount || 0) / 2), remainingAmount || 0);
                                            setSelectedAmount(halfAmount);
                                            setFieldValue('amountPaid', halfAmount);
                                            setAmountError(null);
                                        }}
                                        className="flex-1 text-[9px] font-black py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        50% ({formatCurrency(Math.min(Math.round((remainingAmount || 0) / 2), remainingAmount || 0))})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedAmount(remainingAmount || 0);
                                            setFieldValue('amountPaid', remainingAmount || 0);
                                            setAmountError(null);
                                        }}
                                        className="flex-1 text-[9px] font-black py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-lg transition-colors"
                                    >
                                        Total ({formatCurrency(remainingAmount || 0)})
                                    </button>
                                </div>
                            )}

                            {/* Message d'information sur le montant maximum */}
                            {remainingAmount && (
                                <p className="text-[8px] text-gray-400 mt-2">
                                    Maximum allowed: {formatCurrency(remainingAmount)}
                                </p>
                            )}
                        </div>

                        {/* Date Input */}
                        <Input
                            label="Date"
                            name="paymentDate"
                            type="date"
                            value={getDisplayDate()}
                            onChange={handleDateChange}
                            onBlur={handleBlur}
                            error={touched.paymentDate ? errors.paymentDate : undefined}
                            icon={<AiOutlineCalendar />}
                        />

                        {/* Status Display */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-center tracking-wider text-gray-500 mb-2 block">
                                Statut du paiement
                            </label>
                            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${autoStatus === PaymentStatus.COMPLETED ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className={`font-black text-sm ${autoStatus === PaymentStatus.COMPLETED ? 'text-green-700' : 'text-orange-700'}`}>
                                            {getStatusLabel()}
                                        </p>
                                        <p className="text-[8px] text-gray-500 mt-0.5">
                                            {autoStatus === PaymentStatus.COMPLETED 
                                                ? 'Full payment - No remaining balance'
                                                : 'Partial payment - Balance remaining'}
                                        </p>
                                    </div>
                                </div>
                                <AiOutlineInfoCircle size={14} className="text-gray-400" />
                            </div>
                            <p className="text-[8px] text-gray-400 mt-2 flex items-center gap-1">
                                <AiOutlineInfoCircle size={10} />
                                Status is automatically determined based on payment amount
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={addPayment.isPending}
                                disabled={isOverPayment || selectedAmount <= 0}
                                className="flex-1"
                            >
                                Valider
                            </Button>
                        </div>
                    </form>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 bg-green-500 rounded-[2.5rem] border-4 border-black flex flex-col items-center justify-center text-white z-10 animate-in zoom-in duration-300">
                        <AiOutlineCheckCircle size={80} className="mb-4" />
                        <p className="font-black text-2xl uppercase">Paiement effectué!</p>
                        <p className="text-xs mt-2">La facture a été téléchargée</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};