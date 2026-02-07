// pages/MemberManagement.tsx
import React, { useState, useMemo, memo } from "react";
import {
    AiOutlineSearch, AiOutlineEye, AiOutlineDelete,
    AiOutlinePlus, AiOutlineFilter, AiOutlineEdit, AiOutlineClose,
    AiOutlineTeam, AiOutlineCalendar, AiOutlinePhone, AiOutlineGlobal,
    AiOutlineUser
} from "react-icons/ai";
import { useMemberLogic } from "../hooks/useMemberLogic";
import { calculateAge, getFullName } from "../lib/helper/member.helper";
import type { PersonResponseDto } from "../lib/types/models/person.type";
import { THEME } from "../styles/theme";
import { useAuth } from "../context/AuthContext";

// Shared Components
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import Select from "../components/shared/Select";
import ActionBtn from "../components/shared/ActionBtn";
import MemberForm from "../components/modals/MemberForm";
import Alert from "../components/shared/Alert";

const TABLE_HEADERS = [
    { label: "Membre", align: "text-left" },
    { label: "Localisation", align: "text-left" },
    { label: "Statut", align: "text-center" },
    { label: "Actions", align: "text-right" },
];

const MemberManagement: React.FC = () => {
    const { isSuperAdmin } = useAuth();
    const {
        members,
        loading,
        error,
        search, setSearch,
        filterSex, setFilterSex,
        filterDistrict, setFilterDistrict,
        filterTribe, setFilterTribe,
        deleteMember,
        promoteMember,
        loadMembers
    } = useMemberLogic();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMember, setViewMember] = useState<PersonResponseDto | null>(null);
    const [formModal, setFormModal] = useState<{ 
        isOpen: boolean; 
        memberToEdit: PersonResponseDto | null; 
    }>({
        isOpen: false,
        memberToEdit: null
    });

    const [deleteAlert, setDeleteAlert] = useState<{
        show: boolean;
        memberId: string | null;
        memberName: string;
    }>({
        show: false,
        memberId: null,
        memberName: ''
    });

    const districtOptions = useMemo(() => 
        Array.from(new Set(members.map(m => m.districtName))).map(name => ({
            value: name,
            label: name
        })), 
        [members]
    );

    const tribeOptions = useMemo(() => 
        Array.from(new Set(members.map(m => m.tributeName))).map(name => ({
            value: name,
            label: name
        })), 
        [members]
    );

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteMember(id);
            setDeleteAlert({ show: false, memberId: null, memberName: '' });
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    const handlePromote = async (id: string) => {
        try {
            await promoteMember(id);
        } catch (error) {
            console.error('Failed to promote member:', error);
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 text-lg font-bold">Erreur</div>
                <div className="text-gray-600 mt-2">{error}</div>
                <Button onClick={loadMembers} className="mt-4">
                    Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className={`${THEME.font.black} text-3xl tracking-tighter uppercase`}>
                        Membres
                    </h1>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">
                        {members.length} enregistrés dans la base
                    </p>
                </div>

                <Button
                    onClick={() => setFormModal({ isOpen: true, memberToEdit: null })}
                    className="rounded-2xl! flex items-center gap-2"
                    disabled={loading}
                >
                    <AiOutlinePlus size={20} />
                    <span className="text-[10px]">Nouveau Membre</span>
                </Button>
            </div>

            {/* Recherche et filtres */}
            <section className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher par nom, téléphone..."
                            icon={<AiOutlineSearch size={20} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-4! rounded-2xl! ${
                            isFilterOpen ? 'border-brand-primary text-brand-primary' : ''
                        }`}
                        disabled={loading}
                    >
                        <AiOutlineFilter size={22} />
                    </Button>
                </div>

                {isFilterOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white dark:bg-brand-border-dark rounded-4xl border-2 border-brand-border animate-in slide-in-from-top-2 duration-300">
                        <Select 
                            label="Sexe" 
                            value={filterSex} 
                            onChange={(e) => setFilterSex(e.target.value)}
                            options={[
                                { value: "", label: "Tous" },
                                { value: "MALE", label: "Hommes" }, 
                                { value: "FEMALE", label: "Femmes" },
                                { value: "OTHER", label: "Autre" }
                            ]}
                            disabled={loading}
                        />
                        <Select 
                            label="District" 
                            value={filterDistrict} 
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            options={[{ value: "", label: "Tous" }, ...districtOptions]}
                            disabled={loading}
                        />
                        <Select 
                            label="Tribu" 
                            value={filterTribe} 
                            onChange={(e) => setFilterTribe(e.target.value)}
                            options={[{ value: "", label: "Toutes" }, ...tribeOptions]}
                            disabled={loading}
                        />
                    </div>
                )}
            </section>

            {/* Tableau */}
            <div className="bg-white dark:bg-brand-border-dark rounded-[2.5rem] border-2 border-brand-border border-b-8 overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent"></div>
                        <p className="mt-2 text-sm text-gray-600">Chargement des membres...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-bg/50 border-b-2 border-brand-border">
                                    {TABLE_HEADERS.map((col) => (
                                        <th key={col.label} className={`p-6 text-[9px] font-black uppercase text-brand-muted tracking-[0.2em] ${col.align}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-brand-bg">
                                {members.map(member => (
                                    <tr key={member.id} className="group hover:bg-brand-primary/5 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={member.imageUrl || "/avatar-placeholder.png"} 
                                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-border shadow-sm group-hover:rotate-3 transition-transform" 
                                                    alt={getFullName(member)}
                                                />
                                                <div>
                                                    <div className={`${THEME.font.black} text-[11px] uppercase text-brand-text group-hover:text-brand-primary`}>
                                                        {member.firstName} {member.lastName}
                                                    </div>
                                                    <div className="text-[8px] font-black text-brand-muted uppercase mt-0.5">
                                                        {member.parentId 
                                                            ? `● Fils de ${member.parentName || 'Parent inconnu'}` 
                                                            : '○ Titulaire'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-[10px] font-black uppercase text-brand-text">
                                                {member.districtName}
                                            </div>
                                            <div className="text-[8px] font-bold text-brand-primary uppercase mt-0.5">
                                                {member.tributeName}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col gap-2">
                                                <MemberStatusBadge status={member.status} />
                                                {member.isActiveMember && (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[7px] font-black uppercase">
                                                        Actif
                                                    </span>
                                                )}
                                                {calculateAge(member.birthDate) >= 18 && !member.isActiveMember && (
                                                    <Button 
                                                        variant="primary" 
                                                        onClick={() => handlePromote(member.id)}
                                                        className="text-[7px] px-3 py-1"
                                                    >
                                                        Promouvoir
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end gap-3">
                                                <ActionBtn 
                                                    variant="view" 
                                                    onClick={() => setViewMember(member)} 
                                                    icon={<AiOutlineEye size={18} />} 
                                                    title="Voir les détails"
                                                />
                                                <ActionBtn 
                                                    variant="edit" 
                                                    onClick={() => setFormModal({ 
                                                        isOpen: true, 
                                                        memberToEdit: member 
                                                    })} 
                                                    icon={<AiOutlineEdit size={18} />} 
                                                    title="Modifier le membre"
                                                />
                                                {isSuperAdmin && (
                                                    <ActionBtn 
                                                        variant="delete" 
                                                        onClick={() => setDeleteAlert({
                                                            show: true,
                                                            memberId: member.id,
                                                            memberName: getFullName(member)
                                                        })} 
                                                        icon={<AiOutlineDelete size={18} />} 
                                                        title="Supprimer définitivement"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de visualisation */}
            {viewMember && (
                <MemberDetailModal 
                    member={viewMember} 
                    onClose={() => setViewMember(null)} 
                />
            )}

            {/* Modal de formulaire */}
            <MemberForm
                isOpen={formModal.isOpen}
                onClose={() => setFormModal({ isOpen: false, memberToEdit: null })}
                memberToEdit={formModal.memberToEdit}
                onSuccess={loadMembers}
                allMembers={members}
            />

            {/* Alerte de suppression */}
            <Alert
                isOpen={deleteAlert.show}
                title="Confirmer la suppression"
                message={`Voulez-vous vraiment supprimer ${deleteAlert.memberName} ? Cette action est irréversible.`}
                variant="danger"
                onClose={() => setDeleteAlert({ show: false, memberId: null, memberName: '' })}
                onConfirm={() => deleteAlert.memberId && handleDelete(deleteAlert.memberId, deleteAlert.memberName)}
            />
        </div>
    );
};

// Composants auxiliaires
const MemberStatusBadge = ({ status }: { status: string }) => {
    const colors = {
        ACTIVE: 'bg-green-100 text-green-700 border-green-200',
        INACTIVE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        PENDING: 'bg-blue-100 text-blue-700 border-blue-200',
        DECEASED: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const labels = {
        ACTIVE: 'Actif',
        INACTIVE: 'Inactif',
        PENDING: 'En attente',
        DECEASED: 'Décédé'
    };

    return (
        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase border-2 ${
            colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
            {labels[status as keyof typeof labels] || status}
        </span>
    );
};

const MemberDetailModal = ({ member, onClose }: { member: PersonResponseDto; onClose: () => void }) => (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white dark:bg-brand-border-dark rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border-2 border-brand-border border-b-8 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center bg-brand-bg/20 border-b-2 border-brand-border relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 hover:bg-white rounded-full transition-colors"
                >
                    <AiOutlineClose size={22} />
                </button>
                <div className="relative inline-block mt-4">
                    <img 
                        src={member.imageUrl || "/avatar-placeholder.png"} 
                        className="w-32 h-32 object-cover rounded-4xl shadow-xl border-4 border-white rotate-3" 
                        alt={getFullName(member)}
                    />
                </div>
                <h3 className={`${THEME.font.black} text-2xl uppercase tracking-tighter mt-6`}>
                    {member.firstName} {member.lastName}
                </h3>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-2">
                    ID: {member.sequenceNumber || '---'}
                </p>
            </div>

            <div className="p-8 grid grid-cols-2 gap-4">
                <DetailBox 
                    icon={<AiOutlineCalendar />} 
                    label="Naissance" 
                    value={member.birthDate} 
                />
                <DetailBox 
                    icon={<AiOutlineUser />} 
                    label="Âge" 
                    value={`${calculateAge(member.birthDate)} ans`} 
                />
                <DetailBox 
                    icon={<AiOutlineGlobal />} 
                    label="District" 
                    value={member.districtName} 
                />
                <DetailBox 
                    icon={<AiOutlineTeam />} 
                    label="Tribu" 
                    value={member.tributeName} 
                />
                <DetailBox 
                    icon={<AiOutlinePhone />} 
                    label="Contact" 
                    value={member.phoneNumber || "---"} 
                />
                <DetailBox 
                    label="Enfants" 
                    value={`${member.childrenCount || 0}`} 
                />
            </div>

            <div className="p-8 pt-0">
                <Button variant="secondary" onClick={onClose} className="w-full rounded-2xl!">
                    FERMER LA FICHE
                </Button>
            </div>
        </div>
    </div>
);

const DetailBox = ({ label, value, icon }: { label: string; value: string; icon?: any }) => (
    <div className="bg-brand-bg/30 p-4 rounded-3xl border-2 border-brand-border/50 flex items-center gap-3">
        {icon && <div className="text-brand-primary opacity-60">{icon}</div>}
        <div>
            <p className="text-[7px] font-black text-brand-muted uppercase tracking-widest">{label}</p>
            <p className="font-black text-[10px] uppercase text-brand-text truncate">{value}</p>
        </div>
    </div>
);

export default memo(MemberManagement);