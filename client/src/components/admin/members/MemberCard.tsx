import React from 'react';
import { 
    AiOutlinePhone, 
    AiOutlineGlobal, 
    AiOutlineFlag, 
    AiOutlineEdit, 
    AiOutlineDelete, 
    AiOutlineEye,
    AiOutlineMan,
    AiOutlineWoman,
    AiOutlineStar,
    AiOutlineCrown
} from 'react-icons/ai';
import { Gender, PersonResponse, MemberStatus } from '../../../lib/types';
import { getInitials } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';

interface MemberCardProps {
    member: PersonResponse;
    onEdit: (member: PersonResponse) => void;
    onDelete: (id: string) => void;
    onView?: (member: PersonResponse) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit, onDelete, onView }) => {
    const hasImage = member.imageUrl && member.imageUrl.trim() !== '';
    const avatarUrl = hasImage ? getImageUrl(member.imageUrl, 'member') : null;
    const isMale = member.gender === Gender.MALE;

    // Couleurs de fond selon le sexe
    const coverColors = {
        male: 'from-blue-600 via-blue-500 to-cyan-400',
        female: 'from-pink-600 via-pink-500 to-rose-400',
    };

    const genderIcon = isMale ? <AiOutlineMan size={20} /> : <AiOutlineWoman size={20} />;
    const genderText = isMale ? 'Male' : 'Female';
    const genderColor = isMale ? 'text-blue-600' : 'text-pink-600';

    const getStatusBadge = () => {
        if (member.status === MemberStatus.WORKER) {
            return {
                label: 'Worker',
                color: 'bg-purple-600',
                lightColor: 'bg-purple-100 text-purple-700',
                icon: <AiOutlineCrown size={12} />
            };
        }
        return {
            label: 'Student',
            color: 'bg-amber-500',
            lightColor: 'bg-amber-100 text-amber-700',
            icon: <AiOutlineStar size={12} />
        };
    };

    const getMembershipBadge = () => {
        if (member.isActiveMember) {
            return {
                label: 'Active',
                color: 'bg-green-500',
                lightColor: 'bg-green-100 text-green-700'
            };
        }
        return {
            label: 'Inactive',
            color: 'bg-gray-500',
            lightColor: 'bg-gray-100 text-gray-600'
        };
    };

    const statusBadge = getStatusBadge();
    const membershipBadge = getMembershipBadge();

    return (
        <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Cover Photo avec gradient selon le sexe */}
            <div className={`relative h-32 bg-linear-to-r ${coverColors[isMale ? 'male' : 'female']} overflow-hidden`}>
                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>
                
                {/* Badge de statut dans le cover */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className={`px-2 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider ${statusBadge.lightColor} backdrop-blur-sm bg-white/90 shadow-sm flex items-center gap-1`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                    </div>
                    <div className={`px-2 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider ${membershipBadge.lightColor} backdrop-blur-sm bg-white/90 shadow-sm`}>
                        {membershipBadge.label}
                    </div>
                </div>
                
                {/* Icône de genre flottante */}
                <div className="absolute bottom-2 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                    <span className={genderColor}>{genderIcon}</span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-700">{genderText}</span>
                </div>
            </div>

            {/* Avatar - agrandi et en surimpression */}
            <div className="relative px-4">
                <div className="absolute -top-12 left-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={member.firstName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                                        (e.target as HTMLImageElement).parentElement!.classList.add('text-2xl', 'font-black', genderColor);
                                    }}
                                />
                            ) : (
                                <span className={`text-2xl font-black ${genderColor}`}>
                                    {getInitials(member.firstName, member.lastName)}
                                </span>
                            )}
                        </div>
                        {/* Anneau décoratif */}
                        <div className={`absolute -inset-1 rounded-2xl bg-linear-to-r ${coverColors[isMale ? 'male' : 'female']} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="pt-14 p-4 pb-5">
                {/* Nom et ID */}
                <div className="mb-3 text-center">
                    <h3 className="font-black text-base uppercase tracking-tight">
                        {member.lastName}{' '}
                        <span className={`bg-linear-to-r ${coverColors[isMale ? 'male' : 'female']} bg-clip-text text-transparent`}>
                            {member.firstName}
                        </span>
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <p className="text-[9px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {member.id}
                        </p>
                        {member.isActiveMember && (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-2.5 mb-4">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            <AiOutlinePhone size={14} className="text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-600">Contact</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 truncate max-w-32">
                            {member.phoneNumber || 'Not provided'}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            <AiOutlineGlobal size={14} className="text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-600">District</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 truncate max-w-32">
                            {member.districtName}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            <AiOutlineFlag size={14} className="text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-600">Tribute</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 truncate max-w-32">
                            {member.tributeName}
                        </span>
                    </div>

                    {/* Statut professionnel */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                            {statusBadge.icon}
                            <span className="text-[10px] font-medium text-gray-600">Status</span>
                        </div>
                        <span className={`text-[10px] font-black ${statusBadge.lightColor} px-2 py-0.5 rounded-full`}>
                            {statusBadge.label}
                        </span>
                    </div>

                    {/* Nombre d'enfants */}
                    {member.childrenCount > 0 && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-linear-to-r from-orange-50 to-amber-50">
                            <div className="flex items-center gap-2">
                                <AiOutlineStar size={14} className="text-amber-500" />
                                <span className="text-[10px] font-medium text-gray-600">Children</span>
                            </div>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                {member.childrenCount} child{member.childrenCount > 1 ? 'ren' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    {onView && (
                        <button
                            onClick={() => onView(member)}
                            className="relative group/btn p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
                            title="View Details"
                        >
                            <AiOutlineEye size={18} />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black bg-gray-800 text-white px-2 py-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                                Details
                            </span>
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(member)}
                        className="relative group/btn p-2 rounded-xl text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-300"
                        title="Edit"
                    >
                        <AiOutlineEdit size={18} />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black bg-gray-800 text-white px-2 py-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                            Edit
                        </span>
                    </button>
                    <button
                        onClick={() => onDelete(member.id)}
                        className="relative group/btn p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                        title="Delete"
                    >
                        <AiOutlineDelete size={18} />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black bg-gray-800 text-white px-2 py-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                            Delete
                        </span>
                    </button>
                </div>
            </div>

            {/* Effet de bordure au hover */}
            <div className={`absolute inset-x-0 bottom-0 h-1 bg-linear-to-r ${coverColors[isMale ? 'male' : 'female']} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </div>
    );
};

export default MemberCard;