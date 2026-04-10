import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    AiOutlineClose,
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
import { formatDate, calculateAge, formatCurrency } from '../../../lib/helper';
import { useFinance } from '../../../hooks/useFinance';
import { useMembers } from '../../../hooks/useMembers';
import Avatar from '../../../components/ui/Avatar';

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
    const [isAnimating, setIsAnimating] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { contributions } = useFinance(member?.id);
    const { members } = useMembers();

    const memberContributions = contributions.filter(c => c.memberId === member?.id);
    const parentMember = member?.parentId ? members.find(m => m.id === member.parentId) : null;

    if (!isOpen || !member) return null;

    const isMale = member.gender === Gender.MALE;
    const age = calculateAge(member.birthDate);
    const hasChildren = member.children && member.children.length > 0;
    const hasPaymentHistory = memberContributions.length > 0;

    const isFullyPaid = (contribution: any) => {
        return contribution.totalPaid >= contribution.amount;
    };

    const getContributionStatusColor = (status: string, contribution?: any) => {
        if (contribution && isFullyPaid(contribution)) {
            return 'bg-green-100 text-green-700';
        }
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700';
            case 'PARTIAL': return 'bg-orange-100 text-orange-700';
            case 'PENDING': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getContributionStatusLabel = (status: string, contribution?: any) => {
        if (contribution && isFullyPaid(contribution)) {
            return 'Payé ✓';
        }
        switch (status) {
            case 'PAID': return 'Payé ✓';
            case 'PARTIAL': return 'Partiel';
            case 'PENDING': return 'En attente';
            default: return status;
        }
    };

    const getTotalPaidColor = (contribution: any) => {
        return isFullyPaid(contribution) ? 'text-green-600' : 'text-[#E51A1A]';
    };

    const formatMemberId = (id: string) => {
        if (id && !id.startsWith('MBR')) {
            return `MBR${id}`;
        }
        return id;
    };

    const handleTabChange = (tab: 'info' | 'payments' | 'family') => {
        if (tab === activeTab || isAnimating) return;

        setIsAnimating(true);
        setTimeout(() => {
            setActiveTab(tab);
            setTimeout(() => {
                setIsAnimating(false);
            }, 150);
        }, 150);
    };

    const renderContent = () => {
        const baseClasses = "transition-all duration-300 transform";
        const animationClasses = isAnimating
            ? "opacity-0 scale-95 -translate-y-2"
            : "opacity-100 scale-100 translate-y-0";

        return (
            <div className={`${baseClasses} ${animationClasses}`}>
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                            <Avatar
                                imageUrl={member.imageUrl}
                                firstName={member.firstName}
                                lastName={member.lastName}
                                gender={member.gender}
                                category="member"
                                size="xl"
                                shape="rounded"
                                className="shadow-sm"
                            />
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${member.status === MemberStatus.WORKER
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {member.status === MemberStatus.WORKER ? 'Travailleur' : 'Étudiant'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${member.isActiveMember
                                            ? 'bg-[#E51A1A]/10 text-[#E51A1A]'
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

                        {member.parentName && member.parentId && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Parent</h4>
                                <div
                                    onClick={() => onViewParent?.(member.parentId!)}
                                    className="flex items-center justify-between cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            imageUrl={parentMember?.imageUrl}
                                            firstName={member.parentName?.split(' ')[0]}
                                            lastName={member.parentName?.split(' ')[1]}
                                            gender={parentMember?.gender}
                                            category="member"
                                            size="sm"
                                            shape="rounded"
                                        />
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

                {activeTab === 'payments' && (
                    <div>
                        {memberContributions.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <AiOutlineDollar size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-400 font-medium">Aucune contribution enregistrée</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {memberContributions.map((contribution) => {
                                    const fullyPaid = isFullyPaid(contribution);
                                    return (
                                        <div key={contribution.id} className={`border rounded-lg overflow-hidden transition-all ${fullyPaid ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                                            <div className={`px-4 py-2 flex items-center justify-between border-b ${fullyPaid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <span className="font-bold text-sm">Année {contribution.year}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getContributionStatusColor(contribution.status, contribution)}`}>
                                                    {getContributionStatusLabel(contribution.status, contribution)}
                                                </span>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Montant total</span>
                                                    <span className="font-bold">{formatCurrency(contribution.amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Total payé</span>
                                                    <span className={`font-bold ${getTotalPaidColor(contribution)}`}>
                                                        {formatCurrency(contribution.totalPaid)}
                                                    </span>
                                                </div>

                                                {contribution.payments && contribution.payments.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Historique des paiements</p>
                                                        <div className="space-y-2">
                                                            {contribution.payments.map((payment) => (
                                                                <div key={payment.id} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-500">{formatDate(payment.paymentDate)}</span>
                                                                    <span className={`font-medium ${fullyPaid ? 'text-green-600' : 'text-[#E51A1A]'}`}>
                                                                        {formatCurrency(payment.amountPaid)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'family' && (
                    <div>
                        {member.parentName && member.parentId && (
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Parent</h4>
                                <div
                                    onClick={() => onViewParent?.(member.parentId!)}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            imageUrl={parentMember?.imageUrl}
                                            firstName={member.parentName?.split(' ')[0]}
                                            lastName={member.parentName?.split(' ')[1]}
                                            gender={parentMember?.gender}
                                            category="member"
                                            size="sm"
                                            shape="rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{member.parentName}</p>
                                            <p className="text-[10px] text-gray-400">{formatMemberId(member.parentId)}</p>
                                        </div>
                                    </div>
                                    <AiOutlineArrowRight size={14} className="text-gray-400" />
                                </div>
                            </div>
                        )}

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
                                    {member.children?.map((child) => (
                                        <div
                                            key={child.id}
                                            onClick={() => onViewChild?.(child)}
                                            className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <Avatar
                                                imageUrl={child.imageUrl}
                                                firstName={child.firstName}
                                                lastName={child.lastName}
                                                gender={child.gender}
                                                category="member"
                                                size="sm"
                                                shape="rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                                                <p className="text-[10px] text-gray-400">{formatMemberId(child.id)}</p>
                                            </div>
                                            <AiOutlineArrowRight size={12} className="text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={scrollContainerRef}
                className="bg-white rounded-xl w-full max-w-3xl h-150 overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300"
            >
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Avatar
                            imageUrl={member.imageUrl}
                            firstName={member.firstName}
                            lastName={member.lastName}
                            gender={member.gender}
                            category="member"
                            size="md"
                            shape="rounded"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                {member.lastName} {member.firstName}
                            </h2>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                Membre depuis {formatDate(member.createdAt || new Date().toISOString())}
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

                <div className="border-b border-gray-200 px-6 shrink-0">
                    <div className="flex gap-6">
                        <button
                            onClick={() => handleTabChange('info')}
                            className={`relative py-3 text-sm font-medium transition-colors duration-200 ${activeTab === 'info'
                                    ? 'text-[#E51A1A]'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Informations
                            {activeTab === 'info' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E51A1A] animate-in slide-in-from-left duration-200" />
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('payments')}
                            className={`relative py-3 text-sm font-medium transition-colors duration-200 ${activeTab === 'payments'
                                    ? 'text-[#E51A1A]'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Paiements
                            {hasPaymentHistory && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded-full">
                                    {memberContributions.length}
                                </span>
                            )}
                            {activeTab === 'payments' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E51A1A] animate-in slide-in-from-left duration-200" />
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('family')}
                            className={`relative py-3 text-sm font-medium transition-colors duration-200 ${activeTab === 'family'
                                    ? 'text-[#E51A1A]'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Famille
                            {member.childrenCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded-full">
                                    {member.childrenCount}
                                </span>
                            )}
                            {activeTab === 'family' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E51A1A] animate-in slide-in-from-left duration-200" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-center gap-4 shrink-0">
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