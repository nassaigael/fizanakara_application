import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AiOutlineClose,
  AiOutlineCalendar,
  AiOutlineDollar,
  AiOutlineUser,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-red-600">
          <h2 className="text-white font-bold">Modifier le paiement</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <AiOutlineClose size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Montant total de la cotisation</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(contributionAmount)}</p>
          </div>

          <Input
            label="Montant payé"
            type="number"
            value={amount.toString()}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            icon={<AiOutlineDollar />}
            onError={error}
          />

          <Input
            label="Date du paiement"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            icon={<AiOutlineCalendar />}
          />

          <div className="text-xs text-gray-400 flex items-center gap-1">
            <AiOutlineUser size={12} />
            Reçu par : {payment.receivedBy}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUpdate}
              isLoading={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Modifier
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditPaymentModal;