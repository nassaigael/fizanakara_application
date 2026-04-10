import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
    AiOutlineUser,
    AiOutlinePhone,
    AiOutlineFlag,
    AiOutlineIdcard,
    AiOutlineCalendar,
    AiOutlineTeam,
    AiOutlineWoman,
    AiOutlineArrowRight,
    AiOutlineUserAdd,
    AiOutlineMan,
    AiOutlineGlobal,
    AiOutlineDollar,
    AiOutlineBook,
    AiOutlineRise
} from 'react-icons/ai';
import { PersonResponse, MemberStatus, Gender } from '../../../lib/types';
import { formatDate, calculateAge, getInitials, formatCurrency } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';
import { useFinance } from '../../../hooks/useFinance';
import { useMembers } from '../../../hooks/useMembers';

interface MemberDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: PersonResponse | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onAddChild?: () => void;
    onViewChild?: (child: PersonResponse) => void;
    onViewParent?: (parentId: string) => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
    isOpen,
    onClose,
    member,
    onEdit,
    onDelete,
    onAddChild,
    onViewChild,
    onViewParent
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'payments' | 'family'>('info');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const { contributions } = useFinance(member?.id);
    const { members } = useMembers();
    
    const memberContributions = contributions.filter(c => c.memberId === member?.id);
    const parentMember = member?.parentId ? members.find(m => m.id === member.parentId) : null;

    if (!isOpen || !member) return null;

    const isMale = member.gender === Gender.MALE;
    const age = calculateAge(member.birthDate);
    const hasImage = member.imageUrl && member.imageUrl.trim() !== '';
    const avatarUrl = hasImage ? getImageUrl(member.imageUrl, 'member') : null;
    const hasChildren = member.children && member.children.length > 0;
    const hasPaymentHistory = memberContributions.length > 0;

    const parentImageUrl = parentMember?.imageUrl ? getImageUrl(parentMember.imageUrl, 'member') : null;

    const getContributionStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'PARTIAL': return 'bg-orange-100 text-orange-700';
            case 'PENDING': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getContributionStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID': return 'Payé';
            case 'PARTIAL': return 'Partiel';
            case 'PENDING': return 'En attente';
            default: return status;
        }
    };

    const formatMemberId = (id: string) => {
        if (id && !id.startsWith('MBR')) {
            return `MBR${id}`;
        }
        return id;
    };

    // Statistiques rapides
    const totalPaid = memberContributions.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
    const totalDue = memberContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const paymentRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                ref={scrollContainerRef}
                className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300"
            >
                {/* Header style Odoo - Barre d'outils */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E51A1A]/10 flex items-center justify-center">
                            <AiOutlineUser size={20} className="text-[#E51A1A]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                {member.lastName} {member.firstName}
                            </h2>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {formatMemberId(member.id)} • Membre depuis {formatDate(member.createdAt || new Date().toISOString())}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <AiOutlineClose size={18} />
                    </button>
                </div>

                {/* Navigation par onglets style Odoo */}
                <div className="border-b border-gray-200 px-6 shrink-0">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'info'
                                    ? 'border-[#E51A1A] text-[#E51A1A]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Informations
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'payments'
                                    ? 'border-[#E51A1A] text-[#E51A1A]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Paiements
                            {hasPaymentHistory && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded-full">
                                    {memberContributions.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('family')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'family'
                                    ? 'border-[#E51A1A] text-[#E51A1A]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Famille
                            {member.childrenCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded-full">
                                    {member.childrenCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Vue Informations */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            {/* En-tête avec photo et statut */}
                            <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={member.firstName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className={`text-3xl font-black ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
                                            {getInitials(member.firstName, member.lastName)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${
                                            member.status === MemberStatus.WORKER 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {member.status === MemberStatus.WORKER ? 'Travailleur' : 'Étudiant'}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${
                                            member.isActiveMember
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {member.isActiveMember ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs">
                                        <AiOutlineCalendar size={12} className="inline mr-1" />
                                        Né(e) le {formatDate(member.birthDate)} • {age} ans
                                    </p>
                                </div>
                            </div>

                            {/* Grille d'informations style Odoo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoField label="ID Membre" value={formatMemberId(member.id)} icon={<AiOutlineIdcard size={14} />} />
                                <InfoField label="Genre" value={isMale ? 'Homme' : 'Femme'} icon={isMale ? <AiOutlineMan size={14} /> : <AiOutlineWoman size={14} />} />
                                <InfoField label="Téléphone" value={member.phoneNumber || 'Non fourni'} icon={<AiOutlinePhone size={14} />} />
                                <InfoField label="District" value={member.districtName} icon={<AiOutlineGlobal size={14} />} />
                                <InfoField label="Tribu" value={member.tributeName} icon={<AiOutlineFlag size={14} />} />
                                <InfoField 
                                    label="Statut" 
                                    value={member.status === MemberStatus.WORKER ? 'Travailleur' : 'Étudiant'} 
                                    icon={member.status === MemberStatus.WORKER ? <AiOutlineRise size={14} /> : <AiOutlineBook size={14} />} 
                                />
                                <InfoField label="Enfants" value={`${member.childrenCount || 0} enfant(s)`} icon={<AiOutlineTeam size={14} />} />
                            </div>

                            {/* Section Parent */}
                            {member.parentName && member.parentId && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Parent</h4>
                                    <div 
                                        onClick={() => onViewParent?.(member.parentId!)}
                                        className="flex items-center justify-between cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                                                {parentImageUrl ? (
                                                    <img src={parentImageUrl} alt="Parent" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {getInitials(member.parentName.split(' ')[0] || '', member.parentName.split(' ')[1] || '')}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{member.parentName}</p>
                                                <p className="text-[10px] text-gray-400">{formatMemberId(member.parentId)}</p>
                                            </div>
                                        </div>
                                        <AiOutlineArrowRight size={14} className="text-gray-400" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vue Paiements */}
                    {activeTab === 'payments' && (
                        <div>
                            {/* Résumé des paiements */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-[10px] text-blue-600 uppercase font-bold">Total dû</p>
                                    <p className="text-xl font-bold text-blue-700">{formatCurrency(totalDue)}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-[10px] text-green-600 uppercase font-bold">Total payé</p>
                                    <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <p className="text-[10px] text-orange-600 uppercase font-bold">Taux</p>
                                    <p className="text-xl font-bold text-orange-700">{paymentRate.toFixed(1)}%</p>
                                </div>
                            </div>

                            {memberContributions.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <AiOutlineDollar size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-400 font-medium">Aucune contribution enregistrée</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {memberContributions.map((contribution) => (
                                        <div key={contribution.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                                                <span className="font-bold text-sm">Année {contribution.year}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getContributionStatusColor(contribution.status)}`}>
                                                    {getContributionStatusLabel(contribution.status)}
                                                </span>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Montant total</span>
                                                    <span className="font-bold">{formatCurrency(contribution.amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Total payé</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(contribution.totalPaid)}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 rounded-full h-2 transition-all"
                                                        style={{ width: `${(contribution.totalPaid / contribution.amount) * 100}%` }}
                                                    />
                                                </div>
                                                {contribution.payments && contribution.payments.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Historique des paiements</p>
                                                        <div className="space-y-2">
                                                            {contribution.payments.map((payment) => (
                                                                <div key={payment.id} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-500">{formatDate(payment.paymentDate)}</span>
                                                                    <span className="font-medium">{formatCurrency(payment.amountPaid)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vue Famille */}
                    {activeTab === 'family' && (
                        <div>
                            {/* Parent */}
                            {member.parentName && member.parentId && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Parent</h4>
                                    <div 
                                        onClick={() => onViewParent?.(member.parentId!)}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                {parentImageUrl ? (
                                                    <img src={parentImageUrl} alt="Parent" className="w-full h-full object-cover" />
                                                ) : (
                                                    <AiOutlineUser size={20} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.parentName}</p>
                                                <p className="text-[10px] text-gray-400">{formatMemberId(member.parentId)}</p>
                                            </div>
                                        </div>
                                        <AiOutlineArrowRight size={14} className="text-gray-400" />
                                    </div>
                                </div>
                            )}

                            {/* Enfants */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enfants</h4>
                                    {onAddChild && (
                                        <button
                                            onClick={onAddChild}
                                            className="text-[10px] font-bold text-[#E51A1A] hover:underline"
                                        >
                                            + Ajouter
                                        </button>
                                    )}
                                </div>
                                {!hasChildren ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <AiOutlineUserAdd size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-400 text-sm">Aucun enfant enregistré</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {member.children?.map((child) => {
                                            const childIsMale = child.gender === Gender.MALE;
                                            const childAvatarUrl = child.imageUrl ? getImageUrl(child.imageUrl, 'member') : null;
                                            
                                            return (
                                                <div
                                                    key={child.id}
                                                    onClick={() => onViewChild?.(child)}
                                                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        {childAvatarUrl ? (
                                                            <img src={childAvatarUrl} alt={child.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className={`text-sm font-bold ${childIsMale ? 'text-blue-500' : 'text-pink-500'}`}>
                                                                {getInitials(child.firstName, child.lastName)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                                                        <p className="text-[10px] text-gray-400">{formatMemberId(child.id)}</p>
                                                    </div>
                                                    <AiOutlineArrowRight size={12} className="text-gray-400" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer avec actions style Odoo */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shrink-0">
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Supprimer
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Fermer
                    </button>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 text-sm font-medium bg-[#E51A1A] text-white rounded-lg hover:bg-[#C41515] transition-colors"
                        >
                            Modifier
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// Composant InfoField style Odoo
interface InfoFieldProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
);

export default MemberDetailModal;