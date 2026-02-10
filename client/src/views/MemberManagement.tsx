import React, { useState, useMemo, memo, useCallback } from "react";
import {
    AiOutlineSearch, AiOutlineEye, AiOutlineDelete,
    AiOutlinePlus, AiOutlineEdit, AiOutlineClose,
    AiOutlineCalendar, AiOutlinePhone, AiOutlineGlobal,
    AiOutlineTeam
} from "react-icons/ai";

import { useAuth } from "../context/AuthContext";
import { useMembers } from "../hooks/useMembers";
import { UserRole } from "../lib/types/enum.types";
import type { PersonResponseModel } from "../lib/types/models/person.models.types";
import toast from 'react-hot-toast';
import { getErrorMessage } from '../lib/helper/errorHelpers';

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ActionBtn from "../components/ui/ActionBtn";
import MemberForm from "../components/shared/modals/MemberForm";
import { calculateAge } from "../lib/helper/dateHelpers";
import { getInitials, getFullName } from '../lib/helper/stringHelpers';
import { THEME } from "../styles/theme";

const GENDER_OPTIONS = [
    { value: "", label: "Tous les genres" },
    { value: "MALE", label: "Hommes" },
    { value: "FEMALE", label: "Femmes" },
];

const MemberManagement: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;

    const { members, isLoading, deleteMember } = useMembers();

    // États pour la recherche et les filtres
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ gender: "", district: "", tribute: "" });

    // États pour les Modals
    const [selectedMember, setSelectedMember] = useState<PersonResponseModel | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<PersonResponseModel | undefined>(undefined);

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
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || m.sequenceNumber.toString().includes(searchTerm);
            const matchesGender = !filters.gender || m.gender === filters.gender;
            const matchesDistrict = !filters.district || m.districtName === filters.district;
            const matchesTribute = !filters.tribute || m.tributeName === filters.tribute;

            return matchesSearch && matchesGender && matchesDistrict && matchesTribute;
        });
    }, [members, searchTerm, filters]);

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm("Supprimer ce membre ?")) return;
        try {
            await deleteMember.mutateAsync(id);
            toast.success('Membre supprimé');
        } catch (err: any) {
            toast.error(getErrorMessage(err) || 'Suppression impossible');
        }
    }, [deleteMember]);

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>Membres</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {filteredMembers.length} résultats sur {members.length}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => { setEditingMember(undefined); setIsFormOpen(true); }} className="flex items-center gap-2">
                        <AiOutlinePlus /> AJOUTER UN MEMBRE
                    </Button>
                )}
            </div>

            {/* Barre de Filtres (Utilisation des variables qui manquaient) */}
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-b-8 border-gray-100 flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Rechercher un nom ou N°..."
                        icon={<AiOutlineSearch />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        value={filters.gender}
                        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                        options={GENDER_OPTIONS}
                    />
                    <Select
                        value={filters.district}
                        onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                        options={districtOptions}
                    />
                    <Select
                        value={filters.tribute}
                        onChange={(e) => setFilters({ ...filters, tribute: e.target.value })}
                        options={tribeOptions}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-100">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Membre</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Localisation</th>
                                <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                                <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-20 text-center font-black uppercase opacity-20">Chargement...</td></tr>
                            ) : filteredMembers.map((member: PersonResponseModel) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
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
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black ${member.isActiveMember ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                                            {member.isActiveMember ? "ACTIF" : "ATTENTE"}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-end gap-2">
                                            <ActionBtn icon={<AiOutlineEye />} title="Voir" variant="view" onClick={() => setSelectedMember(member)} />
                                            {isAdmin && (
                                                <>
                                                    <ActionBtn icon={<AiOutlineEdit />} title="Modifier" variant="edit" onClick={() => { setEditingMember(member); setIsFormOpen(true); }} />
                                                    <ActionBtn icon={<AiOutlineDelete />} title="Supprimer" variant="delete" onClick={() => handleDelete(member.id)} />
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {selectedMember && (
                <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            )}

            {isFormOpen && (
                <MemberForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    memberToEdit={editingMember ?? null}
                    allMembers={members}
                />
            )}
        </div>
    );
};

// Composants de détail internes
const MemberDetailModal = memo(({ member, onClose }: { member: PersonResponseModel; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-[3rem] border-2 border-b-8 border-gray-100 overflow-hidden">
            <div className="relative h-32 bg-red-500">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors">
                    <AiOutlineClose size={20} />
                </button>
                <div className="absolute -bottom-12 left-10 w-24 h-24 bg-white rounded-4xl border-4 border-white shadow-xl flex items-center justify-center text-2xl font-black text-red-500 uppercase">
                    {member.firstName[0]}{member.lastName[0]}
                </div>
            </div>
            <div className="p-10 pt-16">
                <div className="mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{member.lastName} {member.firstName}</h2>
                    <p className="text-red-500 font-black text-[10px] uppercase italic">{member.status}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <DetailBox label="Âge" value={`${calculateAge(member.birthDate)} ans`} icon={<AiOutlineCalendar />} />
                    <DetailBox label="Contact" value={member.phoneNumber} icon={<AiOutlinePhone />} />
                    <DetailBox label="Secteur" value={member.districtName} icon={<AiOutlineGlobal />} />
                    <DetailBox label="Tribu" value={member.tributeName} icon={<AiOutlineTeam />} />
                </div>
                <div className="mt-8">
                    <Button onClick={onClose} className="w-full">FERMER</Button>
                </div>
            </div>
        </div>
    </div>
));

const DetailBox = memo(({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="bg-gray-50 p-4 rounded-3xl border-2 border-gray-100 flex items-center gap-3">
        {icon && <div className="text-red-500 opacity-60">{icon}</div>}
        <div>
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="font-black text-[10px] uppercase text-gray-800 truncate">{value}</p>
        </div>
    </div>
));

export default memo(MemberManagement);