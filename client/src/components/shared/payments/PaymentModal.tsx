import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineDollar,
    AiOutlineCalendar,
    AiOutlineCheckCircle,
    AiOutlineClockCircle,
    AiOutlineInfoCircle
} from 'react-icons/ai';
import { useForm } from '../../../hooks/useForm';
import { usePayment } from '../../../hooks/usePayment';
import { paymentSchema } from '../../../lib/validators/finance.validator';
import { PaymentStatus } from '../../../lib/types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { formatCurrency, getInitials } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributionId: string;
    memberName?: string;
    memberImageUrl?: string;
    contributionAmount?: number;
    remainingAmount?: number;
    onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    contributionId,
    memberName,
    memberImageUrl,
    contributionAmount,
    remainingAmount,
    onSuccess
}) => {
    const { addPayment } = usePayment();
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number>(remainingAmount || 0);
    const [amountError, setAmountError] = useState<string | null>(null);

    // Déterminer automatiquement le statut en fonction du montant
    const getAutoStatus = (amount: number): PaymentStatus => {
        if (!contributionAmount || !remainingAmount) return PaymentStatus.PENDING;

        const totalPaidAfter = (contributionAmount - remainingAmount) + amount;

        if (totalPaidAfter >= contributionAmount) {
            return PaymentStatus.COMPLETED;
        }
        return PaymentStatus.PENDING;
    };

    // Vérifier si le montant dépasse le reste à payer
    const validateAmount = (amount: number): boolean => {
        if (amount > (remainingAmount || 0)) {
            setAmountError(`Amount cannot exceed remaining balance of ${formatCurrency(remainingAmount || 0)}`);
            return false;
        }
        setAmountError(null);
        return true;
    };

    // Calculer le statut automatique basé sur le montant saisi
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
            // Vérification finale avant soumission
            if (formData.amountPaid > (remainingAmount || 0)) {
                setAmountError(`Amount cannot exceed remaining balance of ${formatCurrency(remainingAmount || 0)}`);
                return;
            }

            try {
                const paymentDate = formData.paymentDate instanceof Date
                    ? formData.paymentDate.toISOString()
                    : new Date(formData.paymentDate).toISOString();

                // Utiliser le statut automatique, pas celui du formulaire
                await addPayment.mutateAsync({
                    amountPaid: formData.amountPaid,
                    paymentDate: paymentDate,
                    status: autoStatus,
                    contributionId: formData.contributionId
                });
                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
                    resetForm();
                    onSuccess?.();
                    onClose();
                }, 1500);
            } catch (error) {
                console.error('Payment error:', error);
            }
        }
    });

    // Gérer le changement de montant avec validation
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;

        // Validation
        if (!validateAmount(amount)) {
            setSelectedAmount(amount);
            setFieldValue('amountPaid', amount);
            return;
        }

        setSelectedAmount(amount);
        setFieldValue('amountPaid', amount);
        
        // Le statut est automatiquement mis à jour via autoStatus
        setFieldValue('status', autoStatus);
    };

    // Gérer le changement de date
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            const isoDate = new Date(dateValue).toISOString();
            setFieldValue('paymentDate', isoDate);
        } else {
            setFieldValue('paymentDate', '');
        }
    };

    // Formater la date pour l'affichage dans l'input
    const getDisplayDate = () => {
        if (!values.paymentDate) return '';
        try {
            return new Date(values.paymentDate).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    // Vérifier si le montant est complet
    const isFullPayment = selectedAmount >= (remainingAmount || 0);
    const isOverPayment = selectedAmount > (remainingAmount || 0);
    const remainingAfterPayment = Math.max(0, (remainingAmount || 0) - selectedAmount);

    // Obtenir le label du statut
    const getStatusLabel = () => {
        return autoStatus === PaymentStatus.COMPLETED ? 'Completed' : 'Pending';
    };

    const getStatusIcon = () => {
        return autoStatus === PaymentStatus.COMPLETED ? (
            <AiOutlineCheckCircle className="text-green-500" size={14} />
        ) : (
            <AiOutlineClockCircle className="text-orange-500" size={14} />
        );
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

                        {/* Photo de profil du membre */}
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-primary flex items-center justify-center mb-4 border-2 border-white shadow-lg">
                            {memberImageUrl ? (
                                <img
                                    src={getImageUrl(memberImageUrl, 'member')}
                                    alt={memberName || 'Member'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.innerHTML = getInitials(memberName?.split(' ')[0] || '', memberName?.split(' ')[1] || '') || '?';
                                            target.parentElement.classList.add('text-2xl', 'font-black', 'text-white', 'bg-brand-primary', 'flex', 'items-center', 'justify-center');
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-brand-primary flex items-center justify-center">
                                    <AiOutlineDollar size={28} className="text-white" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-black uppercase">
                            Register a Payment
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
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Total Due</p>
                                    <p className="font-black text-lg">{formatCurrency(contributionAmount || 0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-400 uppercase">Remaining</p>
                                    <p className="font-black text-lg text-red-600">{formatCurrency(remainingAmount || 0)}</p>
                                </div>
                            </div>

                            {/* Indicateur de paiement */}
                            {selectedAmount > 0 && !isOverPayment && (
                                <div className={`mt-3 pt-3 border-t border-gray-200 flex justify-between items-center ${
                                    isFullPayment ? 'text-green-600' : 'text-orange-500'
                                }`}>
                                    <p className="text-[9px] font-black uppercase">After this payment</p>
                                    <p className="text-sm font-black">
                                        {isFullPayment ? (
                                            <span className="flex items-center gap-1">
                                                <AiOutlineCheckCircle size={14} />
                                                Fully settled
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <AiOutlineClockCircle size={14} />
                                                Remaining: {formatCurrency(remainingAfterPayment)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                Amount Paid
                            </label>
                            <Input
                                name="amountPaid"
                                type="number"
                                value={selectedAmount.toString()}
                                onChange={handleAmountChange}
                                onBlur={handleBlur}
                                error={touched.amountPaid ? errors.amountPaid : (amountError || undefined)}
                                icon={<AiOutlineDollar />}
                                placeholder="Enter amount"
                                max={remainingAmount}
                                step="1000"
                            />

                            {/* Quick amount buttons */}
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
                                        Full ({formatCurrency(remainingAmount || 0)})
                                    </button>
                                </div>
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

                        {/* Status Display - Automatique, non modifiable */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                Payment Status (Auto)
                            </label>
                            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                                autoStatus === PaymentStatus.COMPLETED
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-orange-50 border-orange-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {getStatusIcon()}
                                    <div>
                                        <p className={`font-black text-sm ${
                                            autoStatus === PaymentStatus.COMPLETED ? 'text-green-700' : 'text-orange-700'
                                        }`}>
                                            {getStatusLabel()}
                                        </p>
                                    </div>
                                </div>
                                <AiOutlineInfoCircle size={14} className="text-gray-400" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={addPayment.isPending}
                                disabled={isOverPayment || selectedAmount <= 0}
                                className="flex-1"
                            >
                                Validate
                            </Button>
                        </div>
                    </form>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 bg-green-500 rounded-[2.5rem] border-4 border-black flex flex-col items-center justify-center text-white z-10 animate-in zoom-in duration-300">
                        <AiOutlineCheckCircle size={80} className="mb-4" />
                        <p className="font-black text-2xl uppercase">Success!</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};