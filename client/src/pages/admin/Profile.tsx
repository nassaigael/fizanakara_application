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
    AiOutlineCrown,
    AiOutlineIdcard
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { updateAdminSchema } from '../../lib/validators/admin.validator';
import { UpdateAdminRequest } from '../../lib/types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getInitials, formatDate } from '../../lib/helper';
import { getImageUrl } from '../../lib/constant/constant';
import StatCard from '../../components/ui/StatCard';
import InfoItem from '../../components/ui/InfoItem';
import PasswordModal from '../../components/profile/PasswordModal';

const AdminProfile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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

    const formattedBirthDate = user.birthDate ? formatDate(user.birthDate) : 'Non renseignée';

    return (
        <div className="min-h-screen bg-brand-bg">
            <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 max-w-7xl mx-auto">
                {/* Header avec titre et bouton edit - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-3 md:p-4 bg-linear-to-r from-brand-primary to-orange-500 text-white rounded-2xl md:rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <AiOutlineUser size={24} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight">
                                Mon Profil
                            </h1>
                            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 uppercase tracking-widest font-medium">
                                {user.role === 'SUPERADMIN' ? 'Super Administrateur' : 'Administrateur'}
                            </p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <Button 
                            variant="primary" 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black w-full sm:w-auto"
                        >
                            <AiOutlineEdit size={16} /> MODIFIER
                        </Button>
                    ) : (
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsEditing(false)}
                                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-black"
                            >
                                ANNULER
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={form.handleSubmit} 
                                isLoading={form.isSubmitting}
                                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-black"
                            >
                                ENREGISTRER
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stats Cards - Responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatCard 
                        title="Statut du compte" 
                        status={user.verified ? "Vérifié" : "En attente"} 
                        icon={user.verified ? <AiOutlineCheckCircle /> : <AiOutlineCloseCircle />}
                        color={user.verified ? 'green' : 'orange'}
                    />
                    <StatCard 
                        title="Rôle" 
                        status={user.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'} 
                        icon={<AiOutlineCrown />} 
                        color="blue"
                    />
                    <StatCard 
                        title="ID Administrateur" 
                        status={user.id} 
                        icon={<AiOutlineIdcard />} 
                        color="orange"
                    />
                </div>

                {/* Profile Card - Responsive */}
                <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-b-8 border-gray-200 p-5 sm:p-6 md:p-8 mb-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* Avatar - Responsive */}
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-linear-to-br from-brand-primary to-orange-500 flex items-center justify-center">
                                {user.imageUrl ? (
                                    <img
                                        src={getImageUrl(user.imageUrl, 'admin')}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(user.firstName, user.lastName);
                                            (e.target as HTMLImageElement).parentElement!.classList.add('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'font-black', 'text-white');
                                        }}
                                    />
                                ) : (
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                                        {getInitials(user.firstName, user.lastName)}
                                    </span>
                                )}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 p-1.5 sm:p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${user.verified ? 'bg-green-500' : 'bg-red-500'}`}>
                                {user.verified ? <AiOutlineCheckCircle className="text-white" size={16} /> : <AiOutlineCloseCircle className="text-white" size={16} />}
                            </div>
                        </div>

                        {/* Info - Responsive */}
                        <div className="flex-1 w-full">
                            {isEditing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input 
                                        label="Prénom" 
                                        name="firstName" 
                                        value={form.values.firstName || ''} 
                                        onChange={form.handleChange} 
                                        error={form.errors.firstName}
                                        containerClassName="w-full"
                                    />
                                    <Input 
                                        label="Nom" 
                                        name="lastName" 
                                        value={form.values.lastName || ''} 
                                        onChange={form.handleChange} 
                                        error={form.errors.lastName}
                                        containerClassName="w-full"
                                    />
                                    <Input 
                                        label="Date de naissance" 
                                        name="birthDate" 
                                        type="date" 
                                        value={form.values.birthDate || ''} 
                                        onChange={form.handleChange} 
                                        error={form.errors.birthDate}
                                        containerClassName="w-full"
                                    />
                                    <Input 
                                        label="Téléphone" 
                                        name="phoneNumber" 
                                        value={form.values.phoneNumber || ''} 
                                        onChange={form.handleChange} 
                                        error={form.errors.phoneNumber}
                                        containerClassName="w-full"
                                    />
                                    <div className="sm:col-span-2">
                                        <Input 
                                            label="URL de l'avatar" 
                                            name="imageUrl" 
                                            value={form.values.imageUrl || ''} 
                                            onChange={form.handleChange} 
                                            error={form.errors.imageUrl} 
                                            placeholder="admin_username.jpg"
                                            containerClassName="w-full"
                                        />
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 ml-2">
                                            Nom de l'image sur GitHub (ex: admin_username.jpg)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                    <InfoItem 
                                        icon={<AiOutlineUser size={16} />} 
                                        label="Nom complet" 
                                        value={`${user.firstName} ${user.lastName}`} 
                                    />
                                    <InfoItem 
                                        icon={<AiOutlineMail size={16} />} 
                                        label="Adresse email" 
                                        value={user.email} 
                                    />
                                    <InfoItem 
                                        icon={<AiOutlinePhone size={16} />} 
                                        label="Téléphone" 
                                        value={user.phoneNumber || 'Non renseigné'} 
                                    />
                                    <InfoItem 
                                        icon={<AiOutlineCalendar size={16} />} 
                                        label="Date de naissance" 
                                        value={formattedBirthDate} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Section - Responsive */}
                <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-b-8 border-gray-200 p-5 sm:p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider flex items-center gap-2 mb-2">
                                <AiOutlineLock className="text-brand-primary" size={18} />
                                SÉCURITÉ & MOT DE PASSE
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Gérez votre mot de passe et les paramètres de sécurité de votre compte.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black w-full sm:w-auto"
                        >
                            <AiOutlineLock size={16} /> CHANGER LE MOT DE PASSE
                        </Button>
                    </div>
                </div>

                {/* Password Modal */}
                <PasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSave={async (newPassword) => {
                        await updateProfile({ password: newPassword });
                    }}
                />
            </div>
        </div>
    );
};

export default AdminProfile;