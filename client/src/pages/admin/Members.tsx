import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    AiOutlineTeam,
    AiOutlinePlus,
    AiOutlineSearch,
    AiOutlineFilter,
    AiOutlineClose
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useLocations } from '../../hooks/useLocations';
import { MemberStatus, PersonResponse } from '../../lib/types';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberForm from '../../components/admin/members/MemberForm';
import MemberDetailModal from '../../components/admin/members/MemberDetailModal';

const AdminMembers: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState<MemberStatus | 'ALL'>('ALL');
    const [districtFilter, setDistrictFilter] = useState<string>('ALL');
    const [tributeFilter, setTributeFilter] = useState<string>('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<PersonResponse | null>(null);
    const [viewingMember, setViewingMember] = useState<PersonResponse | null>(null);
    const [selectedParentForChild, setSelectedParentForChild] = useState<PersonResponse | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtersRef = useRef<HTMLDivElement>(null);
    const [isFiltersSticky, setIsFiltersSticky] = useState(false);

    const { members, isLoading, deleteMember } = useMembers();
    const { districts, tributes } = useLocations();

    useEffect(() => {
        const handleScroll = () => {
            if (filtersRef.current) {
                const rect = filtersRef.current.getBoundingClientRect();
                setIsFiltersSticky(rect.top <= 80);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingMember(null);
        setSelectedParentForChild(null);
    };

    const handleEdit = (member: PersonResponse) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleView = (member: PersonResponse) => {
        setViewingMember(member);
    };

    const handleViewChild = (child: PersonResponse) => {
        setViewingMember(child);
    };

    const handleViewParent = (parentId: string) => {
        const parent = members.find(m => m.id === parentId);
        if (parent) {
            setViewingMember(parent);
        }
    };

    const handleAddMember = () => {
        setEditingMember(null);
        setSelectedParentForChild(null);
        setIsFormOpen(true);
    };

    const handleAddChild = (parent: PersonResponse) => {
        setSelectedParentForChild(parent);
        setEditingMember(null);
        setIsFormOpen(true);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setDistrictFilter('ALL');
        setTributeFilter('ALL');
    };

    const hasActiveFilters = statusFilter !== 'ALL' || districtFilter !== 'ALL' || tributeFilter !== 'ALL' || searchQuery !== '';

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                member.id.toLowerCase().includes(searchLower) ||
                member.firstName.toLowerCase().includes(searchLower) ||
                member.lastName.toLowerCase().includes(searchLower) ||
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
            const matchesDistrict = districtFilter === 'ALL' || member.districtId.toString() === districtFilter;
            const matchesTribute = tributeFilter === 'ALL' || member.tributeId.toString() === tributeFilter;

            return matchesSearch && matchesStatus && matchesDistrict && matchesTribute;
        });
    }, [members, searchQuery, statusFilter, districtFilter, tributeFilter]);

    const statusOptions = [
        { value: 'ALL', label: 'Tous les statuts' },
        { value: MemberStatus.STUDENT, label: 'Étudiants' },
        { value: MemberStatus.WORKER, label: 'Travailleurs' },
    ];

    const districtOptions = [
        { value: 'ALL', label: 'Tous les districts' },
        ...districts.map(d => ({ value: d.id?.toString() || '', label: d.name }))
    ];

    const tributeOptions = [
        { value: 'ALL', label: 'Toutes les tribus' },
        ...tributes.map(t => ({ value: t.id?.toString() || '', label: t.name }))
    ];

    const getSelectValue = (val: string | React.ChangeEvent<HTMLSelectElement>): string => {
        if (typeof val === 'string') return val;
        return val.target?.value || '';
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-black text-gray-500 uppercase text-xs sm:text-sm">Chargement des membres...</p>
            </div>
        </div>
    );

    return (
        <div className="relative px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            {/* Header avec titre et bouton NOUVEAU MEMBRE - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6">
                <div>
                    <h1 className={`${THEME.font.h1} text-xl sm:text-2xl md:text-3xl flex items-center gap-2 sm:gap-3 uppercase`}>
                        <AiOutlineTeam className="text-brand-primary text-xl sm:text-2xl" />
                        Gestion des membres
                    </h1>
                    <p className="text-gray-500 mt-1 text-[10px] sm:text-xs uppercase">
                        {filteredMembers.length} / {members.length} membres affichés
                    </p>
                </div>
                <Button onClick={handleAddMember} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm w-full sm:w-auto justify-center">
                    <AiOutlinePlus size={16} className="sm:w-4 sm:h-4" />
                    <span className="font-black">NOUVEAU MEMBRE</span>
                </Button>
            </div>

            {/* Barre de recherche et filtres - Responsive avec sticky */}
            <div
                ref={filtersRef}
                className={`sticky top-0 z-30 transition-all duration-300 mb-5 sm:mb-6 ${isFiltersSticky
                        ? 'bg-brand-bg/95 backdrop-blur-md shadow-lg py-2 -mt-2'
                        : 'bg-transparent py-0'
                    }`}
            >
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-3 sm:p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Search Input - Pleine largeur sur mobile */}
                        <div className="flex-1 relative">
                            <AiOutlineSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher par ID, prénom ou nom..."
                                className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-xs sm:text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <AiOutlineClose size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggle Button - Responsive */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`
                                flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all whitespace-nowrap
                                ${showFilters
                                    ? 'bg-brand-primary text-white border-brand-primary'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
                                }
                            `}
                        >
                            <AiOutlineFilter size={16} />
                            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">Filtres</span>
                            {hasActiveFilters && !showFilters && (
                                <span className="ml-1 w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                            )}
                        </button>
                    </div>

                    {/* Expanded Filters - Responsive grid */}
                    {showFilters && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <Select
                                    label="Statut"
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={(val) => {
                                        const value = getSelectValue(val);
                                        setStatusFilter(value as MemberStatus | 'ALL');
                                    }}
                                    containerClassName="w-full"
                                />
                                <Select
                                    label="District"
                                    options={districtOptions}
                                    value={districtFilter}
                                    onChange={(val) => {
                                        const value = getSelectValue(val);
                                        setDistrictFilter(value);
                                    }}
                                    containerClassName="w-full"
                                />
                                <Select
                                    label="Tribu"
                                    options={tributeOptions}
                                    value={tributeFilter}
                                    onChange={(val) => {
                                        const value = getSelectValue(val);
                                        setTributeFilter(value);
                                    }}
                                    containerClassName="w-full"
                                />
                            </div>

                            {/* Active Filters Display - Responsive wrap */}
                            {hasActiveFilters && (
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                Filtres actifs :
                                            </span>
                                            {searchQuery && (
                                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
                                                    Recherche : {searchQuery}
                                                </span>
                                            )}
                                            {statusFilter !== 'ALL' && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
                                                    {statusFilter === MemberStatus.STUDENT ? 'Étudiant' : 'Travailleur'}
                                                </span>
                                            )}
                                            {districtFilter !== 'ALL' && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
                                                    District : {districts.find(d => d.id?.toString() === districtFilter)?.name}
                                                </span>
                                            )}
                                            {tributeFilter !== 'ALL' && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
                                                    Tribu : {tributes.find(t => t.id?.toString() === tributeFilter)?.name}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-[9px] sm:text-[10px] font-black uppercase text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Effacer tous les filtres
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count - Responsive */}
            <div className="mb-3 sm:mb-4 flex justify-between items-center">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {filteredMembers.length} membre(s) trouvé(s)
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-[9px] sm:text-[10px] font-black uppercase text-brand-primary hover:underline"
                    >
                        Réinitialiser tous les filtres
                    </button>
                )}
            </div>

            {/* Members Grid - Responsive avec grid adaptative */}
            {filteredMembers.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
                    <AiOutlineTeam size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <p className="font-black text-gray-400 uppercase text-xs sm:text-sm">Aucun membre trouvé</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Essayez d'ajuster votre recherche ou vos filtres
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-black text-brand-primary hover:underline"
                        >
                            Effacer tous les filtres
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredMembers.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onEdit={handleEdit}
                            onDelete={(id) => setDeleteId(id)}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}

            {/* Member Form Modal */}
            <MemberForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                memberToEdit={editingMember}
                parentId={selectedParentForChild?.id}
            />

            {/* Member Detail Modal */}
            <MemberDetailModal
                isOpen={!!viewingMember}
                onClose={() => setViewingMember(null)}
                member={viewingMember}
                onEdit={() => {
                    if (viewingMember) {
                        const memberToEdit = viewingMember;
                        setViewingMember(null);
                        handleEdit(memberToEdit);
                    }
                }}
                onDelete={() => {
                    if (viewingMember) {
                        setDeleteId(viewingMember.id);
                        setViewingMember(null);
                    }
                }}
                onAddChild={() => {
                    if (viewingMember) {
                        handleAddChild(viewingMember);
                        setViewingMember(null);
                    }
                }}
                onViewChild={handleViewChild}
                onViewParent={handleViewParent}
            />

            {/* Delete Confirmation Alert */}
            <Alert
                isOpen={!!deleteId}
                title="Supprimer le membre"
                message="Cette action est irréversible. Toutes les données liées à ce membre seront définitivement supprimées."
                confirmText="OUI, SUPPRIMER"
                onClose={() => setDeleteId(null)}
                onConfirm={async () => {
                    if (deleteId) {
                        await deleteMember.mutateAsync(deleteId);
                        setDeleteId(null);
                    }
                }}
            />
        </div>
    );
};

export default AdminMembers;