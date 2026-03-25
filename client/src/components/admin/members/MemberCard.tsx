import React from 'react';
import { AiOutlinePhone, AiOutlineGlobal, AiOutlineFlag, AiOutlineEdit, AiOutlineDelete, AiOutlineEye } from 'react-icons/ai';
import { PersonResponse } from '../../../lib/types';
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

    const getStatusColor = () => {
        if (member.isActiveMember) {
            return 'bg-green-100 text-green-700 border-green-200';
        }
        return 'bg-orange-100 text-orange-700 border-orange-200';
    };

    const getStatusLabel = () => {
        if (member.isActiveMember) return 'Active';
        return 'Inactive';
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Header with Image */}
            <div className="relative h-28 bg-linear-to-r from-brand-primary/20 to-orange-500/20">
                <div className="absolute -bottom-8 left-4">
                    <div className="w-16 h-16 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={member.firstName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                                    (e.target as HTMLImageElement).parentElement!.classList.add('text-lg', 'font-black', 'text-brand-primary');
                                }}
                            />
                        ) : (
                            <span className="text-lg font-black text-brand-primary">
                                {getInitials(member.firstName, member.lastName)}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${getStatusColor()}`}>
                        {getStatusLabel()}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="pt-10 p-4">
                {/* Name and ID */}
                <div className="mb-3">
                    <h3 className="font-black text-sm uppercase tracking-tight truncate">
                        {member.lastName} <span className="text-brand-primary">{member.firstName}</span>
                    </h3>
                    <p className="text-[9px] font-mono text-gray-400 mt-0.5">
                        ID: {member.id}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <AiOutlinePhone size={12} className="text-gray-400 shrink-0" />
                        <span className="text-[10px] font-medium truncate">{member.phoneNumber || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <AiOutlineGlobal size={12} className="text-gray-400 shrink-0" />
                        <span className="text-[10px] font-medium truncate">{member.districtName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <AiOutlineFlag size={12} className="text-gray-400 shrink-0" />
                        <span className="text-[10px] font-medium truncate">{member.tributeName}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
                    {onView && (
                        <button
                            onClick={() => onView(member)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            title="View Details"
                        >
                            <AiOutlineEye size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(member)}
                        className="p-2 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all"
                        title="Edit"
                    >
                        <AiOutlineEdit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(member.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete"
                    >
                        <AiOutlineDelete size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberCard;