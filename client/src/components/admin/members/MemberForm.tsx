import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AiOutlineClose,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineInfoCircle,
  AiOutlineCamera,
  AiOutlineCalendar,
  AiOutlineUserAdd,
  AiOutlineLink
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

  // Independent Member Form Data
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

  // Child Member Form Data
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
        phoneNumber: memberToEdit.phoneNumber,
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

    setIndependentData(prev => ({
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

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['districtId', 'tributeId'];

    setChildData(prev => ({
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
      personSchema.parse(independentData);
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

  const validateChild = (): boolean => {
    try {
      if (!selectedParentId) {
        setErrors(prev => ({ ...prev, parentId: 'Please select a parent' }));
        return false;
      }
      personSchema.parse(childData);
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
        await updateMember.mutateAsync({ id: memberToEdit.id, data: dataToUpdate as PersonDto });
        toast.success('Member updated');
      } else {
        if (formType === 'child') {
          await addChild.mutateAsync({ parentId: selectedParentId, childData: childData as PersonDto });
          toast.success('Child added successfully');
        } else {
          await createMember.mutateAsync(independentData as PersonDto);
          toast.success('Member created successfully');
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
                {memberToEdit ? 'Edit Member' : formType === 'independent' ? 'Add Independent Member' : 'Add Child Member'}
              </h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {formType === 'independent' ? 'Parent / Independent Member' : 'Dependent Child Member'}
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
                Independent (Parent)
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
                Child (Dependent)
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
                  label="Image URL"
                  name="imageUrl"
                  value={currentData.imageUrl || ''}
                  onChange={handleChange}
                  placeholder="member_01.jpg"
                  icon={<AiOutlineCamera />}
                  disabled={loading}
                  error={errors.imageUrl}
                />
                <label className="mt-2 text-[8px] text-gray-400 font-bold cursor-pointer hover:text-brand-primary uppercase">
                  or upload an image
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
                  <div className="flex items-start gap-2 mt-4 text-orange-700">
                    <AiOutlineInfoCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold uppercase leading-tight">
                      The child will be linked to the parent's contributions and family tree.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Fields */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={currentData.firstName || ''}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="John"
                  disabled={loading}
                  required
                />
                <Input
                  label="Last Name"
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
                  label="Birth Date"
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
                  label="Gender"
                  name="gender"
                  value={currentData.gender || Gender.MALE}
                  onChange={handleChange}
                  options={[
                    { value: Gender.MALE, label: 'Male' },
                    { value: Gender.FEMALE, label: 'Female' }
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
                  label="Tribute"
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
                  label="Status"
                  name="status"
                  value={currentData.status || MemberStatus.STUDENT}
                  onChange={handleChange}
                  options={[
                    { value: MemberStatus.WORKER, label: 'Worker' },
                    { value: MemberStatus.STUDENT, label: 'Student' }
                  ]}
                  disabled={loading}
                />
              </div>

              <Input
                label="Phone Number"
                name="phoneNumber"
                value={currentData.phoneNumber || ''}
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
            onClick={handleClose}
            className="w-full md:w-auto px-10"
            disabled={loading}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            form="member-form"
            disabled={loading}
            className="w-full md:flex-1"
            isLoading={loading}
          >
            {memberToEdit ? 'SAVE CHANGES' : formType === 'child' ? 'ADD CHILD' : 'CREATE MEMBER'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MemberForm;