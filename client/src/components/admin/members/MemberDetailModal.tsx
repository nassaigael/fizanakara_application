import React from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineUser,
    AiOutlinePhone,
    AiOutlineGlobal,
    AiOutlineFlag,
    AiOutlineIdcard,
    AiOutlineCalendar,
    AiOutlineTeam,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineCheckCircle,
    AiOutlineCloseCircle
} from 'react-icons/ai';
import { PersonResponse, MemberStatus } from '../../../lib/types';
import { formatDate, calculateAge, getInitials } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';
import Button from '../../ui/Button';

interface MemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: PersonResponse | null;
    onEdit?: () => void;
    onDelete?: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
    isOpen,
    onClose,
    member,
    onEdit,
    onDelete
}) => {
    if (!isOpen || !member) return null;

    const getStatusBadge = () => {
        if (member.status === MemberStatus.WORKER) {
            return {
                label: 'Worker',
                color: 'bg-purple-100 text-purple-700 border-purple-200',
                icon: <AiOutlineTeam size={14} />
            };
        }
        return {
            label: 'Student',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: <AiOutlineTeam size={14} />
        };
    };

    const statusBadge = getStatusBadge();
    const age = calculateAge(member.birthDate);
    const hasImage = member.imageUrl && member.imageUrl.trim() !== '';
    const avatarUrl = hasImage ? getImageUrl(member.imageUrl, 'member') : null;

    return createPortal(
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border-4 border-white">
                {/* Header with Cover */}
                <div className="relative h-32 bg-linear-to-r from-brand-primary to-orange-500">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <AiOutlineClose size={20} />
                    </button>
                    
                    {/* Avatar */}
                    <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={member.firstName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                                        (e.target as HTMLImageElement).parentElement!.classList.add('text-2xl', 'font-black', 'text-brand-primary');
                                    }}
                                />
                            ) : (
                                <span className="text-3xl font-black text-brand-primary">
                                    {getInitials(member.firstName, member.lastName)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 px-6 pb-6">
                    {/* Header Info */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">
                                {member.firstName} {member.lastName}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${statusBadge.color} border`}>
                                    {statusBadge.icon}
                                    <span className="ml-1">{statusBadge.label}</span>
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                    ID: {member.id}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all"
                                    title="Edit"
                                >
                                    <AiOutlineEdit size={18} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <AiOutlineDelete size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <InfoItem
                            icon={<AiOutlineIdcard />}
                            label="Member ID"
                            value={member.id}
                            highlight
                        />
                        <InfoItem
                            icon={<AiOutlineUser />}
                            label="Full Name"
                            value={`${member.firstName} ${member.lastName}`}
                        />
                        <InfoItem
                            icon={<AiOutlineCalendar />}
                            label="Birth Date"
                            value={`${formatDate(member.birthDate)} (${age} years)`}
                        />
                        <InfoItem
                            icon={<AiOutlinePhone />}
                            label="Phone Number"
                            value={member.phoneNumber || 'Not provided'}
                        />
                        <InfoItem
                            icon={<AiOutlineGlobal />}
                            label="District"
                            value={member.districtName}
                        />
                        <InfoItem
                            icon={<AiOutlineFlag />}
                            label="Tribute"
                            value={member.tributeName}
                        />
                    </div>

                    {/* Family Info */}
                    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
                            Family Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase">Status</p>
                                <p className="font-bold text-sm flex items-center gap-2 mt-1">
                                    {member.isActiveMember ? (
                                        <>
                                            <AiOutlineCheckCircle className="text-green-500" size={14} />
                                            <span className="text-green-600">Active Member</span>
                                        </>
                                    ) : (
                                        <>
                                            <AiOutlineCloseCircle className="text-orange-500" size={14} />
                                            <span className="text-orange-600">Inactive Member</span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase">Children</p>
                                <p className="font-black text-lg">{member.childrenCount || 0}</p>
                            </div>
                            {member.parentName && (
                                <div className="col-span-2">
                                    <p className="text-[8px] font-black text-gray-400 uppercase">Parent</p>
                                    <p className="font-bold text-sm">{member.parentName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        {onEdit && (
                            <Button
                                variant="primary"
                                onClick={onEdit}
                                className="flex-1"
                            >
                                Edit Member
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, highlight }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${highlight ? 'bg-brand-primary/5 border border-brand-primary/20' : 'bg-gray-50'}`}>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white text-gray-400'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-[8px] font-black uppercase tracking-wider text-gray-400">{label}</p>
            <p className={`font-bold text-sm ${highlight ? 'text-brand-primary' : 'text-gray-800'}`}>
                {value}
            </p>
        </div>
    </div>
);

export default MemberDetailModal;