import React from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineUser,
    AiOutlinePhone,
    AiOutlineFlag,
    AiOutlineIdcard,
    AiOutlineCalendar,
    AiOutlineTeam,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
    AiOutlineWoman,
    AiOutlineCrown,
    AiOutlineStar,
    AiOutlineArrowRight,
    AiOutlineUserAdd,
    AiOutlineHeart,
    AiOutlineMan,
    AiOutlineClockCircle,
    AiOutlineSafety,
    AiOutlineRise
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
    onViewChild?: (child: PersonResponse) => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
    isOpen,
    onClose,
    member,
    onEdit,
    onDelete,
    onAddChild,
    onViewChild
}) => {
    if (!isOpen || !member) return null;

    const isMale = member.gender === Gender.MALE;
    const genderIcon = isMale ? <AiOutlineMan size={20} /> : <AiOutlineWoman size={20} />;
    const genderColor = isMale ? 'from-blue-600 via-blue-500 to-cyan-400' : 'from-pink-600 via-pink-500 to-rose-400';
    const genderBg = isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600';

    const getStatusBadge = () => {
        if (member.status === MemberStatus.WORKER) {
            return {
                label: 'Worker',
                color: 'from-purple-600 to-purple-700',
                bg: 'bg-purple-100 text-purple-700',
                icon: <AiOutlineCrown size={14} />,
                description: 'Employed member'
            };
        }
        return {
            label: 'Student',
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-100 text-amber-700',
            icon: <AiOutlineStar size={14} />,
            description: 'Currently studying'
        };
    };

    const getMembershipBadge = () => {
        if (member.isActiveMember) {
            return {
                label: 'Active',
                color: 'from-green-500 to-emerald-500',
                bg: 'bg-green-100 text-green-700',
                icon: <AiOutlineCheckCircle size={14} />,
                description: 'Member in good standing'
            };
        }
        return {
            label: 'Inactive',
            color: 'from-gray-500 to-gray-600',
            bg: 'bg-gray-100 text-gray-600',
            icon: <AiOutlineCloseCircle size={14} />,
            description: 'Temporarily inactive'
        };
    };

    const statusBadge = getStatusBadge();
    const membershipBadge = getMembershipBadge();
    const age = calculateAge(member.birthDate);
    const hasImage = member.imageUrl && member.imageUrl.trim() !== '';
    const avatarUrl = hasImage ? getImageUrl(member.imageUrl, 'member') : null;
    const hasChildren = member.children && member.children.length > 0;

    const handleChildClick = (child: PersonResponse) => {
        if (onViewChild) {
            onViewChild(child);
        }
    };

    const getMemberSinceDate = () => {
        if (member.createdAt) {
            return formatDate(member.createdAt);
        }
        return 'Recently';
    };

    return createPortal(
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-4 border-white flex flex-col animate-in zoom-in duration-300">
                {/* Header avec cover photo premium */}
                <div className={`relative h-48 bg-linear-to-r ${genderColor} overflow-hidden shrink-0`}>
                    {/* Pattern décoratif animé */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/30 rounded-full blur-2xl" />
                    </div>
                    
                    {/* Badges décoratifs */}
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-4 left-4 flex gap-2">
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-white/95 shadow-lg flex items-center gap-1.5 ${statusBadge.bg} border border-white/50`}>
                                {statusBadge.icon}
                                {statusBadge.label}
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-white/95 shadow-lg flex items-center gap-1.5 ${membershipBadge.bg} border border-white/50`}>
                                {membershipBadge.icon}
                                {membershipBadge.label}
                            </div>
                        </div>
                    </div>
                    
                    {/* Bouton fermer */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm hover:scale-110"
                    >
                        <AiOutlineClose size={20} />
                    </button>
                    
                    {/* Avatar premium */}
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
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
                            <div className={`absolute -inset-1 rounded-2xl bg-linear-to-r ${genderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md`} />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <AiOutlineHeart size={10} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-20">
                    {/* En-tête avec nom et infos */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`${genderBg} p-1.5 rounded-xl text-xs shadow-sm`}>
                                    {genderIcon}
                                </span>
                                <h2 className="text-3xl font-black uppercase tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    {member.firstName} <span className="text-brand-primary">{member.lastName}</span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <AiOutlineIdcard size={12} className="text-gray-500" />
                                    <span className="text-[10px] font-mono font-bold">{member.id}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <AiOutlineCalendar size={12} className="text-gray-500" />
                                    <span className="text-[10px] font-bold">N° {member.sequenceNumber}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                                    <AiOutlineClockCircle size={12} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-600">Member since {getMemberSinceDate()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {onAddChild && (
                                <button
                                    onClick={onAddChild}
                                    className="p-2.5 bg-linear-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-600 rounded-xl transition-all group shadow-sm hover:shadow-md"
                                    title="Add Child"
                                >
                                    <AiOutlineUserAdd size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-2.5 bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 rounded-xl transition-all group shadow-sm hover:shadow-md"
                                    title="Edit"
                                >
                                    <AiOutlineEdit size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-2.5 bg-linear-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 rounded-xl transition-all group shadow-sm hover:shadow-md"
                                    title="Delete"
                                >
                                    <AiOutlineDelete size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        <QuickStat
                            icon={<AiOutlineRise />}
                            label="Age"
                            value={`${age} years`}
                            gradient={genderColor}
                        />
                        <QuickStat
                            icon={<AiOutlineTeam />}
                            label="Children"
                            value={member.childrenCount?.toString() || '0'}
                            gradient={genderColor}
                        />
                        <QuickStat
                            icon={<AiOutlineSafety />}
                            label="Status"
                            value={member.isActiveMember ? 'Active' : 'Inactive'}
                            gradient={genderColor}
                        />
                        <QuickStat
                            icon={<AiOutlineUser />}
                            label="Type"
                            value={member.status === MemberStatus.WORKER ? 'Worker' : 'Student'}
                            gradient={genderColor}
                        />
                    </div>

                    {/* Grille d'informations principale */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <InfoCardPremium
                            icon={<AiOutlineIdcard />}
                            label="Member ID"
                            value={member.id}
                            gradient={genderColor}
                            description="Unique identifier"
                        />
                        <InfoCardPremium
                            icon={<AiOutlineCalendar />}
                            label="Birth Date"
                            value={`${formatDate(member.birthDate)}`}
                            gradient={genderColor}
                            description={`${age} years old`}
                        />
                        <InfoCardPremium
                            icon={<AiOutlinePhone />}
                            label="Phone Number"
                            value={member.phoneNumber || 'Not provided'}
                            gradient={genderColor}
                            description="Contact"
                        />
                        <InfoCardPremium
                            icon={<AiOutlineMan />}
                            label="District"
                            value={member.districtName}
                            gradient={genderColor}
                            description="Geographic zone"
                        />
                        <InfoCardPremium
                            icon={<AiOutlineFlag />}
                            label="Tribute"
                            value={member.tributeName}
                            gradient={genderColor}
                            description="Traditional entity"
                        />
                    </div>

                    {/* Section Parent */}
                    {member.parentName && (
                        <div className="relative bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 mb-8 border border-indigo-200 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                        <AiOutlineUser className="text-indigo-600" size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
                                        Parent Information
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                            {getInitials(member.parentName.split(' ')[0] || '', member.parentName.split(' ')[1] || '')}
                                        </div>
                                        <div>
                                            <p className="font-black text-base uppercase tracking-tight">{member.parentName}</p>
                                            <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                                                <AiOutlineHeart size={10} />
                                                Parent / Guardian
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
                                        <p className="text-[8px] text-gray-400 uppercase tracking-wider">Relationship</p>
                                        <p className="font-black text-sm text-indigo-600">Child</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Enfants */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-linear-to-r from-brand-primary to-orange-500 rounded-xl shadow-md">
                                    <AiOutlineTeam className="text-white" size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wider">
                                        Children ({member.childrenCount || 0})
                                    </h3>
                                    <p className="text-[9px] text-gray-400">Family lineage</p>
                                </div>
                            </div>
                            {onAddChild && (
                                <button
                                    onClick={onAddChild}
                                    className="text-[10px] font-black text-brand-primary hover:text-brand-primary-dark transition-colors flex items-center gap-1"
                                >
                                    <AiOutlineUserAdd size={12} />
                                    Add child
                                </button>
                            )}
                        </div>

                        {!hasChildren ? (
                            <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border-2 border-dashed border-gray-300">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AiOutlineUserAdd size={32} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-black text-gray-500 uppercase">No children registered</p>
                                <p className="text-[10px] text-gray-400 mt-1">This member has no children in the system</p>
                                {onAddChild && (
                                    <button
                                        onClick={onAddChild}
                                        className="mt-4 text-[10px] font-black text-brand-primary hover:underline uppercase flex items-center gap-1 mx-auto"
                                    >
                                        <AiOutlineUserAdd size={12} />
                                        Add a child
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {member.children?.map((child) => {
                                    const childIsMale = child.gender === Gender.MALE;
                                    const childAge = calculateAge(child.birthDate);
                                    const childAvatarUrl = child.imageUrl ? getImageUrl(child.imageUrl, 'member') : null;
                                    
                                    return (
                                        <div
                                            key={child.id}
                                            onClick={() => handleChildClick(child)}
                                            className="group relative bg-white border-2 border-gray-100 rounded-2xl p-4 hover:shadow-2xl hover:border-brand-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
                                        >
                                            <div className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${childIsMale ? 'from-blue-100' : 'from-pink-100'} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                            
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black shadow-md transition-transform group-hover:scale-110 ${childIsMale ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white' : 'bg-linear-to-br from-pink-500 to-rose-500 text-white'}`}>
                                                    {childAvatarUrl ? (
                                                        <img
                                                            src={childAvatarUrl}
                                                            alt={child.firstName}
                                                            className="w-full h-full object-cover rounded-xl"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(child.firstName, child.lastName);
                                                            }}
                                                        />
                                                    ) : (
                                                        getInitials(child.firstName, child.lastName)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-sm uppercase truncate group-hover:text-brand-primary transition-colors">
                                                        {child.firstName} {child.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {child.id.slice(-6)}
                                                        </span>
                                                        <span className="text-[8px] text-gray-400">•</span>
                                                        <span className="text-[8px] font-bold text-amber-600">{childAge} years</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1.5">
                                                        {child.isActiveMember ? (
                                                            <AiOutlineCheckCircle size={10} className="text-green-500" />
                                                        ) : (
                                                            <AiOutlineCloseCircle size={10} className="text-gray-400" />
                                                        )}
                                                        <span className="text-[7px] font-bold uppercase text-gray-500">
                                                            {child.status === MemberStatus.WORKER ? 'Worker' : 'Student'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shadow-lg">
                                                        <AiOutlineArrowRight size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pied de page */}
                    <div className="flex gap-3 pt-6 border-t-2 border-gray-100 mt-4">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 py-3"
                        >
                            Close
                        </Button>
                        {onEdit && (
                            <Button
                                variant="primary"
                                onClick={onEdit}
                                className="flex-1 py-3"
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

// Composant QuickStat amélioré
interface QuickStatProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    gradient: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ icon, label, value, gradient }) => (
    <div className={`bg-linear-to-br from-white to-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all group`}>
        <div className={`p-2 rounded-lg bg-linear-to-r ${gradient} bg-opacity-10 text-white w-fit mb-2 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <p className="text-[8px] font-black uppercase tracking-wider text-gray-400">{label}</p>
        <p className="font-black text-sm text-gray-800">{value}</p>
    </div>
);

// Composant InfoCard Premium
interface InfoCardPremiumProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    gradient: string;
    description?: string;
}

const InfoCardPremium: React.FC<InfoCardPremiumProps> = ({ icon, label, value, gradient, description }) => (
    <div className={`bg-linear-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all group hover:border-transparent`}>
        <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl bg-linear-to-r ${gradient} bg-opacity-10 text-white group-hover:scale-110 transition-transform shadow-sm`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-[8px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                <p className="font-black text-sm text-gray-800 mt-0.5">{value}</p>
                {description && (
                    <p className="text-[8px] text-gray-400 mt-1">{description}</p>
                )}
            </div>
        </div>
    </div>
);

export default MemberDetailModal;