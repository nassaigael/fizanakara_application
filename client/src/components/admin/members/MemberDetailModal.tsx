import React, { useState, useRef, useEffect } from 'react';
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
    AiOutlineMan,
    AiOutlineClockCircle,
    AiOutlineGlobal,
    AiOutlineDollar,
    AiOutlineHistory} from 'react-icons/ai';
import { PersonResponse, MemberStatus, Gender } from '../../../lib/types';
import { formatDate, calculateAge, getInitials, formatCurrency } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';
import Button from '../../ui/Button';
import { useFinance } from '../../../hooks/useFinance';

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
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [isHistorySticky, setIsHistorySticky] = useState(false);
    const historySectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const { contributions } = useFinance(member?.id);
    
    // Filtrer les contributions du membre
    const memberContributions = contributions.filter(c => c.memberId === member?.id);

    // Gérer le sticky de la section historique
    useEffect(() => {
        const handleScroll = () => {
            if (historySectionRef.current && scrollContainerRef.current) {
                const rect = historySectionRef.current.getBoundingClientRect();
                const containerRect = scrollContainerRef.current.getBoundingClientRect();
                // Si la section atteint le haut du conteneur
                setIsHistorySticky(rect.top <= containerRect.top + 60);
            }
        };

        const scrollElement = scrollContainerRef.current;
        if (scrollElement && showPaymentHistory) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [showPaymentHistory]);

    if (!isOpen || !member) return null;

    const isMale = member.gender === Gender.MALE;
    const genderIcon = isMale ? <AiOutlineMan size={20} /> : <AiOutlineWoman size={20} />;
    const genderColor = isMale ? 'from-blue-600 via-blue-500 to-cyan-400' : 'from-pink-600 via-pink-500 to-rose-400';

    const getStatusBadge = () => {
        if (member.status === MemberStatus.WORKER) {
            return {
                label: 'Worker',
                bg: 'bg-purple-100 text-purple-700',
                icon: <AiOutlineCrown size={12} />
            };
        }
        return {
            label: 'Student',
            bg: 'bg-amber-100 text-amber-700',
            icon: <AiOutlineStar size={12} />
        };
    };

    const getMembershipBadge = () => {
        if (member.isActiveMember) {
            return {
                label: 'Active',
                bg: 'bg-green-100 text-green-700',
                icon: <AiOutlineCheckCircle size={12} />
            };
        }
        return {
            label: 'Inactive',
            bg: 'bg-gray-100 text-gray-600',
            icon: <AiOutlineCloseCircle size={12} />
        };
    };

    const statusBadge = getStatusBadge();
    const membershipBadge = getMembershipBadge();
    const age = calculateAge(member.birthDate);
    const hasImage = member.imageUrl && member.imageUrl.trim() !== '';
    const avatarUrl = hasImage ? getImageUrl(member.imageUrl, 'member') : null;
    const hasChildren = member.children && member.children.length > 0;
    const hasPaymentHistory = memberContributions.length > 0;

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
            case 'PAID': return 'Paid';
            case 'PARTIAL': return 'Partial';
            case 'PENDING': return 'Pending';
            default: return status;
        }
    };

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
            <div 
                ref={scrollContainerRef}
                className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-4 border-white flex flex-col animate-in zoom-in duration-300"
            >
                {/* Header avec cover photo */}
                <div className={`relative h-32 bg-linear-to-r ${genderColor} overflow-hidden shrink-0`}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    </div>
                    
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider backdrop-blur-sm bg-white/90 shadow-sm flex items-center gap-1 ${statusBadge.bg}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider backdrop-blur-sm bg-white/90 shadow-sm flex items-center gap-1 ${membershipBadge.bg}`}>
                            {membershipBadge.icon}
                            {membershipBadge.label}
                        </div>
                    </div>
                    
                    <div className="absolute bottom-2 left-3 flex items-center gap-1 ml-1 px-1 py-1 rounded-full bg-white/90 opacity-70 backdrop-blur-sm shadow-sm z-10">
                        <span className={isMale ? 'text-blue-600' : 'text-pink-600'}>{genderIcon}</span>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="absolute top-3 left-3 z-10 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm hover:scale-110"
                    >
                        <AiOutlineClose size={16} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="relative px-4">
                    <div className="absolute -top-10 left-4">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={member.firstName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                                            (e.target as HTMLImageElement).parentElement!.classList.add('text-2xl', 'font-black', isMale ? 'text-blue-500' : 'text-pink-500');
                                        }}
                                    />
                                ) : (
                                    <span className={`text-2xl font-black ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
                                        {getInitials(member.firstName, member.lastName)}
                                    </span>
                                )}
                            </div>
                            <div className={`absolute -inset-1 rounded-2xl bg-linear-to-r ${genderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`} />
                        </div>
                    </div>
                </div>

                {/* Content avec scroll */}
                <div className="flex-1 overflow-y-auto p-6 pt-12">
                    {/* En-tête avec nom et infos */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                                    {member.lastName}{' '}
                                    <span className="text-brand-primary">{member.firstName}</span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-mono bg-gray-100 px-2 py-1 rounded-full">
                                    {member.id}
                                </span>
                                <span className="text-[9px] text-gray-400">•</span>
                                <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                    <AiOutlineClockCircle size={10} />
                                    Since {getMemberSinceDate()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {hasPaymentHistory && (
                                <button
                                    onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                                    className={`p-2 rounded-xl transition-all ${
                                        showPaymentHistory 
                                            ? 'bg-brand-primary text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title="Payment History"
                                >
                                    <AiOutlineHistory size={16} />
                                </button>
                            )}
                            {onAddChild && (
                                <button
                                    onClick={onAddChild}
                                    className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all"
                                    title="Add Child"
                                >
                                    <AiOutlineUserAdd size={16} />
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all"
                                    title="Edit"
                                >
                                    <AiOutlineEdit size={16} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <AiOutlineDelete size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Grille d'informations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <InfoRow
                            icon={<AiOutlineIdcard size={14} />}
                            label="Member ID"
                            value={member.id}
                        />
                        <InfoRow
                            icon={<AiOutlineCalendar size={14} />}
                            label="Age"
                            value={`${age} years (${formatDate(member.birthDate)})`}
                        />
                        <InfoRow
                            icon={<AiOutlinePhone size={14} />}
                            label="Phone"
                            value={member.phoneNumber || 'Not provided'}
                        />
                        <InfoRow
                            icon={<AiOutlineGlobal size={14} />}
                            label="District"
                            value={member.districtName}
                        />
                        <InfoRow
                            icon={<AiOutlineFlag size={14} />}
                            label="Tribute"
                            value={member.tributeName}
                        />
                        <InfoRow
                            icon={<AiOutlineTeam size={14} />}
                            label="Status"
                            value={member.status === MemberStatus.WORKER ? 'Worker' : 'Student'}
                        />
                    </div>

                    {/* Section Parent */}
                    {member.parentName && (
                        <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                            <div className="flex items-center gap-2 mb-2">
                                <AiOutlineUser size={14} className="text-indigo-500" />
                                <h3 className="text-[9px] font-black uppercase tracking-wider text-indigo-600">
                                    Parent
                                </h3>
                            </div>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-200 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                                        {getInitials(member.parentName.split(' ')[0] || '', member.parentName.split(' ')[1] || '')}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase">{member.parentName}</p>
                                        <p className="text-[9px] text-indigo-500">Parent / Guardian</p>
                                    </div>
                                </div>
                                <div className="bg-white px-3 py-1 rounded-lg shadow-sm">
                                    <p className="text-[7px] text-gray-400 uppercase">Relationship</p>
                                    <p className="font-black text-xs text-indigo-600">Child</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Historique des paiements avec sticky */}
                    {showPaymentHistory && (
                        <div 
                            ref={historySectionRef}
                            className={`mb-6 border-t border-gray-100 pt-4 transition-all duration-300 ${
                                isHistorySticky ? 'sticky top-0 z-20 bg-white shadow-md rounded-xl -mx-2 px-2' : ''
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <AiOutlineHistory size={18} className="text-brand-primary" />
                                <h3 className="text-sm font-black uppercase tracking-wider">
                                    Payment History
                                </h3>
                                <span className="text-[9px] text-gray-400 ml-auto">
                                    {memberContributions.length} contribution(s)
                                </span>
                            </div>
                            
                            {memberContributions.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                                    <AiOutlineDollar size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase">No payment history</p>
                                    <p className="text-[9px] text-gray-400 mt-1">No contributions recorded yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                                    {memberContributions.map((contribution) => (
                                        <div key={contribution.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                            {/* En-tête de l'année */}
                                            <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <AiOutlineCalendar size={14} className="text-gray-500" />
                                                    <span className="font-black text-sm">Year {contribution.year}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${getContributionStatusColor(contribution.status)}`}>
                                                    {getContributionStatusLabel(contribution.status)}
                                                </span>
                                            </div>
                                            
                                            {/* Détails de la cotisation */}
                                            <div className="p-3 bg-white">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase">Total Amount</span>
                                                    <span className="font-black text-sm">{formatCurrency(contribution.amount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase">Total Paid</span>
                                                    <span className="font-black text-sm text-green-600">{formatCurrency(contribution.totalPaid)}</span>
                                                </div>
                                                
                                                {/* Liste des paiements */}
                                                {contribution.payments && contribution.payments.length > 0 ? (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Payments</p>
                                                        <div className="space-y-2">
                                                            {contribution.payments.map((payment) => (
                                                                <div key={payment.id} className="flex justify-between items-center py-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <AiOutlineCheckCircle size={10} className="text-green-500" />
                                                                        <span className="text-[10px] text-gray-600">
                                                                            {formatDate(payment.paymentDate)}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-black text-xs">
                                                                        {formatCurrency(payment.amountPaid)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                                                        <p className="text-[8px] text-gray-400 uppercase">No payments recorded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section Enfants */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <AiOutlineTeam size={16} className="text-brand-primary" />
                                <h3 className="text-xs font-black uppercase tracking-wider">
                                    Children ({member.childrenCount || 0})
                                </h3>
                            </div>
                            {onAddChild && (
                                <button
                                    onClick={onAddChild}
                                    className="text-[9px] font-black text-brand-primary hover:underline uppercase"
                                >
                                    + Add
                                </button>
                            )}
                        </div>

                        {!hasChildren ? (
                            <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-200">
                                <AiOutlineUserAdd size={24} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase">No children</p>
                                {onAddChild && (
                                    <button
                                        onClick={onAddChild}
                                        className="mt-2 text-[9px] font-black text-brand-primary hover:underline"
                                    >
                                        + Add a child
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                        <span className="text-[8px] text-gray-400">{child.id.slice(-6)}</span>
                                                        <span className="text-[8px] text-gray-400">•</span>
                                                        <span className="text-[8px] text-amber-600">{childAge} ans</span>
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
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-100 mt-4">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-xs"
                        >
                            Close
                        </Button>
                        {onEdit && (
                            <Button
                                variant="primary"
                                onClick={onEdit}
                                className="flex-1 py-2.5 text-xs"
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

// Composant InfoRow
interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
            <span className="text-gray-400">{icon}</span>
            <span className="text-[9px] font-medium text-gray-600">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-gray-800 truncate max-w-32">
            {value}
        </span>
    </div>
);

export default MemberDetailModal;