import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    AiOutlineUser,
    AiOutlineEnvironment,
    AiOutlineFlag,
    AiOutlinePlus,
} from 'react-icons/ai';
import { useAdmin } from '../../hooks/useAdmin';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import { useForm } from '../../hooks/useForm';
import { registerSchema } from '../../lib/validators/admin.validator';
import { districtSchema, tributeSchema } from '../../lib/validators/location.validator';
import { RegisterRequest, DistrictDto, TributeDto } from '../../lib/types';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/helper';

import AdminsTab from '../../components/superadmin/management/AdminsTab';
import LocationTab from '../../components/superadmin/management/LocationTab';
import AdminModal from '../../components/superadmin/management/AdminModal';
import LocationModal from '../../components/superadmin/management/LocationModal';

type TabType = 'admins' | 'districts' | 'tributes';
type DeleteType = 'admin' | 'district' | 'tribute' | null;

interface EditLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    title: string;
    currentName: string;
    isLoading: boolean;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title,
    currentName,
    isLoading
}) => {
    const [name, setName] = useState(currentName);
    const [error, setError] = useState('');

    useEffect(() => {
        setName(currentName);
    }, [currentName, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Le nom est requis');
            return;
        }
        setError('');
        await onSave(name.trim());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md border-2 border-brand-border shadow-[0_8px_0_0_#E5E5E5] overflow-hidden">
                <div className="bg-linear-to-r from-brand-primary to-brand-primary-dark p-6 text-white">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Modifier {title}</h2>
                    <p className="text-white/80 text-sm mt-1">Mettez à jour le nom du {title.toLowerCase()}</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Nom"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={error}
                            placeholder={`Nom du ${title.toLowerCase()}`}
                            required
                        />

                        <div className="flex gap-3 pt-4 border-t border-brand-border">
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
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const SuperAdminManagement: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'admins');
    
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
    const [isTributeModalOpen, setIsTributeModalOpen] = useState(false);
    
    const [editItem, setEditItem] = useState<{ id: number; name: string; type: 'district' | 'tribute' } | null>(null);
    
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [deleteType, setDeleteType] = useState<DeleteType>(null);

    const { admins, isLoading: loadingAdmins, createAdmin, deleteAdmin } = useAdmin();
    const { districts, isLoading: loadingDistricts, createDistrict, updateDistrict, deleteDistrict } = useDistrict();
    const { tributes, isLoading: loadingTributes, createTribute, updateTribute, deleteTribute } = useTribute();

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
            imageUrl: ''
        },
        validationSchema: registerSchema,
        onSubmit: async (data) => {
            if (!data.imageUrl || data.imageUrl.trim() === '') {
                toast.error('Le nom d’image GitHub est requis');
                return;
            }

            const cleanImageUrl = data.imageUrl.trim().replace(/\s+/g, '_');
            
            const payload: RegisterRequest = {
                ...data,
                imageUrl: cleanImageUrl
            };
            
            try {
                await createAdmin.mutateAsync(payload);
                setIsAdminModalOpen(false);
                adminForm.resetForm();
            } catch (error) {
                // Géré dans le hook
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

    const handleUpdateDistrict = async (id: number, name: string) => {
        try {
            await updateDistrict.mutateAsync({ id, data: { name } });
            setEditItem(null);
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.error(`Erreur : ${errorMessage}`);
        }
    };

    const handleUpdateTribute = async (id: number, name: string) => {
        try {
            await updateTribute.mutateAsync({ id, data: { name } });
            setEditItem(null);
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.error(`Erreur : ${errorMessage}`);
        }
    };

    const handleDelete = async () => {
        if (deleteId === null || deleteType === null) return;
        
        try {
            if (deleteType === 'admin') {
                await deleteAdmin.mutateAsync(deleteId as string);
            } else if (deleteType === 'district') {
                await deleteDistrict.mutateAsync(deleteId as number);
            } else if (deleteType === 'tribute') {
                await deleteTribute.mutateAsync(deleteId as number);
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.error(`Erreur : ${errorMessage}`);
        } finally {
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    const tabs = [
        { id: 'admins' as TabType, label: 'Administrateurs', icon: AiOutlineUser, count: admins?.length || 0 },
        { id: 'districts' as TabType, label: 'Districts', icon: AiOutlineEnvironment, count: districts?.length || 0 },
        { id: 'tributes' as TabType, label: 'Tributs', icon: AiOutlineFlag, count: tributes?.length || 0 },
    ];

    return (
        <div className={THEME.section}>
            {/* Header Style Duolingo */}
            <div className="relative overflow-hidden bg-white border-2 border-brand-border rounded-2xl shadow-[0_8px_0_0_#E5E5E5] hover:shadow-[0_12px_0_0_#E5E5E5] hover:-translate-y-1 transition-all duration-300 p-6 md:p-8">
                <div className="absolute inset-0 bg-linear-to-r from-brand-primary/5 via-transparent to-brand-primary/5" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-brand-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-brand-primary rounded-2xl blur-md opacity-50" />
                            <div className="relative p-4 bg-linear-to-br from-brand-primary to-brand-primary-dark text-white rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                                {activeTab === 'admins' && <AiOutlineUser size={32} />}
                                {activeTab === 'districts' && <AiOutlineEnvironment size={32} />}
                                {activeTab === 'tributes' && <AiOutlineFlag size={32} />}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-brand-text tracking-tight">
                                GESTION
                            </h1>
                            <p className="flex items-center gap-2 text-sm text-brand-muted mt-1">
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
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
                        className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all w-full md:w-auto justify-center"
                    >
                        <AiOutlinePlus size={18} />
                        AJOUTER
                    </Button>
                </div>
            </div>

            {/* Tabs Style Duolingo */}
            <div className="flex gap-2 p-2 bg-white border-2 border-brand-border rounded-2xl shadow-[0_6px_0_0_#E5E5E5] mb-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-linear-to-r from-brand-primary to-brand-primary-dark text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

            {/* Content Area - Card Duolingo */}
            <div className="bg-white border-2 border-brand-border rounded-2xl shadow-[0_6px_0_0_#E5E5E5] p-6 md:p-8">
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
                        onEdit={(id, name) => {
                            setEditItem({ id, name, type: 'district' });
                        }}
                    />
                )}

                {activeTab === 'tributes' && (
                    <LocationTab
                        items={tributes}
                        isLoading={loadingTributes}
                        title="Tributs"
                        icon={<AiOutlineFlag size={20} />}
                        color="purple"
                        onDelete={(id) => {
                            setDeleteId(id);
                            setDeleteType('tribute');
                        }}
                        onEdit={(id, name) => {
                            setEditItem({ id, name, type: 'tribute' });
                        }}
                    />
                )}
            </div>

            {/* Modals */}
            <AdminModal
                form={adminForm}
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
            />

            <LocationModal
                form={districtForm}
                title="Nouveau District"
                placeholder="Nom du district"
                isOpen={isDistrictModalOpen}
                onClose={() => setIsDistrictModalOpen(false)}
            />

            <LocationModal
                form={tributeForm}
                title="Nouveau Tribut"
                placeholder="Nom du tribut"
                isOpen={isTributeModalOpen}
                onClose={() => setIsTributeModalOpen(false)}
            />

            {editItem && (
                <EditLocationModal
                    isOpen={!!editItem}
                    onClose={() => setEditItem(null)}
                    onSave={async (name) => {
                        if (editItem.type === 'district') {
                            await handleUpdateDistrict(editItem.id, name);
                        } else {
                            await handleUpdateTribute(editItem.id, name);
                        }
                    }}
                    title={editItem.type === 'district' ? 'District' : 'Tribut'}
                    currentName={editItem.name}
                    isLoading={updateDistrict.isPending || updateTribute.isPending}
                />
            )}

            <Alert
                isOpen={!!deleteId}
                variant="danger"
                title="Confirmation de suppression"
                message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
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

export default SuperAdminManagement;