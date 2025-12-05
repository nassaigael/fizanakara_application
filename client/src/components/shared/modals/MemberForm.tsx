import React, { memo, useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AiOutlineClose,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineUser,
  AiOutlineInfoCircle,
  AiOutlineCamera,
  AiOutlineCalendar
} from 'react-icons/ai';
import { useMembers } from '../../../hooks/useMembers';
import { useLocations } from '../../../hooks/useLocations';
import { PersonDto, PersonResponse, Gender, MemberStatus } from '../../../lib/types';
import { personSchema } from '../../../lib/validators/member.validator';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { getImageUrl } from '../../../lib/constant/constant';
import { getErrorMessage, getInitials } from '../../../lib/helper';
import toast from 'react-hot-toast';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: PersonResponse | null;
  onSuccess?: () => void;
  parentId?: string;
}

export const MemberForm: React.FC<MemberFormProps> = ({ 
  isOpen, 
  onClose, 
  memberToEdit, 
  onSuccess, 
  parentId 
}) => {
  const { districts, tributes } = useLocations();
  const { members, createMember, updateMember, addChild } = useMembers();
  
  const [isChildMode, setIsChildMode] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonDto>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (memberToEdit) {
      setFormData({
        firstName: memberToEdit.firstName,
        lastName: memberToEdit.lastName,
        birthDate: memberToEdit.birthDate,
        gender: memberToEdit.gender,
        imageUrl: memberToEdit.imageUrl,
        phoneNumber: memberToEdit.phoneNumber,
        status: memberToEdit.status,
        districtId: memberToEdit.districtId,
        tributeId: memberToEdit.tributeId,
        parentId: memberToEdit.parentId
      });
      setImagePreview(memberToEdit.imageUrl || null);
      setIsChildMode(!!memberToEdit.parentId);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        birthDate: new Date().toISOString().split('T')[0],
        gender: Gender.MALE,
        imageUrl: '',
        phoneNumber: '',
        status: MemberStatus.WORKER,
        districtId: 0,
        tributeId: 0,
        parentId: parentId || ''
      });
      setImagePreview(null);
      setIsChildMode(!!parentId);
    }
    setErrors({});
  }, [isOpen, memberToEdit, parentId]);

  const parentOptions = useMemo(() => 
    members
      .filter(m => m.id !== memberToEdit?.id && !m.parentId)
      .map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })),
    [members, memberToEdit]
  );

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    try {
      personSchema.parse(formData);
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (memberToEdit) {
        await updateMember.mutateAsync({ id: memberToEdit.id, data: formData as PersonDto });
        toast.success('Membre mis à jour');
      } else {
        if (isChildMode && formData.parentId) {
          await addChild.mutateAsync({ parentId: formData.parentId, childData: formData as PersonDto });
          toast.success('Enfant ajouté');
        } else {
          await createMember.mutateAsync(formData as PersonDto);
          toast.success('Membre créé');
        }
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[98vh] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border-b-4 border-brand-primary">
              <AiOutlineTeam size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase">
                {memberToEdit ? 'Modifier Membre' : 'Ajouter Membre'}
              </h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Registre Fizanakara
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
            disabled={loading}
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Mode switch */}
        {!memberToEdit && (
          <div className="px-8 pt-4">
            <div className="max-w-xs mx-auto flex gap-2 p-1.5 bg-gray-100 border-2 border-gray-200 rounded-2xl">
              <button
                type="button"
                onClick={() => { setIsChildMode(false); setFormData(prev => ({ ...prev, parentId: '' })); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  !isChildMode ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                Titulaire
              </button>
              <button
                type="button"
                onClick={() => setIsChildMode(true)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isChildMode ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                Enfant
              </button>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <form id="member-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Colonne gauche - Photo */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-gray-200 border-b-8 flex flex-col items-center">
                <div className="w-36 h-44 bg-gray-100 rounded-3xl border-4 border-white shadow-xl overflow-hidden mb-6 group relative flex items-center justify-center">
                  {(() => {
                      const url = imagePreview || getImageUrl(formData.imageUrl, `${formData.firstName || ''} ${formData.lastName || ''}`);
                      if (url) {
                          return (
                              <img
                                src={url}
                                alt="Avatar"
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                          );
                      }
                      const initials = getInitials(formData.firstName || '', formData.lastName || '');
                      return (
                          <span className="text-4xl font-black text-gray-400">
                              {initials}
                          </span>
                      );
                  })()}
                </div>
                <Input
                  label="URL Image"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="membre_01.jpg"
                  icon={<AiOutlineCamera />}
                  disabled={loading}
                  error={errors.imageUrl}
                />
                <label className="mt-2 text-[8px] text-gray-400 font-bold cursor-pointer hover:text-brand-primary">
                  ou importez une image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {isChildMode && (
                <div className="p-6 bg-orange-50 rounded-4xl border-2 border-dashed border-orange-200">
                  <Select
                    label="Parent responsable"
                    name="parentId"
                    value={formData.parentId || ''}
                    onChange={handleChange}
                    error={errors.parentId}
                    options={parentOptions}
                    icon={<AiOutlineUser />}
                    disabled={loading}
                    required={isChildMode}
                  />
                  <div className="flex items-start gap-2 mt-4 text-orange-700">
                    <AiOutlineInfoCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold uppercase leading-tight">
                      L'enfant sera rattaché aux cotisations du parent.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite - Champs */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="Jean"
                  disabled={loading}
                  required
                />
                <Input
                  label="Nom"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="DUPONT"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date de naissance"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate || ''}
                  onChange={handleChange}
                  error={errors.birthDate}
                  icon={<AiOutlineCalendar />}
                  disabled={loading}
                  required
                />
                <Select
                  label="Sexe"
                  name="gender"
                  value={formData.gender || Gender.MALE}
                  onChange={handleChange}
                  options={[
                    { value: Gender.MALE, label: 'Masculin' },
                    { value: Gender.FEMALE, label: 'Féminin' }
                  ]}
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label="District"
                  name="districtId"
                  value={formData.districtId?.toString() || ''}
                  onChange={handleChange}
                  error={errors.districtId}
                  options={districts.map(d => ({ value: d.id?.toString() || '', label: d.name }))}
                  icon={<AiOutlineGlobal />}
                  disabled={loading || districts.length === 0}
                  required
                />
                <Select
                  label="Tribu"
                  name="tributeId"
                  value={formData.tributeId?.toString() || ''}
                  onChange={handleChange}
                  error={errors.tributeId}
                  options={tributes.map(t => ({ value: t.id?.toString() || '', label: t.name }))}
                  icon={<AiOutlineTeam />}
                  disabled={loading || tributes.length === 0}
                  required
                />
                <Select
                  label="Statut"
                  name="status"
                  value={formData.status || MemberStatus.WORKER}
                  onChange={handleChange}
                  options={[
                    { value: MemberStatus.WORKER, label: 'Travailleur' },
                    { value: MemberStatus.STUDENT, label: 'Étudiant' }
                  ]}
                  disabled={loading}
                />
              </div>

              <Input
                label="Téléphone"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                error={errors.phoneNumber}
                placeholder="034 00 000 00"
                icon={<span className="text-[10px] font-black text-gray-400">+261</span>}
                disabled={loading}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t-2 border-gray-200 flex flex-col md:flex-row items-center gap-4 shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full md:w-auto px-10"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="member-form"
            disabled={loading}
            className="w-full md:flex-1"
            isLoading={loading}
          >
            {memberToEdit ? 'Enregistrer les modifications' : 'Confirmer la création'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default memo(MemberForm);