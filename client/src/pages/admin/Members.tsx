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

const AdminMembers: React.FC = () => {
  const { members, isLoading, deleteMember } = useMembers();
  const { districts, tributes } = useLocations();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filtrer les membres
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, districtFilter, tributeFilter]);

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

  // Changer le nombre d'éléments par page
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Aller à la page précédente
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Aller à la page suivante
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Aller à une page spécifique
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#E51A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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

      {/* Empty state */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
          <p className="font-black text-gray-400 uppercase text-xs sm:text-sm">
            {hasActiveFilters ? 'Aucun membre ne correspond aux filtres' : 'Aucun membre trouvé'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={handleAddMember}
              className="mt-3 text-[11px] sm:text-xs font-black text-[#E51A1A] hover:underline"
            >
              + Ajouter un membre
            </button>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-3 text-[11px] sm:text-xs font-black text-[#E51A1A] hover:underline"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Tableau pour tous les écrans */}
          <MembersTable
            members={paginatedMembers}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
            onView={handleView}
          />

          {/* Pagination */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
            {/* Info du nombre d'éléments */}
            <div className="text-[10px] sm:text-xs text-gray-500 order-2 sm:order-1">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredMembers.length)}/{filteredMembers.length} membres
            </div>

            {/* Contrôles de pagination */}
            <div className="flex items-center gap-3 order-1 sm:order-2">
              {/* Sélecteur lignes par page */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase">Lignes:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:border-[#E51A1A] focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Boutons navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Numéros de page */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxVisible = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }
                    
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }
                    
                    return pages.map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-8 h-8 px-2 text-xs font-bold rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#E51A1A] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
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