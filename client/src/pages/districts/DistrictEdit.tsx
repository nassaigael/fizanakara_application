import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineGlobal,
  AiOutlineCloseCircle
} from 'react-icons/ai';
import { useDistrict } from '../../hooks/useDistrict';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const DistrictEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { districts, updateDistrict } = useDistrict(Number(id));

  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  useEffect(() => {
    if (districts.length > 0 && id) {
      const district = districts.find(d => d.id === Number(id));
      if (district) {
        setName(district.name);
        setOriginalName(district.name);
      }
    }
  }, [districts, id]);

  if (!name && originalName === '') {
    return (
      <div className="p-8 text-center">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 max-w-md mx-auto">
          <AiOutlineCloseCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <p className="font-black text-xl opacity-60 mb-2">District introuvable</p>
          <Button onClick={() => navigate('/admin/districts')}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom du district est requis');
      return;
    }

    if (name === originalName) {
      // Aucun changement
      navigate('/admin/districts');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDistrict.mutateAsync({ id: Number(id), data: { name: name.trim() } });
      toast.success('District mis à jour avec succès');
      navigate('/admin/districts');
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
            Modifier District
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            {originalName}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary">
              <AiOutlineGlobal size={48} />
            </div>
          </div>

          <Input
            label="Nom du district"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Ex: Analamanga, Vakinankaratra..."
            error={error}
            icon={<AiOutlineGlobal />}
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
        onConfirm={() => navigate('/admin/districts')}
      />
    </div>
  );
};

export default DistrictEdit;