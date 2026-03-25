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
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/helper';

// Extracted Components
import AdminsTab from '../../components/superadmin/management/AdminsTab';
import LocationTab from '../../components/superadmin/management/LocationTab';
import AdminModal from '../../components/superadmin/management/AdminModal';
import LocationModal from '../../components/superadmin/management/LocationModal';

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
            imageUrl: ''
        },
        validationSchema: registerSchema,
        onSubmit: async (data) => {
            if (!data.imageUrl || data.imageUrl.trim() === '') {
                toast.error('GitHub image name is required');
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
                // Error handled in hook
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
        if (deleteId === null || deleteType === null) return;
        
        console.log(`Deleting ${deleteType} with ID:`, deleteId);

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
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    const tabs = [
        { id: 'admins' as TabType, label: 'Administrators', icon: AiOutlineUser, count: admins?.length || 0 },
        { id: 'districts' as TabType, label: 'Districts', icon: AiOutlineEnvironment, count: districts?.length || 0 },
        { id: 'tributes' as TabType, label: 'Tributes', icon: AiOutlineFlag, count: tributes?.length || 0 },
    ];

    return (
        <div className={THEME.section}>
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-b-4 border-brand-border shadow-lg mb-8">
                <div className="absolute inset-0 bg-linear-to-r from-brand-primary/10 to-purple-500/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between p-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-linear-to-br from-brand-primary via-orange-500 to-red-500 text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-110 transition-transform">
                            {activeTab === 'admins' && <AiOutlineUser size={32} />}
                            {activeTab === 'districts' && <AiOutlineEnvironment size={32} />}
                            {activeTab === 'tributes' && <AiOutlineFlag size={32} />}
                        </div>
                        <div>
                            <h1 className={`${THEME.font.h1} text-2xl md:text-4xl`}>MANAGEMENT</h1>
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
                        <span className="font-black text-sm">ADD</span>
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
                                ? 'bg-linear-to-r from-brand-primary to-orange-500 text-white shadow-lg scale-105'
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
                        title="Tributes"
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
            <AdminModal
                form={adminForm}
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
            />

            <LocationModal
                form={districtForm}
                title="New District"
                placeholder="District name"
                isOpen={isDistrictModalOpen}
                onClose={() => setIsDistrictModalOpen(false)}
            />

            <LocationModal
                form={tributeForm}
                title="New Tribute"
                placeholder="Tribute name"
                isOpen={isTributeModalOpen}
                onClose={() => setIsTributeModalOpen(false)}
            />

            {/* Delete Alert */}
            <Alert
                isOpen={!!deleteId}
                variant="danger"
                title="Confirm Deletion"
                message={`Are you sure you want to delete this item? This action is irreversible.`}
                confirmText="DELETE"
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