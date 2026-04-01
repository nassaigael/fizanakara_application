import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AiOutlineClose,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineCamera,
  AiOutlineCalendar,
  AiOutlineUserAdd,
  AiOutlineLink,
  AiOutlinePhone
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
import ParentSearchInput from '../../ui/ParentSearchInput';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: PersonResponse | null;
  onSuccess?: () => void;
  parentId?: string;
}

type FormType = 'independent' | 'child';

const VALID_OPERATORS = ['32', '33', '34', '38', '37', '39'];

const formatPhoneNumber = (value: string, isDeleting: boolean = false): string => {
  if (isDeleting) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    }
    if (cleaned.length <= 5) {
      return `+${cleaned}`;
    }
  }

  let cleaned = value.replace(/\D/g, '');

  if (!cleaned) return '';

  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  if (!cleaned.startsWith('261')) {
    cleaned = '261' + cleaned;
  }

  cleaned = cleaned.substring(0, 12);

  if (cleaned.length >= 5) {
    const operator = cleaned.substring(3, 5);
    if (!VALID_OPERATORS.includes(operator)) {
      const rawWithoutPrefix = cleaned.replace(/^261/, '');
      return rawWithoutPrefix;
    }
  }

  if (cleaned.length >= 5) {
    const countryCode = cleaned.substring(0, 3);
    const part1 = cleaned.substring(3, 5);
    const part2 = cleaned.substring(5, 7);
    const part3 = cleaned.substring(7, 10);
    const part4 = cleaned.substring(10, 12);

    let formatted = `+${countryCode}`;
    if (part1) formatted += ` ${part1}`;
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += ` ${part3}`;
    if (part4) formatted += ` ${part4}`;

    return formatted.trim();
  }

  return cleaned.length > 3 ? `+${cleaned}` : `+${cleaned}`;
};

const getRawPhoneNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, '');
};

export const MemberForm: React.FC<MemberFormProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSuccess,
  parentId
}) => {
  const { districts, tributes } = useLocations();
  const { members, createMember, updateMember, addChild } = useMembers();

  const [formType, setFormType] = useState<FormType>(parentId ? 'child' : 'independent');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string>(parentId || '');
  const [, setSelectedParentName] = useState<string>('');

  const [independentData, setIndependentData] = useState<Partial<PersonDto>>({
    firstName: '',
    lastName: '',
    birthDate: new Date().toISOString().split('T')[0],
    gender: Gender.MALE,
    imageUrl: '',
    phoneNumber: '',
    status: MemberStatus.STUDENT,
    districtId: districts[0]?.id || 0,
    tributeId: tributes[0]?.id || 0,
  });

  const [childData, setChildData] = useState<Partial<PersonDto>>({
    firstName: '',
    lastName: '',
    birthDate: new Date().toISOString().split('T')[0],
    gender: Gender.MALE,
    imageUrl: '',
    phoneNumber: '',
    status: MemberStatus.STUDENT,
    districtId: districts[0]?.id || 0,
    tributeId: tributes[0]?.id || 0,
  });


  useEffect(() => {
    if (!isOpen) return;

    if (memberToEdit) {
      // Edit mode
      const commonData = {
        firstName: memberToEdit.firstName,
        lastName: memberToEdit.lastName,
        birthDate: memberToEdit.birthDate,
        gender: memberToEdit.gender,
        imageUrl: memberToEdit.imageUrl,
        phoneNumber: memberToEdit.phoneNumber ? formatPhoneNumber(memberToEdit.phoneNumber, false) : '',
        status: memberToEdit.status,
        districtId: memberToEdit.districtId,
        tributeId: memberToEdit.tributeId,
      };
      setIndependentData(commonData);
      setChildData(commonData);
      setImagePreview(memberToEdit.imageUrl || null);
      setFormType(memberToEdit.parentId ? 'child' : 'independent');
      if (memberToEdit.parentId) {
        setSelectedParentId(memberToEdit.parentId);
        setSelectedParentName(memberToEdit.parentName || '');
      }
    } else {
      // Create mode
      setIndependentData({
        firstName: '',
        lastName: '',
        birthDate: new Date().toISOString().split('T')[0],
        gender: Gender.MALE,
        imageUrl: '',
        phoneNumber: '',
        status: MemberStatus.STUDENT,
        districtId: districts[0]?.id || 0,
        tributeId: tributes[0]?.id || 0,
      });
      setChildData({
        firstName: '',
        lastName: '',
        birthDate: new Date().toISOString().split('T')[0],
        gender: Gender.MALE,
        imageUrl: '',
        phoneNumber: '',
        status: MemberStatus.STUDENT,
        districtId: districts[0]?.id || 0,
        tributeId: tributes[0]?.id || 0,
      });
      setImagePreview(null);
      setFormType(parentId ? 'child' : 'independent');
      setSelectedParentId(parentId || '');
      setSelectedParentName('');
    }
    setErrors({});
  }, [isOpen, memberToEdit, parentId, districts, tributes]);

  const handleIndependentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['districtId', 'tributeId'];

    if (name === 'phoneNumber') {
      const currentPhone = independentData.phoneNumber || '';
      const isDeleting = value.length < currentPhone.length;

      // Appliquer le formatage automatique pour le numéro de téléphone
      const formatted = formatPhoneNumber(value, isDeleting);

      // Vérifier si l'opérateur est valide
      const rawAfterFormat = getRawPhoneNumber(formatted);
      if (rawAfterFormat.length >= 5 && !isDeleting) {
        const operator = rawAfterFormat.substring(3, 5);
        if (!VALID_OPERATORS.includes(operator)) {
          // Si l'opérateur n'est pas valide et qu'on n'est pas en train de supprimer, on ne met pas à jour
          return;
        }
      }

      setIndependentData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setIndependentData(prev => ({
        ...prev,
        [name]: numericFields.includes(name) ? (value ? parseInt(value, 10) : 0) : value
      }));
    }

    if (errors[name] && name !== 'phoneNumber') {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['districtId', 'tributeId'];

    if (name === 'phoneNumber') {
      const currentPhone = childData.phoneNumber || '';
      const isDeleting = value.length < currentPhone.length;

      // Appliquer le formatage automatique pour le numéro de téléphone
      const formatted = formatPhoneNumber(value, isDeleting);

      // Vérifier si l'opérateur est valide
      const rawAfterFormat = getRawPhoneNumber(formatted);
      if (rawAfterFormat.length >= 5 && !isDeleting) {
        const operator = rawAfterFormat.substring(3, 5);
        if (!VALID_OPERATORS.includes(operator)) {
          // Si l'opérateur n'est pas valide et qu'on n'est pas en train de supprimer, on ne met pas à jour
          return;
        }
      }

      setChildData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setChildData(prev => ({
        ...prev,
        [name]: numericFields.includes(name) ? (value ? parseInt(value, 10) : 0) : value
      }));
    }

    if (errors[name] && name !== 'phoneNumber') {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isIndependent: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        if (isIndependent) {
          setIndependentData(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else {
          setChildData(prev => ({ ...prev, imageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateIndependent = (): boolean => {
    try {
      // Nettoyer le numéro de téléphone pour la validation (enlever les espaces)
      const rawPhone = getRawPhoneNumber(independentData.phoneNumber || '');

      // Vérifier si l'opérateur est valide
      if (rawPhone && rawPhone.length >= 5) {
        const operator = rawPhone.substring(3, 5);
        if (!VALID_OPERATORS.includes(operator)) {
          // Ne pas afficher d'erreur, juste empêcher la soumission
          return false;
        }
      }

      const dataToValidate = {
        ...independentData,
        phoneNumber: rawPhone
      };
      personSchema.parse(dataToValidate);
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        for (const err of error.errors) {
          if (err.path && err.path[0]) {
            // Ne pas ajouter d'erreur pour phoneNumber si c'est un problème d'opérateur
            if (err.path[0] === 'phoneNumber' && independentData.phoneNumber) {
              const raw = getRawPhoneNumber(independentData.phoneNumber);
              if (raw.length >= 5) {
                const operator = raw.substring(3, 5);
                if (!VALID_OPERATORS.includes(operator)) {
                  // Ignorer cette erreur, ne pas l'afficher
                  continue;
                }
              }
            }
            newErrors[err.path[0].toString()] = err.message;
          }
        }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  };

  const validateChild = (): boolean => {
    try {
      if (!selectedParentId) {
        setErrors(prev => ({ ...prev, parentId: 'Veuillez sélectionner un parent' }));
        return false;
      }

      // Nettoyer le numéro de téléphone pour la validation (enlever les espaces)
      const rawPhone = getRawPhoneNumber(childData.phoneNumber || '');

      // Vérifier si l'opérateur est valide
      if (rawPhone && rawPhone.length >= 5) {
        const operator = rawPhone.substring(3, 5);
        if (!VALID_OPERATORS.includes(operator)) {
          // Ne pas afficher d'erreur, juste empêcher la soumission
          return false;
        }
      }

      const dataToValidate = {
        ...childData,
        phoneNumber: rawPhone
      };
      personSchema.parse(dataToValidate);
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        for (const err of error.errors) {
          if (err.path && err.path[0]) {
            // Ne pas ajouter d'erreur pour phoneNumber si c'est un problème d'opérateur
            if (err.path[0] === 'phoneNumber' && childData.phoneNumber) {
              const raw = getRawPhoneNumber(childData.phoneNumber);
              if (raw.length >= 5) {
                const operator = raw.substring(3, 5);
                if (!VALID_OPERATORS.includes(operator)) {
                  // Ignorer cette erreur, ne pas l'afficher
                  continue;
                }
              }
            }
            newErrors[err.path[0].toString()] = err.message;
          }
        }
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = false;
    if (formType === 'independent') {
      isValid = validateIndependent();
    } else {
      isValid = validateChild();
    }

    if (!isValid) return;

    setLoading(true);
    try {
      if (memberToEdit) {
        const dataToUpdate = formType === 'independent' ? independentData : childData;
        // Nettoyer le numéro de téléphone avant l'envoi
        const cleanedData = {
          ...dataToUpdate,
          phoneNumber: getRawPhoneNumber(dataToUpdate.phoneNumber || '')
        };
        await updateMember.mutateAsync({ id: memberToEdit.id, data: cleanedData as PersonDto });
        toast.success('Membre modifié');
      } else {
        if (formType === 'child') {
          // Nettoyer le numéro de téléphone avant l'envoi
          const cleanedData = {
            ...childData,
            phoneNumber: getRawPhoneNumber(childData.phoneNumber || '')
          };
          await addChild.mutateAsync({ parentId: selectedParentId, childData: cleanedData as PersonDto });
          toast.success('Enfant ajouté avec succès');
        } else {
          // Nettoyer le numéro de téléphone avant l'envoi
          const cleanedData = {
            ...independentData,
            phoneNumber: getRawPhoneNumber(independentData.phoneNumber || '')
          };
          await createMember.mutateAsync(cleanedData as PersonDto);
          toast.success('Membre créé avec succès');
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

  const resetForms = () => {
    setIndependentData({
      firstName: '',
      lastName: '',
      birthDate: new Date().toISOString().split('T')[0],
      gender: Gender.MALE,
      imageUrl: '',
      phoneNumber: '',
      status: MemberStatus.STUDENT,
      districtId: districts[0]?.id || 0,
      tributeId: tributes[0]?.id || 0,
    });
    setChildData({
      firstName: '',
      lastName: '',
      birthDate: new Date().toISOString().split('T')[0],
      gender: Gender.MALE,
      imageUrl: '',
      phoneNumber: '',
      status: MemberStatus.STUDENT,
      districtId: districts[0]?.id || 0,
      tributeId: tributes[0]?.id || 0,
    });
    setSelectedParentId('');
    setSelectedParentName('');
    setImagePreview(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const currentData = formType === 'independent' ? independentData : childData;
  const handleChange = formType === 'independent' ? handleIndependentChange : handleChildChange;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[98vh] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border-b-4 border-brand-primary">
              {formType === 'independent' ? <AiOutlineUserAdd size={24} /> : <AiOutlineLink size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase">
                {memberToEdit ? 'Modifier le membre' : formType === 'independent' ? 'Ajouter un membre indépendant' : 'Ajouter un enfant'}
              </h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {formType === 'independent' ? 'Parent / Membre indépendant' : 'Enfant à charge'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
            disabled={loading}
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Form Type Switcher */}
        {!memberToEdit && (
          <div className="px-8 pt-4">
            <div className="max-w-md mx-auto flex gap-2 p-1.5 bg-gray-100 border-2 border-gray-200 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormType('independent')}
                className={`
                  flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                  flex items-center justify-center gap-2
                  ${formType === 'independent'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-200'
                  }
                `}
                disabled={loading}
              >
                <AiOutlineUserAdd size={14} />
                Indépendant (Parent)
              </button>
              <button
                type="button"
                onClick={() => setFormType('child')}
                className={`
                  flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                  flex items-center justify-center gap-2
                  ${formType === 'child'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-200'
                  }
                `}
                disabled={loading}
              >
                <AiOutlineLink size={14} />
                Enfant (À charge)
              </button>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <form id="member-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Photo */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-gray-200 border-b-8 flex flex-col items-center">
                <div className="w-36 h-44 bg-gray-100 rounded-3xl border-4 border-white shadow-xl overflow-hidden mb-6 group relative flex items-center justify-center">
                  {imagePreview || currentData.imageUrl ? (
                    <img
                      src={imagePreview || getImageUrl(currentData.imageUrl, 'member')}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-4xl font-black text-gray-400">
                      {getInitials(currentData.firstName || '', currentData.lastName || '')}
                    </span>
                  )}
                </div>
                <Input
                  label="URL de l'image"
                  name="imageUrl"
                  value={currentData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="member_01.jpg"
                  icon={<AiOutlineCamera />}
                  disabled={loading}
                  error={errors.imageUrl}
                />
                <label className="mt-2 text-[8px] text-gray-400 font-bold cursor-pointer hover:text-brand-primary uppercase">
                  ou télécharger une image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, formType === 'independent')}
                  />
                </label>
              </div>

              {/* Parent Selection - Only for child type */}
              {formType === 'child' && !memberToEdit && (
                <div className="p-6 bg-orange-50 rounded-[2.5rem] border-2 border-dashed border-orange-200">
                  <ParentSearchInput
                    members={members}
                    value={selectedParentId}
                    onChange={(id: string, name: string) => {
                      setSelectedParentId(id);
                      setSelectedParentName(name);
                      if (errors.parentId) {
                        setErrors(prev => {
                          const copy = { ...prev };
                          delete copy.parentId;
                          return copy;
                        });
                      }
                    }}
                    error={errors.parentId}
                    disabled={loading}
                    required
                  />
                </div>
              )}
            </div>

            {/* Right Column - Fields */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Prénom"
                  name="firstName"
                  value={currentData.firstName || ''}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="Jean"
                  disabled={loading}
                  required
                />
                <Input
                  label="Nom"
                  name="lastName"
                  value={currentData.lastName || ''}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="DOE"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date de naissance"
                  type="date"
                  name="birthDate"
                  value={currentData.birthDate || ''}
                  onChange={handleChange}
                  error={errors.birthDate}
                  icon={<AiOutlineCalendar />}
                  disabled={loading}
                  required
                />
                <Select
                  label="Genre"
                  name="gender"
                  value={currentData.gender || Gender.MALE}
                  onChange={handleChange}
                  options={[
                    { value: Gender.MALE, label: 'Homme' },
                    { value: Gender.FEMALE, label: 'Femme' }
                  ]}
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label="District"
                  name="districtId"
                  value={currentData.districtId?.toString() || ''}
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
                  value={currentData.tributeId?.toString() || ''}
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
                  value={currentData.status || MemberStatus.STUDENT}
                  onChange={handleChange}
                  options={[
                    { value: MemberStatus.WORKER, label: 'Travailleur' },
                    { value: MemberStatus.STUDENT, label: 'Étudiant' }
                  ]}
                  disabled={loading}
                />
              </div>

              <Input
                label="Numéro de téléphone"
                name="phoneNumber"
                value={currentData.phoneNumber || ''}
                onChange={handleChange}
                error={errors.phoneNumber}
                placeholder="+261 34 00 000 00"
                icon={<AiOutlinePhone size={14} className="text-gray-400" />}
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
            onClick={handleClose}
            className="w-full md:w-auto px-10"
            disabled={loading}
          >
            ANNULER
          </Button>
          <Button
            type="submit"
            form="member-form"
            disabled={loading}
            className="w-full md:flex-1"
            isLoading={loading}
          >
            {memberToEdit ? 'ENREGISTRER LES MODIFICATIONS' : formType === 'child' ? 'AJOUTER L\'ENFANT' : 'CRÉER LE MEMBRE'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MemberForm;