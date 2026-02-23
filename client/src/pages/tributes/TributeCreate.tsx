import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineTeam
} from 'react-icons/ai';
import { useTribute } from '../../hooks/useTribute';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const TributeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createTribute } = useTribute();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom de la tribu est requis');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTribute.mutateAsync({ name: name.trim() });
      toast.success('Tribu créée avec succès');
      navigate('/admin/tributes');
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la création');
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
            Nouvelle Tribu
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Ajouter un nouveau groupe ethnique
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500">
              <AiOutlineTeam size={48} />
            </div>
          </div>

          <Input
            label="Nom de la tribu"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Ex: Tribu Nord, Tribu Sud..."
            error={error}
            icon={<AiOutlineTeam />}
            autoFocus
            required
          />

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
              Créer la tribu
            </Button>
          </div>
        </form>
      </div>

      {/* Alert d'annulation */}
      <Alert
        isOpen={showCancelAlert}
        variant="warning"
        title="Annuler la création"
        message="Voulez-vous vraiment annuler ? Les données saisies seront perdues."
        confirmText="QUITTER"
        onClose={() => setShowCancelAlert(false)}
        onConfirm={() => navigate('/admin/tributes')}
      />
    </div>
  );
};

export default TributeCreate;