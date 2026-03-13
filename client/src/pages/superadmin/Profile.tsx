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
    AiOutlineKey,
    AiOutlineSave,
    AiOutlineClose,
    AiOutlineCrown,
    AiOutlineAlert,
    AiOutlineLogout
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { updateAdminSchema } from '../../lib/validators/admin.validator';
import { UpdateAdminRequest } from '../../lib/types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { THEME } from '../../styles/theme';
import { formatDate, getInitials } from '../../lib/helper';
import { getImageUrl } from '../../lib/constant/constant';
import InfoItem from '../../components/ui/InfoItem';
import StatCard from '../../components/ui/StatCard';
import PasswordModal from '../../components/profile/PasswordModal';

const SuperAdminProfile: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

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

    return (
        <div className={THEME.section}>
            <div className="relative overflow-hidden rounded-3xl border-2 border-b-4 border-brand-border shadow-lg mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-orange-500/10"></div>
                <div className="relative flex items-center justify-between p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-brand-primary to-orange-500 text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-110 transition-transform">
                            <AiOutlineCrown size={36} />
                        </div>
                        <div className="flex-1">
                            <h1 className={`${THEME.font.h1} text-3xl md:text-4xl`}>MY SUPER ADMIN PROFILE</h1>
                            <p className={`${THEME.font.muted} mt-2 text-xs uppercase tracking-widest flex items-center gap-2`}>
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {user.role} - Active Account
                            </p>
                        </div>
                        <Button variant="ghost" onClick={logout} className="hidden md:flex items-center gap-2">
                            <AiOutlineLogout size={18} />
                            Logout
                        </Button>
                    </div>
                    {!isEditing ? (
                        <Button
                            variant="primary"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2"
                        >
                            <AiOutlineEdit size={18} />
                            <span className="hidden md:inline">EDIT</span>
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-1"
                            >
                                <AiOutlineClose size={16} />
                                <span className="hidden md:inline">Cancel</span>
                            </Button>
                            <Button
                                variant="primary"
                                onClick={form.handleSubmit}
                                isLoading={form.isSubmitting}
                                className="flex items-center gap-1"
                            >
                                <AiOutlineSave size={16} />
                                <span className="hidden md:inline">Save</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-b-4 border-brand-border p-8 shadow-md mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative flex-shrink-0">
                        <div className="w-40 h-40 bg-gradient-to-br from-brand-primary to-orange-500 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-white text-6xl font-black">
                            {user.imageUrl ? (
                                <img
                                    src={getImageUrl(user.imageUrl, 'admin')}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-3xl"
                                />
                            ) : (
                                getInitials(user.firstName, user.lastName)
                            )}
                        </div>
                        <div className={`absolute -bottom-2 -right-2 p-3 rounded-2xl border-4 border-white shadow-lg ${user.verified
                            ? 'bg-green-500'
                            : 'bg-red-500'
                            }`}>
                            {user.verified ? (
                                <AiOutlineCheckCircle className="text-white" size={24} />
                            ) : (
                                <AiOutlineCloseCircle className="text-white" size={24} />
                            )}
                        </div>
                        <div className="absolute -top-2 -left-2 px-3 py-2 bg-yellow-400 text-yellow-900 rounded-xl border-3 border-yellow-600 font-black text-xs flex items-center gap-1">
                            <AiOutlineCrown size={14} />
                            SUPER ADMIN
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="firstName"
                                        value={form.values.firstName}
                                        onChange={form.handleChange}
                                        error={form.errors.firstName}
                                        placeholder="First Name"
                                        label="First Name"
                                    />
                                    <Input
                                        name="lastName"
                                        value={form.values.lastName}
                                        onChange={form.handleChange}
                                        error={form.errors.lastName}
                                        placeholder="Last Name"
                                        label="Last Name"
                                    />
                                </div>
                                <Input
                                    name="birthDate"
                                    type="date"
                                    value={form.values.birthDate}
                                    onChange={form.handleChange}
                                    error={form.errors.birthDate}
                                    label="Date of Birth"
                                />
                                <Input
                                    name="phoneNumber"
                                    value={form.values.phoneNumber}
                                    onChange={form.handleChange}
                                    error={form.errors.phoneNumber}
                                    placeholder="Phone"
                                    label="Phone Number"
                                />
                                <Input
                                    name="imageUrl"
                                    value={form.values.imageUrl || ''}
                                    onChange={form.handleChange}
                                    error={form.errors.imageUrl}
                                    placeholder="Image Name or URL (GitHub)"
                                    label="Profile Picture"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <InfoItem icon={<AiOutlineUser />} label="Name" value={`${user.firstName} ${user.lastName}`} />
                                <InfoItem icon={<AiOutlineMail />} label="Email" value={user.email} />
                                <InfoItem icon={<AiOutlinePhone />} label="Phone" value={user.phoneNumber || '-'} />
                                <InfoItem icon={<AiOutlineCalendar />} label="Born on" value={formatDate(user.birthDate)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Account"
                    status={user.verified ? "Verified" : "Unverified"}
                    icon={<AiOutlineCheckCircle size={24} />}
                    color={user.verified ? "green" : "orange"}
                />
                <StatCard
                    title="Role"
                    status={user.role}
                    icon={<AiOutlineCrown size={24} />}
                    color="blue"
                />
                <StatCard
                    title="Status"
                    status="Active"
                    icon={<AiOutlineAlert size={24} />}
                    color="green"
                />
            </div>

            <div className="bg-white rounded-3xl border-2 border-b-4 border-brand-border p-8 shadow-md">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-brand-border">
                    <div className="p-3 bg-red-100 rounded-2xl">
                        <AiOutlineLock className="text-red-600" size={24} />
                    </div>
                    <div>
                        <h2 className={`${THEME.font.h2} text-xl`}>SECURITY & PRIVACY</h2>
                        <p className="text-xs text-brand-muted mt-1">Manage your security and passwords</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AiOutlineKey className="text-red-600" size={20} />
                            <div>
                                <p className="font-black text-sm text-red-900">Change Password</p>
                                <p className="text-xs text-red-700">For better security</p>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            Change
                        </Button>
                    </div>

                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AiOutlineMail className="text-blue-600" size={20} />
                            <div>
                                <p className="font-black text-sm text-blue-900">Email Address</p>
                                <p className="text-xs text-blue-700">{user.email}</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black border border-green-300">
                            Verified
                        </div>
                    </div>
                </div>
            </div>

            <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSave={async (newPass) => {
                    await updateProfile({ password: newPass });
                    setShowPasswordModal(false);
                }}
            />
        </div>
    );
};

export default SuperAdminProfile;