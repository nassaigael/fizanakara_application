import React, { useState, useMemo } from 'react';
import {
    AiOutlineTeam,
    AiOutlinePlus,
    AiOutlineSearch,
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { MemberStatus, PersonResponse } from '../../lib/types';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import MemberCard from '../../components/admin/members/MemberCard';
import MemberForm from '../../components/admin/members/MemberForm';

const AdminMembers: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<MemberStatus | 'ALL'>('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<PersonResponse | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { members, isLoading, deleteMember } = useMembers();

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingMember(null);
    };

    const handleEdit = (member: PersonResponse) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleAddMember = () => {
        setEditingMember(null);
        setIsFormOpen(true);
    };

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch =
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.phoneNumber.includes(searchQuery);

            const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [members, searchQuery, statusFilter]);

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
                    <p className="text-gray-500 mt-1 uppercase">{members.length} members registered</p>
                </div>
                <Button onClick={handleAddMember} className="flex items-center gap-2">
                    <AiOutlinePlus /> NEW MEMBER
                </Button>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-75 relative">
                    <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-primary outline-none uppercase text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <Select
                        options={[
                            { label: 'All Statuses', value: 'ALL' },
                            { label: 'Students', value: MemberStatus.STUDENT },
                            { label: 'Workers', value: MemberStatus.WORKER },
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val as any)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteId(id)}
                    />
                ))}
            </div>

            <MemberForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                memberToEdit={editingMember}
            />

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