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
    AiOutlineLogout,
    AiOutlineCrown,
    AiOutlineIdcard
} from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { updateAdminSchema } from '../../lib/validators/admin.validator';
import { UpdateAdminRequest } from '../../lib/types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { THEME } from '../../styles/theme';
import { getInitials } from '../../lib/helper';
import { getImageUrl } from '../../lib/constant/constant';
import StatCard from '../../components/ui/StatCard';
import InfoItem from '../../components/ui/InfoItem';
import PasswordModal from '../../components/profile/PasswordModal';
import { AuthService } from '../../services/auth.service';

const AdminProfile: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-primary text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AiOutlineUser size={32} />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.h1} text-3xl uppercase`}>Account Profile</h1>
                        <p className={`${THEME.font.muted} mt-1 text-xs uppercase tracking-widest`}>
                            {user.role}
                        </p>
                    </div>
                </div>

                {!isEditing ? (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={logout} className="hidden md:flex items-center gap-2">
                            <AiOutlineLogout size={18} />
                            LOGOUT
                        </Button>
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            <AiOutlineEdit className="mr-2" /> EDIT
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            CANCEL
                        </Button>
                        <Button variant="primary" onClick={form.handleSubmit} isLoading={form.isSubmitting}>
                            SAVE CHANGES
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Account Status" 
                    status={user.verified ? "Verified" : "Pending"} 
                    icon={user.verified ? <AiOutlineCheckCircle /> : <AiOutlineCloseCircle />}
                    color={user.verified ? 'green' : 'orange'}
                />
                <StatCard 
                    title="Role" 
                    status={user.role} 
                    icon={<AiOutlineCrown />} 
                    color="blue"
                />
                <StatCard 
                    title="Member ID" 
                    status={`#${user.id.substring(0, 8)}`} 
                    icon={<AiOutlineIdcard />} 
                    color="orange"
                />
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 p-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Avatar */}
                    <div className="relative group">
                        {user.imageUrl ? (
                            <img
                                src={getImageUrl(user.imageUrl, 'admin')}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-48 h-48 rounded-[3rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] object-cover"
                            />
                        ) : (
                            <div className="w-48 h-48 bg-linear-to-br from-brand-primary to-orange-500 rounded-[3rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white text-6xl font-black">
                                {getInitials(user.firstName, user.lastName)}
                            </div>
                        )}
                        <div className={`absolute -bottom-2 -right-2 p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${user.verified ? 'bg-green-500' : 'bg-red-500'}`}>
                            {user.verified ? <AiOutlineCheckCircle className="text-white" size={24} /> : <AiOutlineCloseCircle className="text-white" size={24} />}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="First Name" name="firstName" value={form.values.firstName} onChange={form.handleChange} error={form.errors.firstName} />
                                <Input label="Last Name" name="lastName" value={form.values.lastName} onChange={form.handleChange} error={form.errors.lastName} />
                                <Input label="Birth Date" name="birthDate" type="date" value={form.values.birthDate} onChange={form.handleChange} error={form.errors.birthDate} />
                                <Input label="Phone Number" name="phoneNumber" value={form.values.phoneNumber} onChange={form.handleChange} error={form.errors.phoneNumber} />
                                <div className="md:col-span-2">
                                    <Input label="Avatar URL" name="imageUrl" value={form.values.imageUrl || ''} onChange={form.handleChange} error={form.errors.imageUrl} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoItem icon={<AiOutlineUser />} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                                <InfoItem icon={<AiOutlineMail />} label="Email Address" value={user.email} />
                                <InfoItem icon={<AiOutlinePhone />} label="Phone Number" value={user.phoneNumber || 'Not provided'} />
                                <InfoItem icon={<AiOutlineCalendar />} label="Birth Date" value={user.birthDate || 'Not provided'} />
                                <div className="md:col-span-2 pt-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Security Status</p>
                                        <div className="flex items-center gap-2 text-green-600 font-bold">
                                            <AiOutlineLock /> Secure • Multi-factor authentication active
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-200 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className={`${THEME.font.h2} text-xl flex items-center gap-2 mb-2`}>
                            <AiOutlineLock className="text-brand-primary" /> 
                            PASSWORD & SECURITY
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Manage your password and other security settings to keep your account safe.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <AiOutlineLock /> CHANGE PASSWORD
                    </Button>
                </div>
            </div>

            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSave={async (newPassword) => {
                    await AuthService.updateMe({ password: newPassword });
                }}
            />
        </div>
    );
};

export default AdminProfile;