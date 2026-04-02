// client/src/pages/admin/Members.tsx
import React, { useState } from 'react';
import { useMembers } from '../../hooks/useMembers';
import { useLocations } from '../../hooks/useLocations';
import { MemberStatus, PersonResponse } from '../../lib/types';
import Alert from '../../components/ui/Alert';
import MemberForm from '../../components/admin/members/MemberForm';
import MemberDetailModal from '../../components/admin/members/MemberDetailModal';
import MembersHeader from '../../components/admin/members/MembersHeader';
import MembersFilters from '../../components/admin/members/MembersFilters';
import MembersTable from '../../components/admin/members/MembersTable';
import MemberCard from '../../components/admin/members/MemberCard'; // <-- re-add for desktop

const AdminMembers: React.FC = () => {
  const { members, isLoading, deleteMember } = useMembers();
  const { districts, tributes } = useLocations();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'ALL'>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [tributeFilter, setTributeFilter] = useState<string>('ALL');

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PersonResponse | null>(null);
  const [viewingMember, setViewingMember] = useState<PersonResponse | null>(null);
  const [selectedParentForChild, setSelectedParentForChild] = useState<PersonResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Map districts/tributes to ensure id is number (filter out undefined)
  const safeDistricts = districts
    .filter(d => d.id !== undefined)
    .map(d => ({ id: d.id as number, name: d.name }));

  const safeTributes = tributes
    .filter(t => t.id !== undefined)
    .map(t => ({ id: t.id as number, name: t.name }));

  // Filter helpers
  const hasActiveFilters =
    statusFilter !== 'ALL' || districtFilter !== 'ALL' || tributeFilter !== 'ALL' || searchQuery !== '';

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
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

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case 'searchQuery':
        setSearchQuery(value);
        break;
      case 'statusFilter':
        setStatusFilter(value as MemberStatus | 'ALL');
        break;
      case 'districtFilter':
        setDistrictFilter(value);
        break;
      case 'tributeFilter':
        setTributeFilter(value);
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDistrictFilter('ALL');
    setTributeFilter('ALL');
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setSelectedParentForChild(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: PersonResponse) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleView = (member: PersonResponse) => {
    setViewingMember(member);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    setSelectedParentForChild(null);
  };

  const handleAddChild = (parent: PersonResponse) => {
    setSelectedParentForChild(parent);
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleViewChild = (child: PersonResponse) => {
    setViewingMember(child);
  };

  const handleViewParent = (parentId: string) => {
    const parent = members.find(m => m.id === parentId);
    if (parent) setViewingMember(parent);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-gray-500 uppercase text-xs sm:text-sm">Chargement des membres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <MembersHeader
        totalMembers={members.length}
        filteredCount={filteredMembers.length}
        onAddMember={handleAddMember}
      />

      <MembersFilters
        filters={{ searchQuery, statusFilter, districtFilter, tributeFilter }}
        onFilterChange={handleFilterChange}
        onClearAll={clearAllFilters}
        districts={safeDistricts}
        tributes={safeTributes}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Empty state (no results, no active filters) */}
      {filteredMembers.length === 0 && !hasActiveFilters ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
          <p className="font-black text-gray-400 uppercase text-xs sm:text-sm">Aucun membre trouvé</p>
          <button
            onClick={handleAddMember}
            className="mt-3 text-[11px] sm:text-xs font-black text-brand-primary hover:underline"
          >
            + Ajouter un membre
          </button>
        </div>
      ) : (
        <>
          {/* Table view – visible only on mobile (below md) */}
          <div className="block md:hidden">
            <MembersTable
              members={filteredMembers}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
              onView={handleView}
            />
          </div>

          {/* Card grid – visible only on desktop (md and up) */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
        </>
      )}

      <MemberForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        memberToEdit={editingMember}
        parentId={selectedParentForChild?.id}
      />

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