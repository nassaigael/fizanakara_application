// components/shared/modals/PaymentModal.tsx
import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineCheckCircle } from 'react-icons/ai';
import { useFinance } from '../../../hooks/useFinance';
import { ContributionResponseModel } from '../../../lib/types/models/contribution.models.types';
import { PaymentStatus } from '../../../lib/types/enum.types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  contribution: ContributionResponseModel;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ contribution, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPayment } = useFinance();

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }

    if (num > contribution.remaining) {
      toast.error(`Le montant ne peut pas dépasser ${contribution.remaining.toLocaleString()} Ar`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addPayment.mutateAsync({
        amountPayed: num,
        paymentDate: new Date().toISOString(),
        paymentStatus: PaymentStatus.COMPLETED,
        contributionId: contribution.id,
      });
      toast.success('Paiement enregistré avec succès');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement du paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  const quickAmounts = [
    contribution.remaining,
    Math.floor(contribution.remaining / 2),
    Math.floor(contribution.remaining / 3),
    contribution.amount
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center">
          <h2 className="font-black text-xl uppercase flex items-center gap-2">
            <AiOutlineCheckCircle className="text-brand-primary" />
            Encaisser un paiement
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-brand-primary/5 p-4 rounded-2xl border-2 border-brand-primary/20">
            <p className="text-sm text-gray-600 mb-1">Cotisation {contribution.year}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">Reste dû:</span>
              <span className="text-2xl font-black text-brand-primary">
                {contribution.remaining.toLocaleString()} Ar
              </span>
            </div>
          </div>

          <div>
            <label className="block font-black text-brand-muted text-[10px] uppercase tracking-wider mb-2">
              Montant à payer
            </label>
            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              autoFocus
              className="text-2xl! font-black! text-center!"
            />
          </div>

          {quickAmounts.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Montants rapides</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-4 py-2 bg-gray-100 rounded-xl font-black text-xs hover:bg-brand-primary/10 transition-colors"
                  >
                    {quickAmount.toLocaleString()} Ar
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!amount || Number(amount) <= 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;