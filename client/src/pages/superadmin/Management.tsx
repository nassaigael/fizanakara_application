import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    AiOutlineUser,
    AiOutlineEnvironment,
    AiOutlineFlag,
    AiOutlineClose,
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
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/helper';

import AdminsTab from '../../components/superadmin/management/AdminsTab';
import LocationTab from '../../components/superadmin/management/LocationTab';
import AdminModal from '../../components/superadmin/management/AdminForm';
import LocationModal from '../../components/superadmin/management/LocationForm';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Modifier {title}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Mettez à jour le nom du {title.toLowerCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                        <AiOutlineClose size={16} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Nom"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={error}
                            placeholder={`Nom du ${title.toLowerCase()}`}
                            required
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
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
                const errorMessage = getErrorMessage(error);
                toast.error(`Erreur : ${errorMessage}`);
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
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Header Style Odoo */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-600 text-white flex items-center justify-center">
                            {activeTab === 'admins' && <AiOutlineUser size={24} />}
                            {activeTab === 'districts' && <AiOutlineEnvironment size={24} />}
                            {activeTab === 'tributes' && <AiOutlineFlag size={24} />}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                                GESTION
                            </h1>
                            <p className="flex items-center gap-2 text-sm text-gray-500 mt-1">
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
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-all w-full md:w-auto justify-center"
                    >
                        AJOUTER
                    </Button>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex gap-2 overflow-x-auto pb-3 md:pb-0 scrollbar-thin">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                    group relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 border border-gray-200'
                                }
                `}
                        >
                            <tab.icon size={15} className={activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className={`
                    ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all
                    ${activeTab === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-500'
                                }
                `}>
                                {tab.count}
                            </span>

                            {activeTab === tab.id && (
                                <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="relative">
                    <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                    {activeTab === 'admins' && <AiOutlineUser size={14} className="text-red-600" />}
                                    {activeTab === 'districts' && <AiOutlineEnvironment size={14} className="text-red-600" />}
                                    {activeTab === 'tributes' && <AiOutlineFlag size={14} className="text-red-600" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">
                                        {activeTab === 'admins' && 'Administrateurs'}
                                        {activeTab === 'districts' && 'Districts'}
                                        {activeTab === 'tributes' && 'Tributs'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        {activeTab === 'admins' && 'Gestion des comptes administrateurs'}
                                        {activeTab === 'districts' && 'Gestion des zones géographiques'}
                                        {activeTab === 'tributes' && 'Gestion des entités traditionnelles'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-5 md:p-6">
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
                            icon={<AiOutlineEnvironment size={18} />}
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
                            icon={<AiOutlineFlag size={18} />}
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
            </div>

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