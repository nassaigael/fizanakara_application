import React, { useState, useMemo } from 'react';
import {
    AiOutlineUser,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineEye,
    AiOutlinePlus,
    AiOutlineFilter,
    AiOutlineTeam
} from 'react-icons/ai';
import { useMembers } from '../../../hooks/useMembers';
import { useLocations } from '../../../hooks/useLocations';
import { SearchInput } from '../../ui/SearchInput';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import ActionBtn from '../../ui/ActionBtn';
import { PersonResponse, MemberStatus } from '../../../lib/types';
import { getImageUrl } from '../../../lib/constant/constant';
import { getMemberStatusLabel, getStatusColor, getInitials } from '../../../lib/helper/';

interface MemberListProps {
    onAddMember?: () => void;
    onEditMember?: (id: string) => void;
    onViewMember?: (id: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
    onAddMember,
    onEditMember,
    onViewMember
}) => {
    const { members, isLoading, deleteMember } = useMembers();
    const { districts } = useLocations();
    
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        district: '',
        isActive: ''
    });

    const stats = useMemo(() => ({
        total: members.length,
        active: members.filter(m => m.isActiveMember).length,
        students: members.filter(m => m.status === MemberStatus.STUDENT).length,
        workers: members.filter(m => m.status === MemberStatus.WORKER).length
    }), [members]);

    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                m.sequenceNumber?.toString().includes(searchTerm);
            const matchesStatus = !filters.status || m.status === filters.status;
            const matchesDistrict = !filters.district || m.districtName === filters.district;
            const matchesActive = !filters.isActive ||
                (filters.isActive === 'active' ? m.isActiveMember : !m.isActiveMember);

            return matchesSearch && matchesStatus && matchesDistrict && matchesActive;
        });
    }, [members, searchTerm, filters]);

    const handleDelete = async () => {
        if (deleteId) {
            await deleteMember.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    const districtOptions = [
        { value: '', label: 'All Districts' },
        ...districts.map(d => ({ value: d.name || '', label: d.name || '' }))
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: MemberStatus.STUDENT, label: 'Students' },
        { value: MemberStatus.WORKER, label: 'Workers' }
    ];

    const activeOptions = [
        { value: '', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    if (isLoading && members.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500 uppercase">Loading members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total" value={stats.total} color="blue" />
                <StatCard title="Active" value={stats.active} color="green" />
                <StatCard title="Students" value={stats.students} color="purple" />
                <StatCard title="Workers" value={stats.workers} color="orange" />
            </div>

            <div className="bg-white rounded-3xl p-4 border-2 border-gray-200 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search member..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                                showFilters
                                    ? 'bg-brand-primary text-white border-brand-primary'
                                    : 'bg-white border-gray-200 hover:border-brand-primary'
                            }`}
                        >
                            <AiOutlineFilter size={20} />
                        </button>

                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-brand-primary transition-all"
                        >
                            {viewMode === 'grid' ? <AiOutlineTeam size={20} /> : <AiOutlineUser size={20} />}
                        </button>

                        <Button variant="primary" onClick={onAddMember}>
                            <AiOutlinePlus size={18} className="mr-2" />
                            NEW MEMBER
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Status"
                            options={statusOptions}
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        />
                        <Select
                            label="District"
                            options={districtOptions}
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                        />
                        <Select
                            label="Membership"
                            options={activeOptions}
                            value={filters.isActive}
                            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                        />
                    </div>
                )}
            </div>

            <p className="text-sm font-bold text-gray-500 uppercase">
                {filteredMembers.length} member(s) found
            </p>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map(member => (
                        <MemberGridCard
                            key={member.id}
                            member={member}
                            onView={onViewMember}
                            onEdit={onEditMember}
                            onDelete={setDeleteId}
                        />
                    ))}
                </div>
            ) : (
                <MemberTableView
                    members={filteredMembers}
                    onView={onViewMember}
                    onEdit={onEditMember}
                    onDelete={setDeleteId}
                />
            )}

            <Alert
                isOpen={!!deleteId}
                variant="danger"
                title="Delete Member"
                message="This action is irreversible."
                confirmText="DELETE"
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => {
    const colors = {
        blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
        green: 'from-green-50 to-green-100 border-green-200 text-green-600',
        purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
        orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600'
    };
    
    return (
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-2xl p-4 border-2`}>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs font-bold uppercase">{title}</p>
        </div>
    );
};

const MemberGridCard: React.FC<{
    member: PersonResponse;
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ member, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all group p-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 text-2xl font-black text-gray-400">
                        {member.imageUrl ? (
                            <img
                                src={getImageUrl(member.imageUrl, 'member')}
                                alt={member.firstName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitials(member.firstName, member.lastName)
                        )}
                    </div>
                    {member.isActiveMember && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                </div>
                <div>
                    <h3 className="font-black text-lg uppercase">{member.firstName} {member.lastName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                            {getMemberStatusLabel(member.status)}
                        </span>
                        <span className="text-[8px] font-bold text-gray-500">#{member.sequenceNumber}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase">
                {member.districtName} • {member.tributeName}
            </p>
            <p className="text-xs font-bold text-gray-600 uppercase">
                Children: {member.childrenCount || 0}
                {member.parentName && ` • Parent: ${member.parentName}`}
            </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
            <ActionBtn icon={<AiOutlineEye />} variant="view" title="View" onClick={() => onView?.(member.id)} />
            <ActionBtn icon={<AiOutlineEdit />} variant="edit" title="Edit" onClick={() => onEdit?.(member.id)} />
            <ActionBtn icon={<AiOutlineDelete />} variant="delete" title="Delete" onClick={() => onDelete(member.id)} />
        </div>
    </div>
);

const MemberTableView: React.FC<{
    members: PersonResponse[];
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ members, onView, onEdit, onDelete }) => (
    <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden">
        <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-500">Member</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-500">District/Tribute</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase text-gray-500">Membership</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase text-gray-500">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {members.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 text-sm font-black text-gray-400 uppercase">
                                    {member.imageUrl ? (
                                        <img
                                            src={getImageUrl(member.imageUrl, 'member')}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        getInitials(member.firstName, member.lastName)
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase">{member.firstName} {member.lastName}</p>
                                    <p className="text-[8px] font-bold text-gray-500">#{member.sequenceNumber}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="font-bold text-xs uppercase">{member.districtName}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{member.tributeName}</p>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                                {getMemberStatusLabel(member.status)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                                member.isActiveMember
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {member.isActiveMember ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                                <ActionBtn icon={<AiOutlineEye />} variant="view" title="View" onClick={() => onView?.(member.id)} />
                                <ActionBtn icon={<AiOutlineEdit />} variant="edit" title="Edit" onClick={() => onEdit?.(member.id)} />
                                <ActionBtn icon={<AiOutlineDelete />} variant="delete" title="Delete" onClick={() => onDelete(member.id)} />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);