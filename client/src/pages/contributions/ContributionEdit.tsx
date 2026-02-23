import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineDollar,
  AiOutlineCalendar,
  AiOutlineCloseCircle
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import { ContributionStatus } from '../../lib/types/enum.types';
import { formatCurrency } from '../../lib/helper/currencyHelpers';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const ContributionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contributions, updateContribution } = useFinance();
  const { members } = useMembers();

  const [formData, setFormData] = useState({
    amount: 0,
    contributionStatus: ContributionStatus.PENDING,
    year: new Date().getFullYear()
  });
  const [originalContribution, setOriginalContribution] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  useEffect(() => {
    if (contributions.length > 0 && id) {
      const found = contributions.find(c => c.id === id);
      if (found) {
        setOriginalContribution(found);
        setFormData({
          amount: found.amount,
          contributionStatus: found.contributionStatus,
          year: found.year
        });
      }
    }
  }, [contributions, id]);

  if (!originalContribution) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 max-w-md mx-auto">
          <AiOutlineCloseCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <p className="font-black text-xl opacity-60 mb-2">Cotisation introuvable</p>
          <Button onClick={() => navigate('/admin/contributions')}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const member = members.find(m => m.id === originalContribution.memberId);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount < 1000) {
      newErrors.amount = 'Le montant minimum est de 1000 Ar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateContribution.mutateAsync({
        id: id!,
        data: {
          amount: formData.amount,
          contributionStatus: formData.contributionStatus
        }
      });
      toast.success('Cotisation mise à jour avec succès');
      navigate(`/admin/contributions/${id}`);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => setShowCancelAlert(true)}
          className="p-3! rounded-xl!"
        >
          <AiOutlineArrowLeft size={20} />
        </Button>
        <div>
          <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
            Modifier la cotisation
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Année {originalContribution.year} • {member ? `${member.firstName} ${member.lastName}` : ''}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations du membre */}
          {member && (
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200">
              <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Membre</p>
              <p className="font-black text-lg">{member.firstName} {member.lastName}</p>
              <p className="text-[10px] font-bold text-gray-500">N° {member.sequenceNumber}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Année"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              icon={<AiOutlineCalendar />}
              disabled
            />
            <Input
              label="Montant (Ar)"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              error={errors.amount}
              icon={<AiOutlineDollar />}
              min={1000}
              step={1000}
              required
            />
          </div>

          <Select
            label="Statut"
            name="contributionStatus"
            value={formData.contributionStatus}
            onChange={handleChange}
            options={[
              { value: ContributionStatus.PENDING, label: 'En attente' },
              { value: ContributionStatus.PARTIAL, label: 'Partiellement payée' },
              { value: ContributionStatus.PAID, label: 'Payée' },
              { value: ContributionStatus.OVERDUE, label: 'En retard' }
            ]}
          />

          {/* Résumé financier */}
          <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200">
            <h3 className="font-black text-sm mb-4 text-blue-700">Résumé financier</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-600">Déjà payé</span>
                <span className="font-black">{formatCurrency(originalContribution.totalPaid, 'Ar')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-600">Nouveau total dû</span>
                <span className="font-black text-blue-700">{formatCurrency(formData.amount, 'Ar')}</span>
              </div>
              <div className="h-px bg-blue-200 my-2" />
              <div className="flex justify-between">
                <span className="text-xs font-black">Reste à payer</span>
                <span className="text-xl font-black">
                  {formatCurrency(formData.amount - originalContribution.totalPaid, 'Ar')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCancelAlert(true)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <AiOutlineSave size={20} />
              Enregistrer
            </Button>
          </div>
        </form>
      </div>

      {/* Alert d'annulation */}
      <Alert
        isOpen={showCancelAlert}
        variant="warning"
        title="Annuler les modifications"
        message="Voulez-vous vraiment annuler ? Les modifications non enregistrées seront perdues."
        confirmText="QUITTER"
        onClose={() => setShowCancelAlert(false)}
        onConfirm={() => navigate(`/admin/contributions/${id}`)}
      />
    </div>
  );
};

export default ContributionEdit;