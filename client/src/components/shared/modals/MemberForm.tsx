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
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { getImageUrl } from '../../../lib/constant/constant';
import DistrictService from '../../../services/district.services';
import TributeService from '../../../services/tribute.services';
import { DistrictModel, TributeModel } from '../../../lib/types/models/localisation.models.types';
import type { PersonModel, PersonResponseModel } from '../../../lib/types/models/person.models.types';
import { Gender, MemberStatus } from '../../../lib/types/enum.types';
import { isValidPhoneNumber, isValidImageUrl, isValidBirthDate } from '../../../lib/helper/validationHelpers';
import { getErrorMessage } from '../../../lib/helper/errorHelpers';
import { useMembers } from '../../../hooks/useMembers';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: PersonResponseModel | null;
  onSuccess?: () => void;
  allMembers: PersonResponseModel[];
}

const MemberForm: React.FC<MemberFormProps> = ({ isOpen, onClose, memberToEdit, onSuccess, allMembers }) => {
  const [districts, setDistricts] = useState<DistrictModel[]>([]);
  const [tributes, setTributes] = useState<TributeModel[]>([]);
  const [isChildMode, setIsChildMode] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonModel>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { createMember, updateMember, addChild } = useMembers();

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([DistrictService.getAll(), TributeService.getAll()])
      .then(([distData, tribData]) => {
        setDistricts(distData || []);
        setTributes(tribData || []);
      })
      .catch(() => {
        setDistricts([]);
        setTributes([]);
      });

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
        parentId: ''
      });
      setIsChildMode(false);
    }

    setErrors({});
  }, [isOpen, memberToEdit]);

  const parentOptions = useMemo(
    () =>
      allMembers
        .filter((m) => m.id !== memberToEdit?.id && !m.parentId)
        .map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })),
    [allMembers, memberToEdit]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    const numericFields = ['districtId', 'tributeId'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value ? parseInt(value, 10) : 0) : value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const newErrors: Record<string, string> = {};

      if (!formData.firstName || !formData.firstName.toString().trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName || !formData.lastName.toString().trim()) newErrors.lastName = 'Le nom est requis';
      if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber.toString())) newErrors.phoneNumber = 'Numéro de téléphone invalide';
      if (formData.imageUrl && !isValidImageUrl(formData.imageUrl.toString())) newErrors.imageUrl = "URL d'image invalide";
      if (formData.birthDate && !isValidBirthDate(formData.birthDate.toString())) newErrors.birthDate = 'Date de naissance invalide';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      if (memberToEdit) {
        await updateMember.mutateAsync({ id: memberToEdit.id, data: formData as PersonModel });
      } else {
        if (isChildMode && formData.parentId) {
          await addChild.mutateAsync({ parentId: formData.parentId, childData: formData as PersonModel });
        } else {
          await createMember.mutateAsync(formData as PersonModel);
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: unknown) {
      setErrors({ _form: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-brand-text/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-border-dark rounded-[2.5rem] md:rounded-[3rem] w-full max-w-5xl h-full max-h-[98vh] md:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-4 border-white dark:border-brand-border">
        <div className="px-8 py-6 border-b border-brand-bg dark:border-brand-bg/10 flex justify-between items-center bg-white dark:bg-transparent shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border-b-4 border-brand-primary shadow-sm">
              <AiOutlineTeam size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-text uppercase leading-none">{memberToEdit ? 'Modifier Membre' : 'Ajouter Membre'}</h2>
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mt-1 italic">Registre Fizanakara</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all active:scale-90 text-brand-muted" disabled={loading}>
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-brand-bg/30 dark:bg-brand-bg/5">
          <div className="max-w-xs mx-auto flex gap-2 p-1.5 bg-white dark:bg-brand-border-dark border-2 border-brand-border rounded-2xl mb-10 shadow-sm">
            <button type="button" onClick={() => { setIsChildMode(false); setFormData(prev => ({ ...prev, parentId: '' })); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isChildMode ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:bg-brand-bg dark:hover:bg-brand-bg/10'}`} disabled={loading}>Titulaire</button>
            <button type="button" onClick={() => setIsChildMode(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isChildMode ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:bg-brand-bg dark:hover:bg-brand-bg/10'}`} disabled={loading}>Enfant</button>
          </div>

          <form id="member-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-brand-border-dark p-6 rounded-[2.5rem] border-2 border-brand-border border-b-8 flex flex-col items-center shadow-sm">
                <div className="w-36 h-44 bg-brand-bg dark:bg-brand-bg/10 rounded-3xl border-4 border-white dark:border-brand-border shadow-xl overflow-hidden mb-6 group relative">
                  <img src={getImageUrl(formData.imageUrl, formData.firstName, 'member')} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <Input label="Référence Image" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="Ex: membre_01.jpg" icon={<AiOutlineCamera />} disabled={loading} error={errors.imageUrl} />
              </div>

              {isChildMode && (
                <div className="p-6 bg-orange-50 dark:bg-orange-500/5 rounded-4xl border-2 border-dashed border-orange-200 dark:border-orange-500/20 animate-in slide-in-from-top-4">
                  <Select label="Parent responsable" name="parentId" value={formData.parentId || ''} onChange={handleChange} error={errors.parentId} options={parentOptions} icon={<AiOutlineUser />} disabled={loading} required={isChildMode} />
                  <div className="flex items-start gap-2 mt-4 text-orange-700 dark:text-orange-400">
                    <AiOutlineInfoCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold uppercase leading-tight tracking-tight">L'enfant sera rattaché aux cotisations du parent.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Prénom" name="firstName" value={formData.firstName || ''} onChange={handleChange} error={errors.firstName} placeholder="Ex: Jean" disabled={loading} required />
                <Input label="Nom" name="lastName" value={formData.lastName || ''} onChange={handleChange} error={errors.lastName} placeholder="Ex: DUPONT" disabled={loading} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Date de naissance" type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} error={errors.birthDate} icon={<AiOutlineCalendar />} disabled={loading} required />
                <Select label="Sexe" name="gender" value={formData.gender || 'MALE'} onChange={handleChange} options={[{ value: 'MALE', label: 'Masculin' }, { value: 'FEMALE', label: 'Féminin' }]} disabled={loading} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select label="District" name="districtId" value={formData.districtId?.toString() || ''} onChange={handleChange} error={errors.districtId} options={districts.map(d => ({ value: d.id?.toString() || '', label: d.name }))} icon={<AiOutlineGlobal />} disabled={loading || districts.length === 0} required />
                <Select label="Tribu" name="tributeId" value={formData.tributeId?.toString() || ''} onChange={handleChange} error={errors.tributeId} options={tributes.map(t => ({ value: t.id?.toString() || '', label: t.name }))} icon={<AiOutlineTeam />} disabled={loading || tributes.length === 0} required />
                <Select label="Statut" name="status" value={formData.status || 'WORKER'} onChange={handleChange} options={[{ value: 'WORKER', label: 'Travailleur' }, { value: 'STUDENT', label: 'Étudiant' }]} disabled={loading} />
              </div>

              <Input label="Numéro de téléphone" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} error={errors.phoneNumber} placeholder="034 00 000 00" icon={<span className="text-[10px] font-black text-brand-muted">+261</span>} disabled={loading} />

              {errors._form && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 rounded-3xl">
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold">{errors._form}</p>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="px-8 py-6 bg-white dark:bg-brand-border-dark border-t-2 border-brand-border flex flex-col md:flex-row items-center gap-4 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full md:w-auto px-10" disabled={loading}>Annuler</Button>
          <Button type="submit" form="member-form" disabled={loading} className="w-full md:flex-1 flex items-center justify-center gap-2" isLoading={loading}>{memberToEdit ? 'Enregistrer les modifications' : 'Confirmer la création'}</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default memo(MemberForm);