import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AiOutlineClose,
  AiOutlineCalendar,
  AiOutlineDollar,
  AiOutlineUser,
  AiOutlineEdit,
} from 'react-icons/ai';
import { usePayment } from '../../../hooks/usePayment';
import { PaymentResponse, PaymentStatus } from '../../../lib/types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../lib/helper';
import toast from 'react-hot-toast';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentResponse | null;
  contributionAmount: number;
  onSuccess: () => void;
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  contributionAmount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updatePayment, deletePayment } = usePayment();

  useEffect(() => {
    if (payment) {
      setAmount(payment.amountPaid);
      const date = new Date(payment.paymentDate);
      setPaymentDate(date.toISOString().split('T')[0]);
    }
  }, [payment]);

  const handleUpdate = async () => {
    if (amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }

    if (amount > contributionAmount) {
      setError(`Le montant ne peut pas dépasser ${formatCurrency(contributionAmount)}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updatePayment.mutateAsync({
        id: payment!.id,
        data: {
          amountPaid: amount,
          paymentDate: new Date(paymentDate).toISOString(),
          contributionId: payment!.contributionId,
          status: PaymentStatus.COMPLETED,
        },
      });
      toast.success('Paiement modifié avec succès');
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification');
      toast.error('Erreur lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce paiement ? Cette action est irréversible.')) return;

    setIsLoading(true);
    try {
      await deletePayment.mutateAsync(payment!.id);
      toast.success('Paiement supprimé');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !payment) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md flex flex-col shadow-2xl overflow-hidden border-4 border-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white">
              <AiOutlineEdit size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase">Modifier le paiement</h2>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Modifiez le montant ou la date
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
            disabled={isLoading}
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Montant total de la cotisation */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center border-2 border-gray-200">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
              Montant total de la cotisation
            </p>
            <p className="text-2xl font-black text-gray-800 mt-1">
              {formatCurrency(contributionAmount)}
            </p>
          </div>

          {/* Montant payé */}
          <Input
            label="MONTANT PAYÉ"
            type="number"
            value={amount.toString()}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            icon={<AiOutlineDollar />}
            error={error || undefined}
            placeholder="0"
            step="1000"
            required
          />

          {/* Date du paiement */}
          <Input
            label="DATE DU PAIEMENT"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            icon={<AiOutlineCalendar />}
            required
          />

          {/* Reçu par */}
          <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200 flex items-center gap-2">
            <AiOutlineUser size={14} className="text-gray-400" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Reçu par : <span className="text-gray-700">{payment.receivedBy}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 border-t-2 border-gray-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
            className="w-full md:w-auto px-6 bg-red-500 hover:bg-red-600 text-white"
          >
            SUPPRIMER
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full md:w-auto px-6"
            disabled={isLoading}
          >
            ANNULER
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleUpdate}
            isLoading={isLoading}
            className="w-full md:flex-1 bg-red-600 hover:bg-red-700"
          >
            MODIFIER
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditPaymentModal;