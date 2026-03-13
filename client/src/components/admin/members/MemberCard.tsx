import React from 'react';
import { AiOutlineMan, AiOutlineWoman, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { Gender, PersonResponse } from '../../../lib/types';
import { formatDate } from '../../../lib/helper';

interface MemberCardProps {
    member: PersonResponse;
    onEdit: (member: PersonResponse) => void;
    onDelete: (id: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6 hover:border-brand-primary transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    member.gender === Gender.MALE ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                }`}>
                    {member.gender === Gender.MALE ? <AiOutlineMan /> : <AiOutlineWoman />}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onEdit(member)} 
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-primary"
                    >
                        <AiOutlineEdit size={20} />
                    </button>
                    <button 
                        onClick={() => onDelete(member.id)} 
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                    >
                        <AiOutlineDelete size={20} />
                    </button>
                </div>
            </div>
            
            <h3 className="font-bold text-lg uppercase">
                {member.lastName} <span className="text-brand-primary">{member.firstName}</span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">{member.phoneNumber}</p>
            
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase">
                    {member.status}
                </span>
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">
                    {formatDate(member.birthDate)}
                </span>
            </div>
        </div>
    );
};

export default MemberCard;
