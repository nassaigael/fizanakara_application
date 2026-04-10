import React, { useState, useEffect } from 'react';
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
import { PaymentStatus, Gender } from '../../../lib/types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../lib/helper';
import { useAuth } from '../../../context/AuthContext';
import { Avatar } from '../../ui/Avatar';
import html2canvas from 'html2canvas';
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
    const getStatusLabel = () => autoStatus === PaymentStatus.COMPLETED ? 'Complété' : 'En attente';

    const generateReceiptHTML = (data: any, isCompact: boolean = false): string => {
        const paymentDateObj = new Date(data.paymentDate);
        const formattedDate = paymentDateObj.toLocaleDateString('fr-FR');
        const formattedTime = paymentDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        const padding = isCompact ? '4px 6px' : '8px 10px';
        const fontSizeTitle = isCompact ? '12px' : '14px';
        const fontSizeNormal = isCompact ? '7px' : '8px';
        const fontSizeSmall = isCompact ? '5px' : '6px';
        
        return `
            <div style="width: 95mm; margin: 0 auto; background: white; font-family: 'Courier New', monospace; border: 1px solid #e5e7eb; border-radius: 0; overflow: hidden;">
                <div style="padding: ${padding}; text-align: center; border-bottom: 1px dashed #d1d5db;">
                    <h1 style="font-size: ${fontSizeTitle}; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0;">FIZANAKARA</h1>
                    <p style="font-size: ${fontSizeSmall}; color: #6b7280; margin: 2px 0 0;">Gestion des cotisations</p>
                    <p style="font-size: ${fontSizeSmall === '5px' ? '4px' : '5px'}; color: #9ca3af; margin: 3px 0 0;">Antananarivo, Madagascar</p>
                    <p style="font-size: ${fontSizeSmall === '5px' ? '4px' : '5px'}; color: #9ca3af; margin: 0;">Tel: +261 34 00 000 00</p>
                </div>
                <div style="padding: ${padding}; border-bottom: 1px dashed #d1d5db;">
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; margin-bottom: 3px;">
                        <span style="font-weight: bold;">Date:</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; margin-bottom: 3px;">
                        <span style="font-weight: bold;">Heure:</span>
                        <span>${formattedTime}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; margin-bottom: 3px;">
                        <span style="font-weight: bold;">Caissier:</span>
                        <span>${data.generatedBy.split(' ')[0]}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal};">
                        <span style="font-weight: bold;">Ticket N°:</span>
                        <span style="font-size: ${parseInt(fontSizeNormal) - 1}px;">${data.receiptNumber}</span>
                    </div>
                </div>
                <div style="padding: ${padding}; border-bottom: 1px dashed #d1d5db;">
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 4px;">
                        <span>Membre</span>
                        <span>ID</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${parseInt(fontSizeNormal) + 1}px; margin-bottom: 3px;">
                        <span style="max-width: 100px; overflow: hidden; text-overflow: ellipsis;">${data.memberName}</span>
                        <span style="font-size: ${parseInt(fontSizeNormal) - 1}px; color: #6b7280;">${data.memberId.slice(-8)}</span>
                    </div>
                    ${data.memberPhone ? `
                    <div style="display: flex; justify-content: space-between; font-size: ${parseInt(fontSizeNormal) - 1}px; color: #6b7280; margin-top: 3px;">
                        <span>Tel:</span>
                        <span>${data.memberPhone}</span>
                    </div>
                    ` : ''}
                </div>
                <div style="padding: ${padding}; border-bottom: 1px dashed #d1d5db;">
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 4px;">
                        <span>Désignation</span>
                        <span>Montant</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${parseInt(fontSizeNormal) + 1}px; padding: 3px 0;">
                        <span>Cotisation ${data.year}</span>
                        <span>${formatCurrency(data.amount)}</span>
                    </div>
                </div>
                <div style="padding: ${padding}; border-bottom: 1px dashed #d1d5db;">
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; margin-bottom: 3px;">
                        <span>Sous-total :</span>
                        <span>${formatCurrency(data.amount)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 3px; margin-top: 2px;">
                        <span>TOTAL :</span>
                        <span>${formatCurrency(data.amount)}</span>
                    </div>
                </div>
                <div style="padding: ${padding}; border-bottom: 1px dashed #d1d5db;">
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; margin-bottom: 3px;">
                        <span>Paiement :</span>
                        <span>Espèces</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; margin-bottom: 3px;">
                        <span>Montant reçu :</span>
                        <span>${formatCurrency(data.paidAmount)}</span>
                    </div>
                    ${data.remaining > 0 ? `
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; color: #ea580c; margin-bottom: 3px;">
                        <span>Reste à payer :</span>
                        <span>${formatCurrency(data.remaining)}</span>
                    </div>
                    ` : ''}
                    ${data.paidAmount > data.amount ? `
                    <div style="display: flex; justify-content: space-between; font-size: ${fontSizeNormal}; color: #16a34a;">
                        <span>Monnaie :</span>
                        <span>${formatCurrency(data.paidAmount - data.amount)}</span>
                    </div>
                    ` : ''}
                </div>
                <div style="padding: ${padding}; text-align: center; border-top: 1px dashed #d1d5db;">
                    <p style="font-size: ${parseInt(fontSizeNormal) - 1}px; font-weight: bold; margin: 0;">✓ Paiement enregistré</p>
                    <p style="font-size: ${parseInt(fontSizeSmall) - 1}px; color: #9ca3af; margin: 3px 0 0;">Merci pour votre confiance !</p>
                    <p style="font-size: ${parseInt(fontSizeSmall) - 2}px; color: #d1d5db; margin: 3px 0 0;">Fizanakara - Gestion des cotisations</p>
                </div>
            </div>
        `;
    };

    const downloadPDF = async (data: any) => {
        if (!data) {
            toast.error('Aucune donnée de reçu disponible');
            return;
        }

        setIsDownloading(true);
        
        try {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '0';
            container.style.top = '0';
            container.style.width = '210mm';
            container.style.backgroundColor = 'white';
            container.style.padding = '10mm';
            container.style.zIndex = '-1';
            container.style.opacity = '0';
            container.style.pointerEvents = 'none';
            
            // Créer la grille 2x2
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            grid.style.gap = '8px';
            grid.style.width = '100%';
            
            // Ajouter 4 reçus
            for (let i = 0; i < 4; i++) {
                const receiptDiv = document.createElement('div');
                receiptDiv.innerHTML = generateReceiptHTML(data, true);
                grid.appendChild(receiptDiv);
            }
            
            container.appendChild(grid);
            document.body.appendChild(container);
            
            // Attendre le rendu
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Capturer avec html2canvas
            const canvas = await html2canvas(container, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: false
            });
            
            // Nettoyer
            document.body.removeChild(container);
            
            // Créer le PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const xPosition = (210 - imgWidth) / 2;
            const yPosition = 10;
            
            pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
            
            const fileName = `recu_${data.memberId}_${data.year}.pdf`;
            pdf.save(fileName);
            
            toast.success('Reçu téléchargé avec succès');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Erreur lors de la génération du PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    // Téléchargement manuel
    const handleDownload = () => {
        if (receiptData) {
            downloadPDF(receiptData);
        } else {
            toast.error('Aucun reçu à télécharger');
        }
    };

    // Téléchargement automatique après paiement
    useEffect(() => {
        if (paymentCompleted && receiptData && !isDownloading) {
            const timer = setTimeout(() => {
                downloadPDF(receiptData);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [paymentCompleted, receiptData]);

    if (paymentCompleted && receiptData) {
        return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-sm">
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="bg-[#E51A1A] px-4 py-3 text-white">
                            <h3 className="text-sm font-black uppercase text-center">Paiement effectué !</h3>
                            <p className="text-[10px] text-center opacity-80 mt-1">
                                {receiptData.memberName} - {formatCurrency(receiptData.paidAmount)}
                            </p>
                        </div>
                        
                        <div className="p-4 text-center">
                            <AiOutlineCheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                            <p className="text-sm font-bold text-gray-800">Paiement enregistré avec succès !</p>
                            <p className="text-[10px] text-gray-500 mt-2">
                                Le reçu va être téléchargé automatiquement.
                            </p>
                            <p className="text-[9px] text-gray-400 mt-3">
                                4 reçus par page A4 pour économiser le papier
                            </p>
                        </div>
                        
                        <div className="flex gap-3 p-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setPaymentCompleted(false);
                                    resetForm();
                                    onSuccess?.();
                                    onClose();
                                }}
                                className="flex-1 py-2 text-sm font-bold"
                                disabled={isDownloading}
                            >
                                Fermer
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex-1 py-2 text-sm flex items-center justify-center gap-2 bg-[#E51A1A] hover:bg-[#C41515] text-white disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <AiOutlineDownload size={16} />
                                )}
                                Télécharger
                            </Button>
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="bg-[#E51A1A] px-6 py-5 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <AiOutlineClose size={18} />
                        </button>

                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center mb-3 border-2 border-white shadow-md mx-auto">
                            <Avatar
                                imageUrl={memberImageUrl}
                                firstName={memberName?.split(' ')[0]}
                                lastName={memberName?.split(' ')[1]}
                                gender={memberGender}
                                category="member"
                                size="xl"
                                shape="rounded"
                                className="w-full h-full"
                            />
                        </div>
                        <h2 className="text-2xl font-black uppercase text-center">Enregistrement Paiement</h2>
                        {memberName && (
                            <p className="text-sm font-bold text-white/80 text-center mt-1">{memberName}</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Total dû</p>
                                    <p className="font-black text-xl">{formatCurrency(contributionAmount || 0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-400 uppercase">Reste à payer</p>
                                    <p className="font-black text-xl text-red-600">{formatCurrency(remainingAmount || 0)}</p>
                                </div>
                            </div>
                            {selectedAmount > 0 && !isOverPayment && (
                                <div
                                    className={`mt-4 pt-3 border-t border-gray-200 flex justify-between items-center ${isFullPayment ? 'text-green-600' : 'text-orange-500'
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase">Après ce paiement</span>
                                    <span className="text-sm font-black">
                                        {isFullPayment ? 'Totalement réglé' : `Reste: ${formatCurrency(remainingAfterPayment)}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">
                                Montant payé
                            </label>
                            <Input
                                name="amountPaid"
                                type="number"
                                value={selectedAmount.toString()}
                                onChange={handleAmountChange}
                                onBlur={handleBlur}
                                error={touched.amountPaid ? errors.amountPaid : amountError || undefined}
                                icon={<AiOutlineDollar />}
                                placeholder="Saisir le montant"
                                max={remainingAmount}
                                step="1000"
                            />
                            {remainingAmount && remainingAmount > 0 && !isOverPayment && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const half = Math.min(Math.round((remainingAmount || 0) / 2), remainingAmount || 0);
                                            setSelectedAmount(half);
                                            setFieldValue('amountPaid', half);
                                            setAmountError(null);
                                        }}
                                        className="flex-1 text-[10px] font-black py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                                        className="flex-1 text-[10px] font-black py-2 bg-[#E51A1A]/10 text-[#E51A1A] hover:bg-[#E51A1A]/20 rounded-lg transition-colors"
                                    >
                                        Total ({formatCurrency(remainingAmount || 0)})
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
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">
                                Statut du paiement
                            </label>
                            <div
                                className={`flex items-center justify-between p-3 rounded-xl border ${autoStatus === PaymentStatus.COMPLETED
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-orange-50 border-orange-200'
                                    }`}
                            >
                                <span
                                    className={`font-black text-sm ${autoStatus === PaymentStatus.COMPLETED ? 'text-green-700' : 'text-orange-700'
                                        }`}
                                >
                                    {getStatusLabel()}
                                </span>
                                <AiOutlineInfoCircle size={14} className="text-gray-400" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold">
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={addPayment.isPending}
                                disabled={isOverPayment || selectedAmount <= 0}
                                className="flex-1 py-2.5 text-sm font-bold bg-[#E51A1A] hover:bg-[#C41515] text-white"
                            >
                                Valider
                            </Button>
                        </div>
                    </form>
                </div>

                {showSuccess && (
                    <div className="absolute inset-0 bg-[#E51A1A] rounded-2xl flex flex-col items-center justify-center text-white z-10 animate-in zoom-in duration-300">
                        <AiOutlineCheckCircle size={80} className="mb-4" />
                        <p className="font-black text-2xl uppercase">Paiement effectué!</p>
                        <p className="text-sm mt-2">Préparation du reçu...</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default PaymentModal;