import React from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineCalendar,
    AiOutlinePhone,
    AiOutlineGlobal,
    AiOutlineTeam,
    AiOutlineEdit,
} from 'react-icons/ai';
import { PersonResponse } from '../../../lib/types';
import { calculateAge, formatDate, getInitials } from '../../../lib/helper';
import Button from '../../ui/Button';
import ActionBtn from '../../ui/ActionBtn';

interface MemberDetailModalProps {
    member: PersonResponse;
    onClose: () => void;
    onEdit?: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose, onEdit }) => {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] border-2 border-b-8 border-gray-200 overflow-hidden shadow-2xl">
                <div className="relative h-32 bg-gradient-to-r from-brand-primary to-orange-500">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors z-10"
                    >
                        <AiOutlineClose size={20} />
                    </button>
                    <div className="absolute -bottom-12 left-8">
                        {member.imageUrl ? (
                            <img
                                src={member.imageUrl}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-24 h-24 rounded-4xl border-4 border-white shadow-xl object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-white rounded-4xl border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-brand-primary uppercase">
                                {getInitials(member.firstName, member.lastName)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-8 pt-16">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">
                                {member.firstName} {member.lastName}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black ${
                                    member.isActiveMember
                                        ? "bg-green-100 text-green-600"
                                        : "bg-orange-100 text-orange-600"
                                }`}>
                                    {member.isActiveMember ? "ACTIF" : "INACTIF"}
                                </span>
                                <span className="text-gray-300">•</span>
                                <p className="text-[10px] font-bold text-gray-400">N° {member.sequenceNumber}</p>
                            </div>
                        </div>
                        
                        {onEdit && (
                            <ActionBtn
                                icon={<AiOutlineEdit />}
                                title="Modifier"
                                variant="edit"
                                onClick={onEdit}
                            />
                        )}
                    </div>

                    {/* Grille d'informations */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <DetailBox 
                            label="Âge" 
                            value={`${calculateAge(member.birthDate)} ans`} 
                            icon={<AiOutlineCalendar />} 
                        />
                        <DetailBox 
                            label="Contact" 
                            value={member.phoneNumber || 'Non renseigné'} 
                            icon={<AiOutlinePhone />} 
                        />
                        <DetailBox 
                            label="District" 
                            value={member.districtName} 
                            icon={<AiOutlineGlobal />} 
                        />
                        <DetailBox 
                            label="Tribu" 
                            value={member.tributeName} 
                            icon={<AiOutlineTeam />} 
                        />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="bg-gray-50 p-4 rounded-3xl border-2 border-gray-100 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[8px] font-black text-gray-400 uppercase">Statut professionnel</span>
                            <span className="font-black text-xs">
                                {member.status === 'WORKER' ? 'Travailleur' : 'Étudiant'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[8px] font-black text-gray-400 uppercase">Enfants</span>
                            <span className="font-black text-xs">{member.childrenCount || 0}</span>
                        </div>
                        {member.parentName && (
                            <div className="flex justify-between">
                                <span className="text-[8px] font-black text-gray-400 uppercase">Parent</span>
                                <span className="font-black text-xs">{member.parentName}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-[8px] font-black text-gray-400 uppercase">Date d'inscription</span>
                            <span className="font-black text-xs">
                                {member.createdAt ? formatDate(member.createdAt) : 'Non disponible'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button variant="secondary" onClick={onClose} className="w-full">
                            FERMER
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const DetailBox = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 flex items-center gap-3">
        <div className="text-brand-primary opacity-60">{icon}</div>
        <div>
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="font-black text-[11px] uppercase text-gray-800 truncate">{value}</p>
        </div>
    </div>
);

export default MemberDetailModal;