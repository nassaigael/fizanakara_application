import React, { useState } from 'react';
import {
    AiOutlineUser,
    AiOutlineMail,
    AiOutlinePhone,
    AiOutlineCalendar,
    AiOutlineEdit,
    AiOutlineLock,
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
    AiOutlineLogout
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { updateAdminSchema } from '../../lib/validators/admin.validator';
import { UpdateAdminRequest } from '../../lib/types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import { formatDate, getInitials } from '../../lib/helper';
import { getImageUrl } from '../../lib/constant/constant';
import toast from 'react-hot-toast';

const AdminProfile: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordAlert, setShowPasswordAlert] = useState(false);

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
            toast.success('Profil mis à jour');
        }
    });

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-primary text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AiOutlineUser size={32} />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.h1} text-3xl`}>MON PROFIL</h1>
                        <p className={`${THEME.font.muted} mt-1 text-xs uppercase tracking-widest`}>
                            {user.role}
                        </p>
                    </div>
                </div>

                {!isEditing ? (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={logout} className="hidden md:flex items-center gap-2">
                            <AiOutlineLogout size={18} />
                            Déconnexion
                        </Button>
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            <AiOutlineEdit className="mr-2" /> MODIFIER
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            Annuler
                        </Button>
                        <Button variant="primary" onClick={form.handleSubmit} isLoading={form.isSubmitting}>
                            Enregistrer
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="relative">
                        {user.imageUrl ? (
                            <img
                                src={getImageUrl(user.imageUrl, `${user.firstName} ${user.lastName}`, 'admin')}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-brand-primary to-orange-500 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-black">
                                {getInitials(user.firstName, user.lastName)}
                            </div>
                        )}
                        {user.verified ? (
                            <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl border-2 border-white">
                                <AiOutlineCheckCircle className="text-white" size={20} />
                            </div>
                        ) : (
                            <div className="absolute -bottom-2 -right-2 bg-red-500 p-2 rounded-xl border-2 border-white">
                                <AiOutlineCloseCircle className="text-white" size={20} />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        {isEditing ? (
                            <div className="space-y-4 max-w-md mx-auto md:mx-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        name="firstName"
                                        value={form.values.firstName || ''}
                                        onChange={form.handleChange}
                                        error={form.errors.firstName}
                                        placeholder="Prénom"
                                    />
                                    <Input
                                        name="lastName"
                                        value={form.values.lastName || ''}
                                        onChange={form.handleChange}
                                        error={form.errors.lastName}
                                        placeholder="Nom"
                                    />
                                </div>
                                <Input
                                    name="birthDate"
                                    type="date"
                                    value={form.values.birthDate || ''}
                                    onChange={form.handleChange}
                                    error={form.errors.birthDate}
                                />
                                <Input
                                    name="phoneNumber"
                                    value={form.values.phoneNumber || ''}
                                    onChange={form.handleChange}
                                    error={form.errors.phoneNumber}
                                    placeholder="Téléphone"
                                />
                                <Input
                                    name="imageUrl"
                                    value={form.values.imageUrl || ''} // ✅ Ligne 141 corrigée avec fallback
                                    onChange={form.handleChange}
                                    error={form.errors.imageUrl}
                                    placeholder="URL de l'image"
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-black mb-2">{user.firstName} {user.lastName}</h2>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 text-sm">
                                        <AiOutlineMail className="text-brand-primary" />
                                        {user.email}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm">
                                        <AiOutlinePhone className="text-brand-primary" />
                                        {user.phoneNumber || 'Non renseigné'}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm">
                                        <AiOutlineCalendar className="text-brand-primary" />
                                        Né(e) le {formatDate(user.birthDate)}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 p-6">
                <h2 className={`${THEME.font.h2} text-xl mb-6 flex items-center gap-2`}>
                    <AiOutlineLock /> SÉCURITÉ
                </h2>
                <Button
                    variant="secondary"
                    onClick={() => setShowPasswordAlert(true)}
                >
                    Changer le mot de passe
                </Button>
            </div>

            <Alert
                isOpen={showPasswordAlert}
                variant="warning"
                title="Changement de mot de passe"
                message="Cette fonctionnalité sera bientôt disponible."
                confirmText="OK"
                onClose={() => setShowPasswordAlert(false)}
                onConfirm={() => setShowPasswordAlert(false)}
            />
        </div>
    );
};

export default AdminProfile;