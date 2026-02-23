import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AiOutlineCalendar,
  AiOutlinePhone,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineCamera,
  AiOutlineArrowLeft,
  AiOutlineSave,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import { Gender, MemberStatus } from '../../lib/types/enum.types';
import type { PersonModel } from '../../lib/types/models/person.models.types';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import { isValidPhoneNumber, isValidBirthDate } from '../../lib/helper/validationHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/constant/constant';
import { calculateAge } from '../../lib/helper/dateHelpers';

const MemberEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, updateMember, promoteMember } = useMembers();
  const { districts, loadingDistricts } = useDistrict();
  const { tributes, loadingTributes } = useTribute();

  const [formData, setFormData] = useState<Partial<PersonModel>>({});
  const [originalMember, setOriginalMember] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showPromoteAlert, setShowPromoteAlert] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // Charger les données du membre
  useEffect(() => {
    if (id && members.length > 0) {
      const member = members.find(m => m.id === id);
      if (member) {
        setOriginalMember(member);
        setFormData({
          firstName: member.firstName,
          lastName: member.lastName,
          birthDate: member.birthDate,
          gender: member.gender,
          phoneNumber: member.phoneNumber,
          imageUrl: member.imageUrl,
          status: member.status,
          districtId: member.districtId,
          tributeId: member.tributeId
        });
      }
    }
  }, [id, members]);

  if (!originalMember) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 max-w-md mx-auto">
          <AiOutlineCloseCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <p className="font-black text-xl opacity-60 mb-2">Membre introuvable</p>
          <Button onClick={() => navigate('/admin/members')}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

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
      await updateMember.mutateAsync({ id: id!, data: formData as PersonModel });
      toast.success('Membre mis à jour avec succès');
      navigate(`/admin/members/${id}`);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = async () => {
    setIsPromoting(true);
    try {
      await promoteMember.mutateAsync(id!);
      toast.success('Membre promu avec succès');
      navigate(`/admin/members/${id}`);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la promotion');
    } finally {
      setIsPromoting(false);
      setShowPromoteAlert(false);
    }
  };

  const age = calculateAge(formData.birthDate || '');

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
              Modifier Membre
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              N° {originalMember.sequenceNumber}
            </p>
          </div>
        </div>

        {!originalMember.isActiveMember && (
          <Button
            variant="warning"
            onClick={() => setShowPromoteAlert(true)}
            className="flex items-center gap-2"
            isLoading={isPromoting}
          >
            <AiOutlineCheckCircle size={18} />
            Promouvoir
          </Button>
        )}
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Avatar et infos statiques */}
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

                <div className="w-full mt-6 p-4 bg-white rounded-2xl border-2 border-gray-200">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Âge</p>
                  <p className="font-black text-lg">{age} ans</p>
                </div>

                <div className="w-full mt-4 p-4 bg-white rounded-2xl border-2 border-gray-200">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Statut actuel</p>
                  <div className="flex items-center gap-2 mt-1">
                    {originalMember.isActiveMember ? (
                      <AiOutlineCheckCircle className="text-green-500" size={16} />
                    ) : (
                      <AiOutlineCloseCircle className="text-red-500" size={16} />
                    )}
                    <p className="font-black text-sm">
                      {originalMember.isActiveMember ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Informations éditables */}
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
                  label="Statut professionnel"
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

          {/* Boutons d'action */}
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
              Enregistrer les modifications
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
        onConfirm={() => navigate(`/admin/members/${id}`)}
      />

      {/* Alert de promotion */}
      <Alert
        isOpen={showPromoteAlert}
        variant="warning"
        title="Promouvoir le membre"
        message="Le membre deviendra actif et pourra bénéficier des cotisations. Confirmez-vous ?"
        confirmText="PROMOUVOIR"
        onClose={() => setShowPromoteAlert(false)}
        onConfirm={handlePromote}
      />
    </div>
  );
};

export default MemberEdit;