import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineDollar,
    AiOutlineCalendar,
    AiOutlineCheckCircle,
    AiOutlineInfoCircle,
    AiOutlineDownload
} from 'react-icons/ai';
import { useForm } from '../../../hooks/useForm';
import { usePayment } from '../../../hooks/usePayment';
import { paymentSchema } from '../../../lib/validators/finance.validator';
import { PaymentStatus } from '../../../lib/types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { formatCurrency, formatDate } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';
import { useAuth } from '../../../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributionId: string;
    memberName?: string;
    memberId?: string;
    memberPhone?: string;
    memberEmail?: string;
    memberImageUrl?: string;
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
    memberId,
    memberPhone,
    memberEmail,
    memberImageUrl,
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
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

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

                await addPayment.mutateAsync({
                    amountPaid: formData.amountPaid,
                    paymentDate: paymentDate,
                    status: autoStatus,
                    contributionId: formData.contributionId
                });

                const receipt = {
                    memberName: memberName || 'Membre',
                    memberId: memberId || 'MBR00000000',
                    memberPhone: memberPhone,
                    memberEmail: memberEmail,
                    year: year || new Date().getFullYear(),
                    amount: contributionAmount || 0,
                    paidAmount: formData.amountPaid,
                    remaining: (remainingAmount || 0) - formData.amountPaid,
                    paymentDate: paymentDate,
                    contributionId: contributionId,
                    invoiceNumber: `RCP-${Date.now()}`,
                    generatedBy: `${user?.firstName} ${user?.lastName}` || 'Administrateur'
                };
                
                setReceiptData(receipt);
                setPaymentCompleted(true);
                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
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
        setFieldValue('status', getAutoStatus(amount));
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
    const getStatusLabel = () => autoStatus === PaymentStatus.COMPLETED ? 'Complété' : 'En attente';

    const getMemberInitials = () => {
        if (!memberName) return '?';
        const parts = memberName.split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return memberName.substring(0, 2).toUpperCase();
    };

    const hasMemberImage = memberImageUrl && memberImageUrl.trim() !== '';

    // Fonction pour capturer et télécharger le reçu en PDF
    const downloadReceiptAsPDF = async () => {
        if (!receiptRef.current) return;
        
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            pdf.save(`recu_${receiptData.memberId}_${receiptData.year}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    // Si le paiement est complété, afficher le reçu et télécharger automatiquement
    if (paymentCompleted && receiptData) {
        // Télécharger automatiquement le PDF après un court délai
        setTimeout(() => {
            downloadReceiptAsPDF();
        }, 500);
        
        return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-md">
                    <div ref={receiptRef} className="bg-white rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        {/* Header vert succès */}
                        <div className="bg-green-500 p-6 text-white text-center">
                            <AiOutlineCheckCircle size={48} className="mx-auto mb-3" />
                            <h2 className="text-2xl font-black uppercase">Paiement effectué!</h2>
                            <p className="text-sm opacity-90 mt-1">Transaction enregistrée avec succès</p>
                        </div>

                        {/* Détails du reçu */}
                        <div className="p-6 space-y-4">
                            <div className="text-center border-b border-gray-100 pb-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reçu N°</p>
                                <p className="font-mono text-sm font-bold">{receiptData.invoiceNumber}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Membre</p>
                                    <p className="font-bold text-sm">{receiptData.memberName}</p>
                                    <p className="text-[10px] text-gray-500">{receiptData.memberId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Date</p>
                                    <p className="font-bold text-sm">{formatDate(receiptData.paymentDate, 'short')}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-gray-500">Année</span>
                                    <span className="font-bold">{receiptData.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-gray-500">Montant total</span>
                                    <span className="font-bold">{formatCurrency(receiptData.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-gray-500">Montant payé</span>
                                    <span className="font-bold text-green-600">{formatCurrency(receiptData.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-200">
                                    <span className="text-[10px] font-black text-gray-500">Reste à payer</span>
                                    <span className={`font-bold ${receiptData.remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        {formatCurrency(receiptData.remaining)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-black text-green-700">✓ Paiement enregistré</p>
                                <p className="text-[8px] text-gray-500 mt-1">Téléchargement automatique...</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setPaymentCompleted(false);
                                        resetForm();
                                        onSuccess?.();
                                        onClose();
                                    }}
                                    className="flex-1"
                                >
                                    Fermer
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={downloadReceiptAsPDF}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <AiOutlineDownload size={16} />
                                    Télécharger
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Header avec photo du membre */}
                    <div className="bg-black p-6 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-brand-primary transition-all"
                        >
                            <AiOutlineClose size={20} />
                        </button>

                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-primary flex items-center justify-center mb-4 border-2 border-white shadow-lg">
                            {hasMemberImage ? (
                                <img
                                    src={getImageUrl(memberImageUrl, 'member')}
                                    alt={memberName || 'Membre'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.innerHTML = getMemberInitials();
                                            target.parentElement.classList.add('text-2xl', 'font-black', 'text-white', 'bg-brand-primary', 'flex', 'items-center', 'justify-center');
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-brand-primary flex items-center justify-center">
                                    <span className="text-2xl font-black text-white">{getMemberInitials()}</span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-black uppercase">Enregistrement Paiement</h2>
                        {memberName && <p className="text-xs font-bold text-brand-primary mt-1">{memberName}</p>}
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
                                        {isFullPayment ? 'Totalement réglé' : `Reste: ${formatCurrency(remainingAfterPayment)}`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Montant payé</label>
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
                                    <button type="button" onClick={() => { const half = Math.min(Math.round((remainingAmount || 0) / 2), remainingAmount || 0); setSelectedAmount(half); setFieldValue('amountPaid', half); setAmountError(null); }} className="flex-1 text-[9px] font-black py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        50% ({formatCurrency(Math.min(Math.round((remainingAmount || 0) / 2), remainingAmount || 0))})
                                    </button>
                                    <button type="button" onClick={() => { setSelectedAmount(remainingAmount || 0); setFieldValue('amountPaid', remainingAmount || 0); setAmountError(null); }} className="flex-1 text-[9px] font-black py-1.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-lg transition-colors">
                                        Total ({formatCurrency(remainingAmount || 0)})
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Date Input */}
                        <Input label="Date" name="paymentDate" type="date" value={getDisplayDate()} onChange={handleDateChange} onBlur={handleBlur} error={touched.paymentDate ? errors.paymentDate : undefined} icon={<AiOutlineCalendar />} />

                        {/* Status Display */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-center tracking-wider text-gray-500 mb-2 block">Statut du paiement</label>
                            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${autoStatus === PaymentStatus.COMPLETED ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                <div className="flex items-center gap-3">
                                    <p className={`font-black text-sm ${autoStatus === PaymentStatus.COMPLETED ? 'text-green-700' : 'text-orange-700'}`}>{getStatusLabel()}</p>
                                </div>
                                <AiOutlineInfoCircle size={14} className="text-gray-400" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
                            <Button type="submit" variant="primary" isLoading={addPayment.isPending} disabled={isOverPayment || selectedAmount <= 0} className="flex-1">Valider</Button>
                        </div>
                    </form>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 bg-green-500 rounded-[2.5rem] border-4 border-black flex flex-col items-center justify-center text-white z-10 animate-in zoom-in duration-300">
                        <AiOutlineCheckCircle size={80} className="mb-4" />
                        <p className="font-black text-2xl uppercase">Paiement effectué!</p>
                        <p className="text-xs mt-2">Préparation du reçu...</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};