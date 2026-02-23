// MemberManagement.tsx (version complète)
import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import {
    AiOutlineSearch,
    AiOutlineEye,
    AiOutlineDelete,
    AiOutlinePlus,
    AiOutlineEdit,
    AiOutlineClose,
    AiOutlineFilter,
    AiOutlineReload,
    AiOutlineUserAdd,
    AiOutlineUserSwitch,
    AiOutlineCheckSquare,
    AiOutlineMinusSquare,
} from "react-icons/ai";

import { useAuth } from "../../context/AuthContext";
import { useMembers } from "../../hooks/useMembers";
import { UserRole } from "../../lib/types/enum.types";
import type { PersonResponseModel } from "../../lib/types/models/person.models.types";
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/helper/errorHelpers';

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ActionBtn from "../../components/ui/ActionBtn";
import Alert from "../../components/ui/Alert";
import MemberForm from "../../components/shared/modals/MemberForm";
import MemberDetailModal from "../../components/shared/modals/MemberDetailModal";
import { getInitials, getFullName } from '../../lib/helper/stringHelpers';
import { THEME } from "../../styles/theme";

// Constantes
const GENDER_OPTIONS = [
    { value: "", label: "Tous les genres" },
    { value: "MALE", label: "Hommes" },
    { value: "FEMALE", label: "Femmes" },
];

const STATUS_OPTIONS = [
    { value: "", label: "Tous les statuts" },
    { value: "true", label: "Actifs" },
    { value: "false", label: "Inactifs" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface Filters {
    gender: string;
    district: string;
    tribute: string;
    status: string;
}

interface AddOption {
    type: 'member' | 'child';
    label: string;
    icon: React.ReactNode;
    description: string;
}

const MemberList: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;

    const { members, isLoading, deleteMember, refetch } = useMembers();

    // États
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<Filters>({
        gender: "",
        district: "",
        tribute: "",
        status: ""
    });
    const [selectedMember, setSelectedMember] = useState<PersonResponseModel | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<PersonResponseModel | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [showFilters, setShowFilters] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showDeleteSelectedAlert, setShowDeleteSelectedAlert] = useState(false);
    const [addMode, setAddMode] = useState<'member' | 'child' | null>(null);

    // Options d'ajout
    const addOptions: AddOption[] = [
        {
            type: 'member',
            label: 'Nouveau membre',
            icon: <AiOutlineUserAdd size={20} />,
            description: 'Créer un membre titulaire'
        },
        {
            type: 'child',
            label: 'Nouvel enfant',
            icon: <AiOutlineUserSwitch size={20} />,
            description: 'Ajouter un enfant à un parent existant'
        }
    ];

    // Génération des options de filtrage
    const districtOptions = useMemo(() => {
        const unique = Array.from(new Set(members.map((m: PersonResponseModel) => m.districtName))).filter(Boolean);
        return [{ value: "", label: "Tous les districts" }, ...unique.map(d => ({ value: String(d), label: String(d) }))];
    }, [members]);

    const tribeOptions = useMemo(() => {
        const unique = Array.from(new Set(members.map((m: PersonResponseModel) => m.tributeName))).filter(Boolean);
        return [{ value: "", label: "Toutes les tribus" }, ...unique.map(t => ({ value: String(t), label: String(t) }))];
    }, [members]);

    // Logique de filtrage
    const filteredMembers = useMemo(() => {
        return members.filter((m: PersonResponseModel) => {
            const fullName = `${m.lastName} ${m.firstName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                m.sequenceNumber.toString().includes(searchTerm);
            const matchesGender = !filters.gender || m.gender === filters.gender;
            const matchesDistrict = !filters.district || m.districtName === filters.district;
            const matchesTribute = !filters.tribute || m.tributeName === filters.tribute;
            const matchesStatus = !filters.status ||
                (filters.status === "true" ? m.isActiveMember : !m.isActiveMember);

            return matchesSearch && matchesGender && matchesDistrict && matchesTribute && matchesStatus;
        });
    }, [members, searchTerm, filters]);

    // Pagination
    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMembers.slice(start, start + pageSize);
    }, [filteredMembers, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredMembers.length / pageSize);

    // Reset page quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Gestion de la sélection multiple
    useEffect(() => {
        if (selectAll) {
            setSelectedIds(paginatedMembers.map(m => m.id));
        } else if (selectedIds.length === paginatedMembers.length && paginatedMembers.length > 0) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [paginatedMembers, selectAll, selectedIds]);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
            setSelectAll(false);
        } else {
            setSelectedIds(paginatedMembers.map(m => m.id));
            setSelectAll(true);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.")) return;
        try {
            await deleteMember.mutateAsync(id);
            toast.success('Membre supprimé avec succès');
        } catch (err: any) {
            toast.error(getErrorMessage(err) || 'Impossible de supprimer le membre');
        }
    }, [deleteMember]);

    const handleDeleteSelected = async () => {
        try {
            // Supprimer un par un (ou utiliser une API bulk si disponible)
            for (const id of selectedIds) {
                await deleteMember.mutateAsync(id);
            }
            toast.success(`${selectedIds.length} membre(s) supprimé(s) avec succès`);
            setSelectedIds([]);
            setSelectAll(false);
        } catch (err: any) {
            toast.error(getErrorMessage(err) || 'Erreur lors de la suppression multiple');
        } finally {
            setShowDeleteSelectedAlert(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        try {
            await refetch();
            toast.success('Données actualisées');
        } catch (err) {
            toast.error('Erreur lors de l\'actualisation');
        }
    }, [refetch]);

    const clearFilters = useCallback(() => {
        setFilters({ gender: "", district: "", tribute: "", status: "" });
        setSearchTerm("");
    }, []);

    const handleAddClick = (option: AddOption) => {
        setAddMode(option.type);
        setEditingMember(undefined);
        setIsFormOpen(true);
        setShowAddMenu(false);
    };

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
                        Gestion des Membres
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {filteredMembers.length} résultat(s) sur {members.length} membres
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Sélection multiple */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 mr-2 px-3 py-1 bg-brand-primary/10 rounded-full">
                            <span className="text-[10px] font-black text-brand-primary">
                                {selectedIds.length} sélectionné(s)
                            </span>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="p-1 hover:bg-brand-primary/20 rounded-full transition-colors"
                            >
                                <AiOutlineClose size={12} className="text-brand-primary" />
                            </button>
                        </div>
                    )}

                    <Button
                        variant="secondary"
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-3!"
                        title="Actualiser"
                    >
                        <AiOutlineReload size={16} />
                        <span className="hidden sm:inline">Actualiser</span>
                    </Button>

                    {isAdmin && (
                        <>
                            {/* Bouton d'ajout avec dropdown */}
                            <div className="relative">
                                <Button
                                    onClick={() => setShowAddMenu(!showAddMenu)}
                                    className="flex items-center gap-2"
                                >
                                    <AiOutlinePlus />
                                    <span>AJOUTER</span>
                                </Button>

                                {showAddMenu && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border-2 border-brand-border border-b-8 shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                                        {addOptions.map((option) => (
                                            <button
                                                key={option.type}
                                                onClick={() => handleAddClick(option)}
                                                className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100"
                                            >
                                                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                                                    {option.icon}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-xs uppercase">{option.label}</p>
                                                    <p className="text-[8px] text-gray-400">{option.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bouton de suppression multiple */}
                            {selectedIds.length > 0 && (
                                <Button
                                    variant="danger"
                                    onClick={() => setShowDeleteSelectedAlert(true)}
                                    className="flex items-center gap-2"
                                >
                                    <AiOutlineDelete size={16} />
                                    <span>SUPPRIMER ({selectedIds.length})</span>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-b-8 border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher un nom ou N° de séquence..."
                            icon={<AiOutlineSearch />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 lg:w-auto"
                    >
                        <AiOutlineFilter size={16} />
                        {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
                    </Button>
                </div>

                {/* Filtres avancés */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t-2 border-gray-100 animate-in slide-in-from-top-2">
                        <Select
                            value={filters.gender}
                            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                            options={GENDER_OPTIONS}
                            placeholder="Genre"
                        />
                        <Select
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            options={districtOptions}
                            placeholder="District"
                        />
                        <Select
                            value={filters.tribute}
                            onChange={(e) => setFilters({ ...filters, tribute: e.target.value })}
                            options={tribeOptions}
                            placeholder="Tribu"
                        />
                        <Select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            options={STATUS_OPTIONS}
                            placeholder="Statut"
                        />
                    </div>
                )}

                {/* Bouton effacer filtres */}
                {(searchTerm || Object.values(filters).some(v => v)) && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={clearFilters}
                            className="text-[9px] font-black uppercase text-brand-primary hover:underline flex items-center gap-1"
                        >
                            <AiOutlineClose size={12} />
                            Effacer tous les filtres
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-100">
                                {isAdmin && (
                                    <th className="p-6 w-12">
                                        <button
                                            onClick={handleSelectAll}
                                            className="text-gray-400 hover:text-brand-primary transition-colors"
                                        >
                                            {selectAll ? (
                                                <AiOutlineCheckSquare size={20} />
                                            ) : (
                                                <AiOutlineMinusSquare size={20} />
                                            )}
                                        </button>
                                    </th>
                                )}
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Membre</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Localisation</th>
                                <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                                <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="font-black uppercase opacity-20">Chargement des membres...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="p-20 text-center font-black uppercase opacity-20">
                                        Aucun membre trouvé
                                    </td>
                                </tr>
                            ) : (
                                paginatedMembers.map((member: PersonResponseModel) => (
                                    <tr
                                        key={member.id}
                                        className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(member.id) ? 'bg-brand-primary/5' : ''}`}
                                    >
                                        {isAdmin && (
                                            <td className="p-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(member.id)}
                                                    onChange={() => handleSelectOne(member.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                />
                                            </td>
                                        )}
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-xs uppercase">
                                                    {getInitials(member.firstName, member.lastName)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs uppercase">{getFullName(member.firstName, member.lastName)}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">N° {member.sequenceNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-[10px] uppercase">{member.districtName}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase italic">{member.tributeName}</p>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black ${
                                                member.isActiveMember
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-orange-100 text-orange-600"
                                            }`}>
                                                {member.isActiveMember ? "ACTIF" : "ATTENTE"}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end gap-2">
                                                <ActionBtn
                                                    icon={<AiOutlineEye />}
                                                    title="Voir détails"
                                                    variant="view"
                                                    onClick={() => setSelectedMember(member)}
                                                />
                                                {isAdmin && (
                                                    <>
                                                        <ActionBtn
                                                            icon={<AiOutlineEdit />}
                                                            title="Modifier"
                                                            variant="edit"
                                                            onClick={() => {
                                                                setEditingMember(member);
                                                                setIsFormOpen(true);
                                                            }}
                                                        />
                                                        <ActionBtn
                                                            icon={<AiOutlineDelete />}
                                                            title="Supprimer"
                                                            variant="delete"
                                                            onClick={() => handleDelete(member.id)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredMembers.length > 0 && (
                    <div className="p-6 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                Lignes par page:
                            </span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border-2 border-gray-200 rounded-xl px-2 py-1 text-xs font-bold"
                            >
                                {PAGE_SIZE_OPTIONS.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-gray-400">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2! text-xs!"
                                >
                                    Précédent
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2! text-xs!"
                                >
                                    Suivant
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedMember && (
                <MemberDetailModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}

            {isFormOpen && (
                <MemberForm
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setAddMode(null);
                    }}
                    memberToEdit={editingMember ?? null}
                    allMembers={members}
                    parentId={addMode === 'child' ? undefined : undefined} // Le parent sera choisi dans le formulaire
                    onSuccess={() => {
                        toast.success(editingMember ? 'Membre modifié' : 'Membre créé');
                        setAddMode(null);
                    }}
                />
            )}

            {/* Alert de suppression multiple */}
            <Alert
                isOpen={showDeleteSelectedAlert}
                variant="danger"
                title="Supprimer plusieurs membres"
                message={`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} membre(s) ? Cette action est irréversible.`}
                confirmText="SUPPRIMER"
                onClose={() => setShowDeleteSelectedAlert(false)}
                onConfirm={handleDeleteSelected}
            />
        </div>
    );
};

export default memo(MemberList);