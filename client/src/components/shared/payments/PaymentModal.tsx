import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineDollar,
    AiOutlineCalendar,
    AiOutlineCheckCircle
} from 'react-icons/ai';
import { useForm } from '../../../hooks/useForm';
import { usePayment } from '../../../hooks/usePayment';
import { paymentSchema } from '../../../lib/validators/finance.validator';
import { PaymentStatus } from '../../../lib/types';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../lib/helper';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributionId: string;
    memberName?: string;
    contributionAmount?: number;
    remainingAmount?: number;
    onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    contributionId,
    memberName,
    contributionAmount,
    remainingAmount,
    onSuccess
}) => {
    const { addPayment } = usePayment();
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue
    } = useForm<any>({
        initialValues: {
            amountPaid: remainingAmount || 0,
            paymentDate: new Date().toISOString(), // ← Format complet ISO
            status: PaymentStatus.COMPLETED,
            contributionId
        },
        validationSchema: paymentSchema,
        onSubmit: async (formData) => {
            try {
                // S'assurer que la date est au bon format
                const paymentDate = formData.paymentDate instanceof Date 
                    ? formData.paymentDate.toISOString()
                    : new Date(formData.paymentDate).toISOString();
                
                await addPayment.mutateAsync({
                    amountPaid: formData.amountPaid,
                    paymentDate: paymentDate,
                    status: formData.status,
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

    const statusOptions = [
        { value: PaymentStatus.COMPLETED, label: 'Completed' },
        { value: PaymentStatus.PENDING, label: 'Pending' }
    ];

    // Fonction pour gérer le changement de date
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            // Convertir YYYY-MM-DD en ISO string
            const isoDate = new Date(dateValue).toISOString();
            setFieldValue('paymentDate', isoDate);
        } else {
            setFieldValue('paymentDate', '');
        }
    };

    // Formater la date pour l'affichage dans l'input (YYYY-MM-DD)
    const getDisplayDate = () => {
        if (!values.paymentDate) return '';
        try {
            return new Date(values.paymentDate).toISOString().split('T')[0];
        } catch {
            return '';
        }
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
                        <div className="bg-gray-50 border-2 border-black rounded-2xl p-4 flex justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Total Due</p>
                                <p className="font-black">{formatCurrency(contributionAmount || 0)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-red-400 uppercase">Remaining</p>
                                <p className="font-black text-red-600">{formatCurrency(remainingAmount || 0)}</p>
                            </div>
                        </div>

                        <Input
                            label="Amount Paid"
                            name="amountPaid"
                            type="number"
                            value={values.amountPaid?.toString()}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.amountPaid ? errors.amountPaid : undefined}
                            icon={<AiOutlineDollar />}
                        />

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

                        <Select
                            label="Payment Status"
                            name="status"
                            options={statusOptions}
                            value={values.status}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.status ? errors.status : undefined}
                        />

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