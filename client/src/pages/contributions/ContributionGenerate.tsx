import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineCalendar,
  AiOutlineTeam
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const ContributionGenerate: React.FC = () => {
  const navigate = useNavigate();
  const { generateAnnualContribs } = useFinance();
  const { members } = useMembers();

  const [year, setYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  const activeMembers = members.filter(m => m.isActiveMember);

  const handlePreview = () => {
    if (activeMembers.length === 0) {
      toast.error('Aucun membre actif disponible');
      return;
    }

    setShowConfirmAlert(true);
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    try {
      await generateAnnualContribs.mutateAsync({ year });
      toast.success(`${activeMembers.length} cotisations générées pour l'année ${year}`);
      navigate('/contributions');
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la génération');
    } finally {
      setIsSubmitting(false);
      setShowConfirmAlert(false);
    }
  };

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/contributions')}
          className="p-3! rounded-xl!"
        >
          <AiOutlineArrowLeft size={20} />
        </Button>
        <div>
          <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
            Générer les cotisations
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Création massive pour l'année {year}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm max-w-2xl">
        <div className="space-y-8">
          {/* Informations */}
          <div className="bg-brand-primary/5 p-6 rounded-3xl border-2 border-brand-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <AiOutlineTeam size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase">Membres actifs</p>
                <p className="font-black text-2xl">{activeMembers.length}</p>
              </div>
            </div>
            <p className="text-[9px] font-bold text-gray-500">
              Seuls les membres avec le statut "Actif" recevront une cotisation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Année"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              icon={<AiOutlineCalendar />}
              min={2000}
              max={2100}
              required
            />
          </div>

          {/* Résumé */}
          <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200">
            <h3 className="font-black text-sm mb-4">Résumé</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500">Nombre de cotisations</span>
                <span className="font-black">{activeMembers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500">Année</span>
                <span className="font-black">{year}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/contributions')}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handlePreview}
              className="flex-1"
              disabled={activeMembers.length === 0}
            >
              Générer les cotisations
            </Button>
          </div>
        </div>
      </div>

      {/* Alert de confirmation */}
      <Alert
        isOpen={showConfirmAlert}
        variant="warning"
        title="Confirmation de génération"
        message={`Vous allez générer ${activeMembers.length} cotisations pour l'année ${year}. Cette action est irréversible.`}
        confirmText="CONFIRMER LA GÉNÉRATION"
        onClose={() => setShowConfirmAlert(false)}
        onConfirm={handleGenerate}
      />
    </div>
  );
};

export default ContributionGenerate;