import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { updateAdminSchema } from '../../lib/validators/admin.validator';
import { UpdateAdminRequest } from '../../lib/types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatDate } from '../../lib/helper';
import { 
    AiOutlineUser, 
    AiOutlineMail, 
    AiOutlinePhone, 
    AiOutlineCalendar} from 'react-icons/ai';

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
                <div className="mb-6 pb-3 border-b-2 border-red-100">
                    <div className="flex items-center lg:justify-start justify-center gap-3">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                                Informations personnelles
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    {infoItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-default"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all duration-200" />
                            
                            <div className="flex items-center gap-3 p-4 pl-5">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center transition-all duration-200 group-hover:bg-red-500 group-hover:border-red-600 group-hover:shadow-md">
                                    <item.icon 
                                        size={18} 
                                        className="text-red-500 transition-colors duration-200 group-hover:text-white" 
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                        {item.label}
                                    </p>
                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto md:w-full lg:w-auto px-6 py-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        MODIFIER LE PROFIL
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full">
            <div className="mb-6 pb-3 border-b-2 border-red-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                    Modification du profil
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">
                    Mettez à jour vos informations personnelles
                </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={form.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                        label="Prénom" 
                        name="firstName" 
                        value={form.values.firstName || ''} 
                        onChange={form.handleChange} 
                        error={form.errors.firstName}
                        className="border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg"
                    />
                    <Input 
                        label="Nom" 
                        name="lastName" 
                        value={form.values.lastName || ''} 
                        onChange={form.handleChange} 
                        error={form.errors.lastName}
                        className="border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg"
                    />
                    <Input 
                        label="Date de naissance" 
                        name="birthDate" 
                        type="date" 
                        value={form.values.birthDate || ''} 
                        onChange={form.handleChange} 
                        error={form.errors.birthDate}
                        className="border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg"
                    />
                    <Input 
                        label="Téléphone" 
                        name="phoneNumber" 
                        value={form.values.phoneNumber || ''} 
                        onChange={form.handleChange} 
                        error={form.errors.phoneNumber}
                        className="border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg"
                    />
                    <div className="sm:col-span-2">
                        <Input 
                            label="URL de l'avatar" 
                            name="imageUrl" 
                            value={form.values.imageUrl || ''} 
                            onChange={form.handleChange} 
                            error={form.errors.imageUrl} 
                            placeholder="admin_username.jpg"
                            className="border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-lg"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-100">
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setIsEditing(false);
                            form.resetForm();
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                    >
                        ANNULER
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={form.handleSubmit} 
                        isLoading={form.isSubmitting}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                        ENREGISTRER
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEditForm;