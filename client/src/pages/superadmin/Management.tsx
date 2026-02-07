import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    AiOutlineUser,
    AiOutlineEnvironment,
    AiOutlineFlag,
    AiOutlinePlus,
    AiOutlineDelete,
    AiOutlineClose,
    AiOutlineCheckCircle,
    AiOutlineCloseCircle
} from 'react-icons/ai';
import { useAdmin } from '../../hooks/useAdmin';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import { useForm } from '../../hooks/useForm';
import { registerSchema } from '../../lib/validators/admin.validator';
import { districtSchema, tributeSchema } from '../../lib/validators/location.validator';
import { RegisterRequest, DistrictDto, TributeDto, AdminResponse, District, Tribute } from '../../lib/types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/helper';

type TabType = 'admins' | 'districts' | 'tributes';
type DeleteType = 'admin' | 'district' | 'tribute' | null;

const SuperAdminManagement: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'admins');
    
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
    const [isTributeModalOpen, setIsTributeModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [deleteType, setDeleteType] = useState<DeleteType>(null);

    const { admins, isLoading: loadingAdmins, createAdmin, deleteAdmin } = useAdmin();
    const { districts, isLoading: loadingDistricts, createDistrict, deleteDistrict } = useDistrict();
    const { tributes, isLoading: loadingTributes, createTribute, deleteTribute } = useTribute();

    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab, setSearchParams]);

    const adminForm = useForm<RegisterRequest>({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            birthDate: '',
            gender: 'MALE' as any,
            phoneNumber: '',
            imageUrl: ''  // L'utilisateur devra remplir ce champ
        },
        validationSchema: registerSchema,
        onSubmit: async (data) => {
            // Vérifier que imageUrl n'est pas vide
            if (!data.imageUrl || data.imageUrl.trim() === '') {
                toast.error('Le nom de l\'image GitHub est requis');
                return;
            }

            // Nettoyer le nom de l'image (enlever les espaces, ajouter .jpg si nécessaire)
            const cleanImageUrl = data.imageUrl.trim().replace(/\s+/g, '_');
            
            const payload: RegisterRequest = {
                ...data,
                imageUrl: cleanImageUrl  // Envoyer le nom nettoyé
            };
            
            console.log('📤 Création admin avec image:', payload.imageUrl);
            
            try {
                await createAdmin.mutateAsync(payload);
                setIsAdminModalOpen(false);
                adminForm.resetForm();
                toast.success('Administrateur créé avec succès');
            } catch (error) {
                console.error('❌ Erreur création:', error);
            }
        }
    });

    const districtForm = useForm<DistrictDto>({
        initialValues: { name: '' },
        validationSchema: districtSchema,
        onSubmit: async (data) => {
            await createDistrict.mutateAsync(data);
            setIsDistrictModalOpen(false);
            districtForm.resetForm();
        }
    });

    const tributeForm = useForm<TributeDto>({
        initialValues: { name: '' },
        validationSchema: tributeSchema,
        onSubmit: async (data) => {
            await createTribute.mutateAsync(data);
            setIsTributeModalOpen(false);
            tributeForm.resetForm();
        }
    });

    const handleDelete = async () => {
        if (!deleteId || !deleteType) return;
        
        try {
            if (deleteType === 'admin') {
                await deleteAdmin.mutateAsync(deleteId as string);
                toast.success('Administrateur supprimé');
            } else if (deleteType === 'district') {
                await deleteDistrict.mutateAsync(deleteId as number);
                toast.success('District supprimé');
            } else if (deleteType === 'tribute') {
                await deleteTribute.mutateAsync(deleteId as number);
                toast.success('Tribu supprimée');
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.error(`Erreur: ${errorMessage}`);
        } finally {
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    const tabs = [
        { id: 'admins' as TabType, label: 'Administrateurs', icon: AiOutlineUser, count: admins?.length || 0 },
        { id: 'districts' as TabType, label: 'Districts', icon: AiOutlineEnvironment, count: districts?.length || 0 },
        { id: 'tributes' as TabType, label: 'Tribus', icon: AiOutlineFlag, count: tributes?.length || 0 },
    ];

    return (
        <div className={THEME.section}>
            {/* Header avec gradient */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-b-4 border-brand-border shadow-lg mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-purple-500/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between p-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-brand-primary via-orange-500 to-red-500 text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-110 transition-transform">
                            {activeTab === 'admins' && <AiOutlineUser size={32} />}
                            {activeTab === 'districts' && <AiOutlineEnvironment size={32} />}
                            {activeTab === 'tributes' && <AiOutlineFlag size={32} />}
                        </div>
                        <div>
                            <h1 className={`${THEME.font.h1} text-2xl md:text-4xl`}>GESTION</h1>
                            <p className={`${THEME.font.muted} mt-2 text-xs uppercase tracking-widest flex items-center gap-2`}>
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                                {tabs.find(t => t.id === activeTab)?.label}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => {
                            if (activeTab === 'admins') setIsAdminModalOpen(true);
                            if (activeTab === 'districts') setIsDistrictModalOpen(true);
                            if (activeTab === 'tributes') setIsTributeModalOpen(true);
                        }}
                        className="flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <AiOutlinePlus className="text-lg" />
                        <span className="font-black text-sm">AJOUTER</span>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-2 bg-white rounded-3xl border-2 border-brand-border mb-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-brand-primary to-orange-500 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }
                        `}
                    >
                        <tab.icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="bg-white/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border-2 border-b-4 border-brand-border p-6 md:p-8 shadow-md">
                {activeTab === 'admins' && (
                    <AdminsTab
                        admins={admins}
                        isLoading={loadingAdmins}
                        onDelete={(id) => {
                            setDeleteId(id);
                            setDeleteType('admin');
                        }}
                    />
                )}

                {activeTab === 'districts' && (
                    <LocationTab
                        items={districts}
                        isLoading={loadingDistricts}
                        title="Districts"
                        icon={<AiOutlineEnvironment size={20} />}
                        color="blue"
                        onDelete={(id) => {
                            setDeleteId(id);
                            setDeleteType('district');
                        }}
                    />
                )}

                {activeTab === 'tributes' && (
                    <LocationTab
                        items={tributes}
                        isLoading={loadingTributes}
                        title="Tribus"
                        icon={<AiOutlineFlag size={20} />}
                        color="purple"
                        onDelete={(id) => {
                            setDeleteId(id);
                            setDeleteType('tribute');
                        }}
                    />
                )}
            </div>

            {/* Modals */}
            {isAdminModalOpen && (
                <AdminModal
                    form={adminForm}
                    isOpen={isAdminModalOpen}
                    onClose={() => setIsAdminModalOpen(false)}
                />
            )}

            {isDistrictModalOpen && (
                <LocationModal
                    form={districtForm}
                    title="Nouveau District"
                    placeholder="Nom du district"
                    isOpen={isDistrictModalOpen}
                    onClose={() => setIsDistrictModalOpen(false)}
                />
            )}

            {isTributeModalOpen && (
                <LocationModal
                    form={tributeForm}
                    title="Nouvelle Tribu"
                    placeholder="Nom de la tribu"
                    isOpen={isTributeModalOpen}
                    onClose={() => setIsTributeModalOpen(false)}
                />
            )}

            {/* Delete Alert */}
            <Alert
                isOpen={!!deleteId}
                variant="danger"
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.`}
                confirmText="SUPPRIMER"
                onClose={() => {
                    setDeleteId(null);
                    setDeleteType(null);
                }}
                onConfirm={handleDelete}
            />
        </div>
    );
};

interface AdminsTabProps {
    admins: AdminResponse[] | undefined;
    isLoading: boolean;
    onDelete: (id: string) => void;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ admins, isLoading, onDelete }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!admins || admins.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <AiOutlineUser size={40} className="text-gray-300" />
                </div>
                <p className="font-black text-gray-400 mb-2">Aucun administrateur</p>
                <p className="text-sm text-gray-500">Commencez par créer un nouvel administrateur</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-brand-border">
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Administrateur</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Email</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Téléphone</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Rôle</th>
                        <th className="py-4 px-6 text-left text-xs font-black uppercase text-brand-muted">Statut</th>
                        <th className="py-4 px-6 text-right text-xs font-black uppercase text-brand-muted">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {admins.map((admin: AdminResponse) => (
                        <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md">
                                        {admin.firstName?.[0]}{admin.lastName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-brand-text">{admin.firstName} {admin.lastName}</p>
                                        <p className="text-xs text-brand-muted">ID: {admin.id?.slice(0, 6)}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <p className="font-bold text-xs text-brand-text">{admin.email}</p>
                            </td>
                            <td className="py-4 px-6">
                                <p className="font-bold text-xs text-brand-text">{admin.phoneNumber || '-'}</p>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
                                    admin.role === 'SUPERADMIN'
                                        ? 'bg-purple-100 text-purple-600 border-purple-300'
                                        : 'bg-blue-100 text-blue-600 border-blue-300'
                                }`}>
                                    {admin.role}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    {admin.verified ? (
                                        <>
                                            <AiOutlineCheckCircle className="text-green-600" size={18} />
                                            <span className="text-xs font-black text-green-600">Vérifié</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineCloseCircle className="text-orange-600" size={18} />
                                            <span className="text-xs font-black text-orange-600">Non vérifié</span>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button
                                    onClick={() => onDelete(admin.id)}
                                    className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors transform hover:scale-110"
                                    title="Supprimer"
                                >
                                    <AiOutlineDelete size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface LocationTabProps {
    items: (District | Tribute)[] | undefined;
    isLoading: boolean;
    title: string;
    icon: React.ReactNode;
    color: 'blue' | 'purple';
    onDelete: (id: number) => void;
}

const LocationTab: React.FC<LocationTabProps> = ({ items, isLoading, title, icon, color, onDelete }) => {
    const colorClasses = {
        blue: {
            bg: 'from-blue-50 to-cyan-50',
            border: 'border-blue-200 hover:border-blue-500',
            badge: 'bg-blue-100 text-blue-600 border-blue-300',
            icon: 'bg-blue-100',
            text: 'text-blue-600'
        },
        purple: {
            bg: 'from-purple-50 to-pink-50',
            border: 'border-purple-200 hover:border-purple-500',
            badge: 'bg-purple-100 text-purple-600 border-purple-300',
            icon: 'bg-purple-100',
            text: 'text-purple-600'
        }
    };

    const colors = colorClasses[color];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-20">
                <div className={`w-20 h-20 ${colors.icon} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
                    {icon}
                </div>
                <p className="font-black text-gray-400 mb-2">Aucun{title === 'Districts' ? ' district' : 'e tribu'}</p>
                <p className="text-sm text-gray-500">Créez votre première {title === 'Districts' ? 'zone' : 'entité'}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-5 bg-gradient-to-br ${colors.bg} ${colors.border} transition-all hover:shadow-lg hover:scale-105 cursor-pointer`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`p-3 ${colors.icon} ${colors.text} rounded-xl`}>
                                {icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-sm uppercase text-brand-text">{item.name}</p>
                                <p className="text-xs text-brand-muted mt-1">Entité active</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(item.id!)}
                            className={`p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-100 text-red-600`}
                            title="Supprimer"
                        >
                            <AiOutlineDelete size={18} />
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full"></div>
                </div>
            ))}
        </div>
    );
};

interface AdminModalProps {
    form: any;
    isOpen: boolean;
    onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ form, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-2xl border-2 border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-brand-primary to-orange-500 p-8 text-white relative">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <AiOutlineClose size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <AiOutlineUser size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase">Nouvel Administrateur</h2>
                            <p className="text-white/80 text-sm mt-1">Remplissez tous les champs requis</p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <form onSubmit={form.handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Prénom"
                                name="firstName"
                                value={form.values.firstName || ''}
                                onChange={form.handleChange}
                                error={form.errors.firstName}
                                required
                            />
                            <Input
                                label="Nom"
                                name="lastName"
                                value={form.values.lastName || ''}
                                onChange={form.handleChange}
                                error={form.errors.lastName}
                                required
                            />
                        </div>

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.values.email || ''}
                            onChange={form.handleChange}
                            error={form.errors.email}
                            required
                        />

                        <Input
                            label="Mot de passe"
                            name="password"
                            type="password"
                            value={form.values.password || ''}
                            onChange={form.handleChange}
                            error={form.errors.password}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Date de naissance"
                                name="birthDate"
                                type="date"
                                value={form.values.birthDate || ''}
                                onChange={form.handleChange}
                                error={form.errors.birthDate}
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
                                required
                            />
                        </div>

                        <Input
                            label="Numéro de téléphone"
                            name="phoneNumber"
                            value={form.values.phoneNumber || ''}
                            onChange={form.handleChange}
                            error={form.errors.phoneNumber}
                            required
                        />

                        {/* Champ imageUrl obligatoire avec explication */}
                        <div className="space-y-2">
                            <Input
                                label="Nom de l'image GitHub"
                                name="imageUrl"
                                value={form.values.imageUrl || ''}
                                onChange={form.handleChange}
                                error={form.errors.imageUrl}
                                placeholder="ex: jean_dupont.jpg"
                                required
                            />
                            <p className="text-xs text-brand-muted">
                                📸 L'image doit être stockée sur GitHub dans le dossier /admin 
                                (ex: https://raw.githubusercontent.com/mekill404/image_membre_fizankara/main/admin/nom_image.jpg)
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4 border-t-2 border-brand-border">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                isLoading={form.isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <AiOutlinePlus size={18} />
                                Créer Administrateur
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

interface LocationModalProps {
    form: any;
    title: string;
    placeholder: string;
    isOpen: boolean;
    onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ form, title, placeholder, isOpen, onClose }) => {
    if (!isOpen) return null;

    const isDistrict = title.includes('District');
    const color = isDistrict ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md border-2 border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className={`bg-gradient-to-r ${color} p-8 text-white relative`}>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <AiOutlineClose size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl">
                            {isDistrict ? <AiOutlineEnvironment size={24} /> : <AiOutlineFlag size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase">{title}</h2>
                            <p className="text-white/80 text-sm mt-1">Ajoutez une nouvelle {isDistrict ? 'zone géographique' : 'entité traditionnelle'}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <form onSubmit={form.handleSubmit} className="space-y-6">
                        <Input
                            label={placeholder}
                            name="name"
                            value={form.values.name || ''}
                            onChange={form.handleChange}
                            error={form.errors.name}
                            placeholder={placeholder}
                            required
                        />

                        <div className="flex gap-3 pt-4 border-t-2 border-brand-border">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                isLoading={form.isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <AiOutlinePlus size={18} />
                                Créer
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminManagement;