import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineCalendar,
    AiOutlineCheckCircle,
    AiOutlineInfoCircle,
} from 'react-icons/ai';
import { useForm } from '../../../hooks/useForm';
import { usePayment } from '../../../hooks/usePayment';
import { paymentSchema } from '../../../lib/validators/finance.validator';
import { PaymentStatus, Gender } from '../../../lib/types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../lib/helper';
import { useAuth } from '../../../context/AuthContext';
import { Avatar } from '../../ui/Avatar';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributionId: string;
    memberName?: string;
    memberId?: string;
    memberPhone?: string;
    memberEmail?: string;
    memberImageUrl?: string;
    memberGender?: Gender;
    contributionAmount?: number;
    remainingAmount?: number;
    year?: number;
    onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    contributionId,
    memberName,
    memberId,
    memberPhone,
    memberEmail,
    memberImageUrl,
    memberGender,
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
    const [isDownloading, setIsDownloading] = useState(false);

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

                const receiptNumber = `FC${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

                const receipt = {
                    memberName: memberName || 'Membre',
                    memberId: memberId || 'MBR00000000',
                    memberPhone: memberPhone,
                    memberEmail: memberEmail,
                    memberImageUrl: memberImageUrl,
                    memberGender: memberGender,
                    year: year || new Date().getFullYear(),
                    amount: contributionAmount || 0,
                    paidAmount: formData.amountPaid,
                    remaining: (remainingAmount || 0) - formData.amountPaid,
                    paymentDate: paymentDate,
                    paymentTime: new Date(paymentDate).toLocaleTimeString('fr-FR'),
                    contributionId: contributionId,
                    receiptNumber: receiptNumber,
                    generatedBy: `${user?.firstName} ${user?.lastName}` || 'Administrateur',
                    generatedByEmail: user?.email || ''
                };

                setReceiptData(receipt);
                setPaymentCompleted(true);
                setShowSuccess(true);

                setTimeout(() => {
                    setShowSuccess(false);
                }, 2000);
            } catch (error) {
                toast.error('Erreur lors du paiement');
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
    const getStatusLabel = () => autoStatus === PaymentStatus.COMPLETED ? 'Payé' : 'Partiel';

    // Génération directe du PDF avec jsPDF

    // Version avec plus d'informations
    const generateDetailedPDF = (data: any) => {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 10;
        const receiptWidth = (pageWidth - margin * 2) / 2;
        const receiptHeight = 85;
        const gap = 5;

        const drawDetailedReceipt = (x: number, y: number, data: any) => {
            const paymentDateObj = new Date(data.paymentDate);
            const formattedDate = paymentDateObj.toLocaleDateString('fr-FR');
            const formattedTime = paymentDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            // Bordure
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(x, y, receiptWidth, receiptHeight);
            
            // En-tête
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(229, 26, 26);
            pdf.text('FIZANAKARA', x + receiptWidth / 2, y + 5, { align: 'center' });
            
            pdf.setFontSize(5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('Gestion des cotisations', x + receiptWidth / 2, y + 9, { align: 'center' });
            
            pdf.line(x, y + 12, x + receiptWidth, y + 12);
            
            // Infos transaction
            pdf.setFontSize(6);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Date: ${formattedDate}`, x + 3, y + 18);
            pdf.text(`Heure: ${formattedTime}`, x + 3, y + 24);
            pdf.text(`Opérateur: ${data.generatedBy.split(' ')[0]}`, x + 3, y + 30);
            pdf.text(`N° Ticket: ${data.receiptNumber}`, x + 3, y + 36);
            
            pdf.line(x, y + 40, x + receiptWidth, y + 40);
            
            // Membre
            pdf.setFont('helvetica', 'bold');
            pdf.text('Membre', x + 3, y + 46);
            pdf.text('ID', x + receiptWidth - 20, y + 46);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.text(data.memberName.length > 18 ? data.memberName.substring(0, 16) + '...' : data.memberName, x + 3, y + 52);
            pdf.setFontSize(6);
            pdf.text(data.memberId.slice(-8), x + receiptWidth - 20, y + 52);
            
            if (data.memberPhone) {
                pdf.setFontSize(5);
                pdf.text(`Tel: ${data.memberPhone}`, x + 3, y + 58);
            }
            
            pdf.line(x, y + 62, x + receiptWidth, y + 62);
            
            // Paiement
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Cotisation', x + 3, y + 68);
            pdf.text(`${formatCurrency(data.amount)}`, x + receiptWidth - 25, y + 68);
            
            pdf.setFont('helvetica', 'normal');
            pdf.text('Montant reçu:', x + 3, y + 74);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${formatCurrency(data.paidAmount)}`, x + receiptWidth - 25, y + 74);
            
            if (data.remaining > 0) {
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(234, 88, 12);
                pdf.text('Reste à payer:', x + 3, y + 80);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${formatCurrency(data.remaining)}`, x + receiptWidth - 25, y + 80);
            }
        };

        // 4 reçus
        drawDetailedReceipt(margin, margin, receiptData);
        drawDetailedReceipt(margin + receiptWidth + gap, margin, receiptData);
        drawDetailedReceipt(margin, margin + receiptHeight + gap, receiptData);
        drawDetailedReceipt(margin + receiptWidth + gap, margin + receiptHeight + gap, receiptData);

        const fileName = `recu_${data.memberId}_${data.year}.pdf`;
        pdf.save(fileName);
    };

    const downloadPDF = () => {
        if (!receiptData) {
            toast.error('Aucune donnée de reçu disponible');
            return;
        }

        setIsDownloading(true);
        
        try {
            generateDetailedPDF(receiptData);
            toast.success('Reçu téléchargé avec succès');
        } catch (error) {
            console.error('PDF error:', error);
            toast.error('Erreur lors de la génération du PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        if (paymentCompleted && receiptData && !isDownloading) {
            const timer = setTimeout(() => {
                downloadPDF();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [paymentCompleted, receiptData]);

    if (paymentCompleted && receiptData) {
        return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-sm">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="bg-linear-to-r from-[#E51A1A] to-[#C41515] px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <AiOutlineCheckCircle size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Paiement effectué</h3>
                                    <p className="text-white/80 text-xs">{receiptData.memberName}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <div className="text-center mb-4">
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(receiptData.paidAmount)}</p>
                                <p className="text-xs text-gray-500 mt-1">Montant payé</p>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Total dû</span>
                                    <span className="font-medium">{formatCurrency(receiptData.amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Reste à payer</span>
                                    <span className="font-medium text-orange-600">{formatCurrency(receiptData.remaining)}</span>
                                </div>
                            </div>
                            
                            <p className="text-center text-[11px] text-gray-400 mb-4">4 reçus par page A4 • Format ticket bancaire</p>
                            
                            <div className="flex gap-3">
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
                                    onClick={downloadPDF}
                                    disabled={isDownloading}
                                    className="flex-1 bg-[#E51A1A] hover:bg-[#C41515]"
                                >
                                    {isDownloading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">📄 Télécharger</span>
                                    )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-[#E51A1A] px-6 py-5 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        >
                            <AiOutlineClose size={18} />
                        </button>

                        <div className="flex flex-col items-center">
                            <Avatar
                                imageUrl={memberImageUrl}
                                firstName={memberName?.split(' ')[0]}
                                lastName={memberName?.split(' ')[1]}
                                gender={memberGender}
                                category="member"
                                size="xl"
                                shape="rounded"
                                className="w-20 h-20 rounded-xl bg-white! shadow-lg mb-3"
                            />
                            <h2 className="text-xl font-bold text-white">Encaissement</h2>
                            <p className="text-white/80 text-sm mt-1">{memberName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">Total dû</span>
                                <span className="font-bold text-gray-800">{formatCurrency(contributionAmount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Reste à payer</span>
                                <span className="font-bold text-[#E51A1A]">{formatCurrency(remainingAmount || 0)}</span>
                            </div>
                            {selectedAmount > 0 && !isOverPayment && (
                                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                                    <span className="text-gray-500">Après paiement</span>
                                    <span className={isFullPayment ? 'text-green-600 font-bold' : 'text-orange-500'}>
                                        {isFullPayment ? 'Soldé' : `Reste: ${formatCurrency(remainingAfterPayment)}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Montant à payer</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Ar</span>
                                <Input
                                    name="amountPaid"
                                    type="number"
                                    value={selectedAmount.toString()}
                                    onChange={handleAmountChange}
                                    onBlur={handleBlur}
                                    error={touched.amountPaid ? errors.amountPaid : amountError || undefined}
                                    placeholder="0"
                                    max={remainingAmount}
                                    step="1000"
                                    className="pl-10"
                                />
                            </div>
                            {remainingAmount && remainingAmount > 0 && !isOverPayment && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const half = Math.min(Math.round((remainingAmount || 0) / 2), remainingAmount || 0);
                                            setSelectedAmount(half);
                                            setFieldValue('amountPaid', half);
                                            setAmountError(null);
                                        }}
                                        className="flex-1 text-xs font-semibold py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        50%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedAmount(remainingAmount || 0);
                                            setFieldValue('amountPaid', remainingAmount || 0);
                                            setAmountError(null);
                                        }}
                                        className="flex-1 text-xs font-semibold py-1.5 bg-[#E51A1A]/10 text-[#E51A1A] hover:bg-[#E51A1A]/20 rounded-lg transition"
                                    >
                                        Total
                                    </button>
                                </div>
                            )}
                        </div>

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

                        <div>
                            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Statut</label>
                            <div className={`flex items-center justify-between p-3 rounded-lg border ${autoStatus === PaymentStatus.COMPLETED ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <span className={`font-semibold text-sm ${autoStatus === PaymentStatus.COMPLETED ? 'text-green-700' : 'text-amber-700'}`}>
                                    {getStatusLabel()}
                                </span>
                                <AiOutlineInfoCircle size={14} className="text-gray-400" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={addPayment.isPending}
                                disabled={isOverPayment || selectedAmount <= 0}
                                className="flex-1 bg-[#E51A1A] hover:bg-[#C41515]"
                            >
                                Valider
                            </Button>
                        </div>
                    </form>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 bg-linear-to-r from-[#E51A1A] to-[#C41515] rounded-xl flex flex-col items-center justify-center text-white z-10 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                            <AiOutlineCheckCircle size={40} className="text-white" />
                        </div>
                        <p className="font-bold text-xl">Paiement effectué !</p>
                        <p className="text-sm mt-2 opacity-90">Génération du reçu...</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default PaymentModal;