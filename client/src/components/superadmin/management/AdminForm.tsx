import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AiOutlineClose,
  AiOutlineUser,
  AiOutlinePlus,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlinePhone,
  AiOutlineCalendar,
  AiOutlineIdcard,
  AiOutlineGlobal
} from 'react-icons/ai';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';

interface AdminModalProps {
  form: any;
  isOpen: boolean;
  onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ form, isOpen, onClose }) => {
  const [loading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      form.resetForm();
    }
  }, [isOpen, form]);

  const handleClose = () => {
    form.resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[98vh] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border-b-4 border-red-600">
              <AiOutlineUser size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase">Nouvel administrateur</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Remplissez tous les champs obligatoires
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

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <form id="admin-form" onSubmit={form.handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-gray-200 border-b-8 flex flex-col items-center">
                <div className="w-36 h-44 bg-gray-100 rounded-3xl border-4 border-white shadow-xl overflow-hidden mb-6 group relative flex items-center justify-center">
                  {form.values.imageUrl ? (
                    <img
                      src={form.values.imageUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-red-100 flex items-center justify-center">
                      <AiOutlineUser size={48} className="text-red-400" />
                    </div>
                  )}
                </div>
                <Input
                  label="URL de l'image"
                  name="imageUrl"
                  value={form.values.imageUrl || ''}
                  onChange={form.handleChange}
                  placeholder="admin_username.jpg"
                  icon={<AiOutlineGlobal />}
                  disabled={loading}
                  error={form.errors.imageUrl}
                />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AiOutlineIdcard size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Identité</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Prénom"
                    name="firstName"
                    value={form.values.firstName || ''}
                    onChange={form.handleChange}
                    error={form.errors.firstName}
                    placeholder="Jean"
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Nom"
                    name="lastName"
                    value={form.values.lastName || ''}
                    onChange={form.handleChange}
                    error={form.errors.lastName}
                    placeholder="DOE"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AiOutlineMail size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Connexion</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.values.email || ''}
                    onChange={form.handleChange}
                    error={form.errors.email}
                    icon={<AiOutlineMail size={14} />}
                    placeholder="admin@fizanakara.mg"
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={form.values.password || ''}
                    onChange={form.handleChange}
                    error={form.errors.password}
                    icon={<AiOutlineLock size={14} />}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AiOutlineCalendar size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Personnel</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Date de naissance"
                    name="birthDate"
                    type="date"
                    value={form.values.birthDate || ''}
                    onChange={form.handleChange}
                    error={form.errors.birthDate}
                    icon={<AiOutlineCalendar size={14} />}
                    disabled={loading}
                    required
                  />
                  <Select
                    label="Genre"
                    name="gender"
                    value={form.values.gender || 'MALE'}
                    onChange={form.handleChange}
                    options={[
                      { value: 'MALE', label: 'Homme' },
                      { value: 'FEMALE', label: 'Femme' }
                    ]}
                    disabled={loading}
                    required
                  />
                  <Input
                    label="Numéro de téléphone"
                    name="phoneNumber"
                    value={form.values.phoneNumber || ''}
                    onChange={form.handleChange}
                    error={form.errors.phoneNumber}
                    icon={<AiOutlinePhone size={14} />}
                    placeholder="+261 34 00 000 00"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

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
            form="admin-form"
            disabled={loading}
            className="w-full md:flex-1"
            isLoading={form.isSubmitting}
          >
            <AiOutlinePlus size={18} className="mr-2" />
            CRÉER L'ADMINISTRATEUR
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminModal;