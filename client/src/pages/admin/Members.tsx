import React, { useState, useMemo } from 'react';
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

    const { members, isLoading, deleteMember } = useMembers();
    const { districts, tributes } = useLocations();

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
            // Recherche par ID, nom ou prénom
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = 
                member.id.toLowerCase().includes(searchLower) ||
                member.firstName.toLowerCase().includes(searchLower) ||
                member.lastName.toLowerCase().includes(searchLower) ||
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower);

            // Filtre par status
            const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;

            // Filtre par district
            const matchesDistrict = districtFilter === 'ALL' || member.districtId.toString() === districtFilter;

            // Filtre par tribute
            const matchesTribute = tributeFilter === 'ALL' || member.tributeId.toString() === tributeFilter;

            return matchesSearch && matchesStatus && matchesDistrict && matchesTribute;
        });
    }, [members, searchQuery, statusFilter, districtFilter, tributeFilter]);

    // Options pour les selects
    const statusOptions = [
        { value: 'ALL', label: 'All Statuses' },
        { value: MemberStatus.STUDENT, label: 'Students' },
        { value: MemberStatus.WORKER, label: 'Workers' },
    ];

    const districtOptions = [
        { value: 'ALL', label: 'All Districts' },
        ...districts.map(d => ({ value: d.id?.toString() || '', label: d.name }))
    ];

    const tributeOptions = [
        { value: 'ALL', label: 'All Tributes' },
        ...tributes.map(t => ({ value: t.id?.toString() || '', label: t.name }))
    ];

    // Fonction utilitaire pour extraire la valeur du select
    const getSelectValue = (val: string | React.ChangeEvent<HTMLSelectElement>): string => {
        if (typeof val === 'string') return val;
        return val.target?.value || '';
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-black text-gray-500 uppercase">Loading members...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className={`${THEME.font.h1} flex items-center gap-3 uppercase`}>
                        <AiOutlineTeam className="text-brand-primary" />
                        Member Management
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase">
                        {filteredMembers.length} / {members.length} members displayed
                    </p>
                </div>
                <Button onClick={handleAddMember} className="flex items-center gap-2">
                    <AiOutlinePlus /> NEW MEMBER
                </Button>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID (MBR...), first name, or last name..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-sm font-medium transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <AiOutlineClose size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                            flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap
                            ${showFilters 
                                ? 'bg-brand-primary text-white border-brand-primary' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
                            }
                        `}
                    >
                        <AiOutlineFilter size={18} />
                        <span className="text-xs font-black uppercase tracking-wider">Filters</span>
                        {hasActiveFilters && !showFilters && (
                            <span className="ml-1 w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Status"
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
                                label="Tribute"
                                options={tributeOptions}
                                value={tributeFilter}
                                onChange={(val) => {
                                    const value = getSelectValue(val);
                                    setTributeFilter(value);
                                }}
                                containerClassName="w-full"
                            />
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="mt-4 pt-4 border-t-2 border-gray-100">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                            Active filters:
                                        </span>
                                        {searchQuery && (
                                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase">
                                                Search: {searchQuery}
                                            </span>
                                        )}
                                        {statusFilter !== 'ALL' && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                                                {statusFilter === MemberStatus.STUDENT ? 'Student' : 'Worker'}
                                            </span>
                                        )}
                                        {districtFilter !== 'ALL' && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">
                                                District: {districts.find(d => d.id?.toString() === districtFilter)?.name}
                                            </span>
                                        )}
                                        {tributeFilter !== 'ALL' && (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase">
                                                Tribute: {tributes.find(t => t.id?.toString() === tributeFilter)?.name}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-4 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {filteredMembers.length} member(s) found
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-[10px] font-black uppercase text-brand-primary hover:underline"
                    >
                        Reset all filters
                    </button>
                )}
            </div>

            {/* Members Grid */}
            {filteredMembers.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
                    <AiOutlineTeam size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-black text-gray-400 uppercase">No members found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search or filters
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="mt-4 text-sm font-black text-brand-primary hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            />

            {/* Delete Confirmation Alert */}
            <Alert
                isOpen={!!deleteId}
                title="Delete Member"
                message="This action is irreversible. All data related to this member will be permanently removed."
                confirmText="YES, DELETE"
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