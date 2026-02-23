import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineCalendar,
  AiOutlinePhone,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineCamera,
  AiOutlineArrowLeft,
  AiOutlineSave
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import { Gender, MemberStatus } from '../../lib/types/enum.types';
import type { PersonModel } from '../../lib/types/models/person.models.types';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import { isValidPhoneNumber, isValidBirthDate } from '../../lib/helper/validationHelpers';
import { getImageUrl } from '../../lib/constant/constant';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const MemberCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createMember } = useMembers();
  const { districts, loadingDistricts } = useDistrict();
  const { tributes, loadingTributes } = useTribute();

  const [formData, setFormData] = useState<Partial<PersonModel>>({
    firstName: '',
    lastName: '',
    birthDate: new Date().toISOString().split('T')[0],
    gender: Gender.MALE,
    phoneNumber: '',
    imageUrl: '',
    status: MemberStatus.WORKER,
    districtId: 0,
    tributeId: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.birthDate) newErrors.birthDate = 'La date de naissance est requise';
    else if (!isValidBirthDate(formData.birthDate)) newErrors.birthDate = 'Date de naissance invalide';
    
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Numéro de téléphone invalide';
    }
    
    if (!formData.districtId || formData.districtId === 0) {
      newErrors.districtId = 'Veuillez sélectionner un district';
    }
    
    if (!formData.tributeId || formData.tributeId === 0) {
      newErrors.tributeId = 'Veuillez sélectionner une tribu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['districtId', 'tributeId'];

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value ? parseInt(value, 10) : 0) : value
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
      await createMember.mutateAsync(formData as PersonModel);
      toast.success('Membre créé avec succès');
      navigate('/admin/members');
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
            Nouveau Membre
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Ajouter un membre au registre
          </p>
        </div>
      </div>
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-200 flex flex-col items-center">
                <div className="w-40 h-48 bg-gray-200 rounded-3xl border-4 border-white shadow-xl overflow-hidden mb-6">
                  <img
                    src={getImageUrl(formData.imageUrl, formData.firstName, 'member')}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${formData.firstName || 'U'}+${formData.lastName || 'U'}&background=FF4B4B&color=fff&bold=true&size=128`;
                    }}
                  />
                </div>
                <Input
                  label="URL de l'image"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="membre_001.jpg"
                  icon={<AiOutlineCamera />}
                  error={errors.imageUrl}
                />
                <p className="text-[8px] font-bold text-gray-400 mt-4 text-center">
                  L'image doit être dans le dossier membre du GitHub
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="Jean"
                  required
                />
                <Input
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="DUPONT"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date de naissance"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  error={errors.birthDate}
                  icon={<AiOutlineCalendar />}
                  required
                />
                <Select
                  label="Genre"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: Gender.MALE, label: 'Homme' },
                    { value: Gender.FEMALE, label: 'Femme' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label="District"
                  name="districtId"
                  value={formData.districtId?.toString() || ''}
                  onChange={handleChange}
                  error={errors.districtId}
                  options={[
                    { value: '', label: 'Sélectionner...' },
                    ...districts.map(d => ({ value: d.id?.toString() || '', label: d.name }))
                  ]}
                  icon={<AiOutlineGlobal />}
                  disabled={loadingDistricts}
                  required
                />
                <Select
                  label="Tribu"
                  name="tributeId"
                  value={formData.tributeId?.toString() || ''}
                  onChange={handleChange}
                  error={errors.tributeId}
                  options={[
                    { value: '', label: 'Sélectionner...' },
                    ...tributes.map(t => ({ value: t.id?.toString() || '', label: t.name }))
                  ]}
                  icon={<AiOutlineTeam />}
                  disabled={loadingTributes}
                  required
                />
                <Select
                  label="Statut"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: MemberStatus.WORKER, label: 'Travailleur' },
                    { value: MemberStatus.STUDENT, label: 'Étudiant' }
                  ]}
                />
              </div>

              <Input
                label="Téléphone"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
                placeholder="034 00 000 00"
                icon={<AiOutlinePhone />}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
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
              Créer le membre
            </Button>
          </div>
        </form>
      </div>

      {/* Alert de confirmation d'annulation */}
      <Alert
        isOpen={showCancelAlert}
        variant="warning"
        title="Annuler la création"
        message="Voulez-vous vraiment annuler ? Les données saisies seront perdues."
        confirmText="QUITTER"
        onClose={() => setShowCancelAlert(false)}
        onConfirm={() => navigate('/admin/members')}
      />
    </div>
  );
};

export default MemberCreate;