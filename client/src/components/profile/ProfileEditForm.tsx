import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { updateAdminSchema } from '../../lib/validators/admin.validator';
import { UpdateAdminRequest } from '../../lib/types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatDate } from '../../lib/helper';
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineCalendar } from 'react-icons/ai';

const ProfileEditForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<UpdateAdminRequest>({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      birthDate: user?.birthDate || '',
      phoneNumber: user?.phoneNumber || '',
      imageUrl: user?.imageUrl || ''
    },
    validationSchema: updateAdminSchema,
    onSubmit: async (data) => {
      await updateProfile(data);
      setIsEditing(false);
    }
  });

  if (!user) return null;
  if (!isEditing) {
    const infoItems = [
      { icon: AiOutlineUser, label: "Nom complet", value: `${user.firstName} ${user.lastName}` },
      { icon: AiOutlineMail, label: "Email", value: user.email },
      { icon: AiOutlinePhone, label: "Téléphone", value: user.phoneNumber || '-' },
      { icon: AiOutlineCalendar, label: "Date de naissance", value: formatDate(user.birthDate) }
    ];

    return (
      <div className="flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {infoItems.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-4 bg-white border-2 border-gray-200 rounded-xl p-3 shadow-[0_4px_0_0_#F0F0F0] hover:border-red-300 hover:shadow-[0_4px_0_0_#FECACA] transition-all cursor-default"
            >
              <div className="shrink-0 w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-600 transition-all duration-300 shadow-sm">
                <item.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">
                  {item.label}
                </p>
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
          <div className="md:col-span-2 w-full mt-2">
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto md:w-full lg:w-auto lg:min-w-[200px] mx-auto block"
            >
              MODIFIER
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Prénom" name="firstName" value={form.values.firstName || ''} onChange={form.handleChange} error={form.errors.firstName} />
        <Input label="Nom" name="lastName" value={form.values.lastName || ''} onChange={form.handleChange} error={form.errors.lastName} />
        <Input label="Date de naissance" name="birthDate" type="date" value={form.values.birthDate || ''} onChange={form.handleChange} error={form.errors.birthDate} />
        <Input label="Téléphone" name="phoneNumber" value={form.values.phoneNumber || ''} onChange={form.handleChange} error={form.errors.phoneNumber} />
        <div className="sm:col-span-2">
          <Input label="URL de l'avatar" name="imageUrl" value={form.values.imageUrl || ''} onChange={form.handleChange} error={form.errors.imageUrl} placeholder="admin_username.jpg" />
        </div>
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setIsEditing(false)}>ANNULER</Button>
          <Button variant="primary" onClick={form.handleSubmit} isLoading={form.isSubmitting}>ENREGISTRER</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;