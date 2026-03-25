import React, { useState } from 'react';
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
    AiOutlineCloseCircle,
    AiOutlineMan,
    AiOutlineWoman,
    AiOutlineCrown,
    AiOutlineStar,
    AiOutlineArrowRight,
    AiOutlineUserAdd
} from 'react-icons/ai';
import { PersonResponse, MemberStatus, Gender } from '../../../lib/types';
import { formatDate, calculateAge, getInitials } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';
import Button from '../../ui/Button';

interface MemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: PersonResponse | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onAddChild?: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
    isOpen,
    onClose,
    member,
    onEdit,
    onDelete,
    onAddChild
}) => {
    const [selectedChild, setSelectedChild] = useState<PersonResponse | null>(null);

    if (!isOpen || !member) return null;

    const isMale = member.gender === Gender.MALE;
    const genderIcon = isMale ? <AiOutlineMan size={20} /> : <AiOutlineWoman size={20} />;
    const genderColor = isMale ? 'from-blue-500 to-blue-600' : 'from-pink-500 to-rose-500';
    const genderBg = isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600';

    const getStatusBadge = () => {
        if (member.status === MemberStatus.WORKER) {
            return {
                label: 'Worker',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-100 text-purple-700',
                icon: <AiOutlineCrown size={14} />
            };
        }
        return {
            label: 'Student',
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-100 text-amber-700',
            icon: <AiOutlineStar size={14} />
        };
    };

    const getMembershipBadge = () => {
        if (member.isActiveMember) {
            return {
                label: 'Active Member',
                color: 'from-green-500 to-emerald-500',
                bg: 'bg-green-100 text-green-700',
                icon: <AiOutlineCheckCircle size={14} />
            };
        }
        return {
            label: 'Inactive Member',
            color: 'from-gray-500 to-gray-600',
            bg: 'bg-gray-100 text-gray-600',
            icon: <AiOutlineCloseCircle size={14} />
        };
    };

    const statusBadge = getStatusBadge();
    const membershipBadge = getMembershipBadge();
    const age = calculateAge(member.birthDate);
    const hasImage = member.imageUrl && member.imageUrl.trim() !== '';
    const avatarUrl = hasImage ? getImageUrl(member.imageUrl, 'member') : null;

    const hasChildren = member.children && member.children.length > 0;

    const handleChildClick = (child: PersonResponse) => {
        setSelectedChild(child);
    };

    return createPortal(
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-4 border-white flex flex-col">
                    {/* Header avec cover photo */}
                    <div className={`relative h-40 bg-linear-to-r ${genderColor} overflow-hidden shrink-0`}>
                        {/* Pattern décoratif */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                        </div>
                        
                        {/* Bouton fermer */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-all backdrop-blur-sm"
                        >
                            <AiOutlineClose size={20} />
                        </button>
                        
                        {/* Badges dans le header */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-sm bg-white/90 shadow-sm flex items-center gap-1.5 ${statusBadge.bg}`}>
                                {statusBadge.icon}
                                {statusBadge.label}
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-sm bg-white/90 shadow-sm flex items-center gap-1.5 ${membershipBadge.bg}`}>
                                {membershipBadge.icon}
                                {membershipBadge.label}
                            </div>
                        </div>
                        
                        {/* Avatar */}
                        <div className="absolute -bottom-12 left-6">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={member.firstName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                                                (e.target as HTMLImageElement).parentElement!.classList.add('text-3xl', 'font-black', isMale ? 'text-blue-500' : 'text-pink-500');
                                            }}
                                        />
                                    ) : (
                                        <span className={`text-3xl font-black ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
                                            {getInitials(member.firstName, member.lastName)}
                                        </span>
                                    )}
                                </div>
                                <div className={`absolute -inset-1 rounded-2xl bg-linear-to-r ${genderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 pt-16">
                        {/* En-tête avec nom et infos */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={genderBg + " p-1.5 rounded-lg text-xs"}>
                                        {genderIcon}
                                    </span>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">
                                        {member.firstName} <span className="text-brand-primary">{member.lastName}</span>
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] font-mono bg-gray-100 px-3 py-1 rounded-full">
                                        {member.id}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        N° {member.sequenceNumber}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {onAddChild && (
                                    <button
                                        onClick={onAddChild}
                                        className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all group"
                                        title="Add Child"
                                    >
                                        <AiOutlineUserAdd size={18} />
                                    </button>
                                )}
                                {onEdit && (
                                    <button
                                        onClick={onEdit}
                                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all group"
                                        title="Edit"
                                    >
                                        <AiOutlineEdit size={18} />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={onDelete}
                                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all group"
                                        title="Delete"
                                    >
                                        <AiOutlineDelete size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Grille d'informations principale */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <InfoCard
                                icon={<AiOutlineIdcard />}
                                label="Member ID"
                                value={member.id}
                                gradient={genderColor}
                            />
                            <InfoCard
                                icon={<AiOutlineCalendar />}
                                label="Birth Date"
                                value={`${formatDate(member.birthDate)} (${age} years)`}
                                gradient={genderColor}
                            />
                            <InfoCard
                                icon={<AiOutlinePhone />}
                                label="Phone Number"
                                value={member.phoneNumber || 'Not provided'}
                                gradient={genderColor}
                            />
                            <InfoCard
                                icon={<AiOutlineGlobal />}
                                label="District"
                                value={member.districtName}
                                gradient={genderColor}
                            />
                            <InfoCard
                                icon={<AiOutlineFlag />}
                                label="Tribute"
                                value={member.tributeName}
                                gradient={genderColor}
                            />
                            <InfoCard
                                icon={<AiOutlineTeam />}
                                label="Status"
                                value={member.status === MemberStatus.WORKER ? 'Worker' : 'Student'}
                                gradient={genderColor}
                            />
                        </div>

                        {/* Section Parent */}
                        {member.parentName && (
                            <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 mb-8 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <AiOutlineUser className="text-indigo-500" size={18} />
                                    <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                                        Parent Information
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 font-black text-sm">
                                            {getInitials(member.parentName.split(' ')[0] || '', member.parentName.split(' ')[1] || '')}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase">{member.parentName}</p>
                                            <p className="text-[10px] text-gray-500">Parent / Guardian</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-400 uppercase">Relationship</p>
                                        <p className="font-bold text-xs text-indigo-600">Child</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section Enfants */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <AiOutlineTeam className="text-brand-primary" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-wider">
                                        Children ({member.childrenCount || 0})
                                    </h3>
                                </div>
                                {onAddChild && member.childrenCount > 0 && (
                                    <button
                                        onClick={onAddChild}
                                        className="text-[10px] font-black text-brand-primary hover:underline uppercase"
                                    >
                                        + Add another
                                    </button>
                                )}
                            </div>

                            {!hasChildren ? (
                                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                                    <AiOutlineUserAdd size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase">No children registered</p>
                                    {onAddChild && (
                                        <button
                                            onClick={onAddChild}
                                            className="mt-3 text-[10px] font-black text-brand-primary hover:underline uppercase"
                                        >
                                            + Add a child
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {member.children?.map((child) => {
                                        const childIsMale = child.gender === Gender.MALE;
                                        const childAge = calculateAge(child.birthDate);
                                        
                                        return (
                                            <div
                                                key={child.id}
                                                onClick={() => handleChildClick(child)}
                                                className="group bg-white border-2 border-gray-100 rounded-xl p-3 hover:shadow-lg hover:border-brand-primary/30 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black ${childIsMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                        {getInitials(child.firstName, child.lastName)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-xs uppercase truncate">
                                                            {child.firstName} {child.lastName}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[8px] text-gray-400">{child.id}</span>
                                                            <span className="text-[8px] text-gray-400">•</span>
                                                            <span className="text-[8px] text-gray-400">{childAge} ans</span>
                                                        </div>
                                                    </div>
                                                    <AiOutlineArrowRight size={12} className="text-gray-300 group-hover:text-brand-primary transition-colors" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pied de page */}
                        <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
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
            </div>

            {/* Child Detail Sub-modal */}
            {selectedChild && (
                <ChildDetailModal
                    isOpen={!!selectedChild}
                    onClose={() => setSelectedChild(null)}
                    child={selectedChild}
                />
            )}
        </>,
        document.body
    );
};

// Composant pour les cartes d'information
interface InfoCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    gradient: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, gradient }) => (
    <div className={`bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all group`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-linear-to-r ${gradient} bg-opacity-10 text-white group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                <p className="font-bold text-xs text-gray-800 truncate">{value}</p>
            </div>
        </div>
    </div>
);

// Composant pour le modal enfant
interface ChildDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: PersonResponse;
}

const ChildDetailModal: React.FC<ChildDetailModalProps> = ({ isOpen, onClose, child }) => {
    if (!isOpen) return null;

    const isMale = child.gender === Gender.MALE;
    const childAge = calculateAge(child.birthDate);

    return createPortal(
        <div className="fixed inset-0 z-250 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border-2 border-white">
                <div className={`p-4 bg-linear-to-r ${isMale ? 'from-blue-500 to-blue-600' : 'from-pink-500 to-rose-500'} text-white`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isMale ? <AiOutlineMan size={20} /> : <AiOutlineWoman size={20} />}
                            <h3 className="font-black text-sm uppercase">Child Details</h3>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
                            <AiOutlineClose size={16} />
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                            {getInitials(child.firstName, child.lastName)}
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase">{child.firstName} {child.lastName}</p>
                            <p className="text-[9px] font-mono text-gray-400">{child.id}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Age</span>
                            <span className="text-xs font-bold">{childAge} years</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Status</span>
                            <span className="text-xs font-bold">{child.status === MemberStatus.WORKER ? 'Worker' : 'Student'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Active</span>
                            <span className="text-xs font-bold">{child.isActiveMember ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    <Button variant="primary" onClick={onClose} className="w-full mt-4 text-sm">
                        Close
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MemberDetailModal;