import React, { useState, useMemo, memo } from "react";
import {
    AiOutlineSearch, AiOutlineEye, AiOutlineDelete,
    AiOutlinePlus, AiOutlineFilter, AiOutlineEdit, AiOutlineClose,
    AiOutlineTeam, AiOutlineCalendar, AiOutlinePhone, AiOutlineGlobal,
    AiOutlineUser
} from "react-icons/ai";
import { useMemberLogic } from "../hooks/useMembers";
import { MemberHelper } from "../lib/helper/member.helper";
import { PersonResponseDto } from "../lib/types/models/person.type";
import { THEME } from "../styles/theme";
import { useAuth } from "../context/AuthContext"; // Import corrigé

// Shared Components
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import Select from "../components/shared/Select";
import ActionBtn from "../components/shared/ActionBtn";
import MemberForm from "../components/modals/MemberForm";

const TABLE_HEADERS = [
    { label: "Membre", align: "text-left" },
    { label: "Localisation", align: "text-left" },
    { label: "Paiement", align: "text-center" },
    { label: "Actions", align: "text-right" },
];

const MemberManagement: React.FC = () => {
    const { isSuperAdmin } = useAuth(); // Utilisation du vrai contexte
    const {
        members, allMembers, search, setSearch,
        filterSex, setFilterSex,
        filterDistrict, setFilterDistrict,
        filterTribe, setFilterTribe,
        deleteAction, refreshMembers
    } = useMemberLogic();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMember, setViewMember] = useState<PersonResponseDto | null>(null);
    const [formModal, setFormModal] = useState<{ isOpen: boolean; memberToEdit: PersonResponseDto | null; }>({
        isOpen: false,
        memberToEdit: null
    });

    const districtOptions = useMemo(() => Array.from(new Set(allMembers.map(m => m.districtName))), [allMembers]);
    const tribeOptions = useMemo(() => Array.from(new Set(allMembers.map(m => m.tributeName))), [allMembers]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className={`${THEME.font.black} text-3xl tracking-tighter uppercase`}>Membres</h1>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">
                        {members.length} enregistrés dans la base
                    </p>
                </div>

                <Button
                    onClick={() => setFormModal({ isOpen: true, memberToEdit: null })}
                    className="rounded-2xl! flex items-center gap-2"
                >
                    <AiOutlinePlus size={20} />
                    <span className="text-[10px]">Nouveau Membre</span>
                </Button>
            </div>
            <section className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher par nom, téléphone..."
                            icon={<AiOutlineSearch size={20} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-4! rounded-2xl! ${isFilterOpen ? 'border-brand-primary text-brand-primary' : ''}`}
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
                            options={[{ value: "MALE", label: "Hommes" }, { value: "FEMALE", label: "Femmes" }]}
                        />
                        <Select 
                            label="District" 
                            value={filterDistrict} 
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            options={districtOptions.map(d => ({ value: d, label: d }))}
                        />
                        <Select 
                            label="Tribu" 
                            value={filterTribe} 
                            onChange={(e) => setFilterTribe(e.target.value)}
                            options={tribeOptions.map(t => ({ value: t, label: t }))}
                        />
                    </div>
                )}
            </section>
            <div className="bg-white dark:bg-brand-border-dark rounded-[2.5rem] border-2 border-brand-border border-b-8 overflow-hidden shadow-2xl">
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
                            {members.map(m => (
                                <tr key={m.id} className="group hover:bg-brand-primary/5 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <img src={m.imageUrl || "/avatar-placeholder.png"} className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-border shadow-sm group-hover:rotate-3 transition-transform" alt="" />
                                            <div>
                                                <div className={`${THEME.font.black} text-[11px] uppercase text-brand-text group-hover:text-brand-primary`}>
                                                    {m.firstName} {m.lastName}
                                                </div>
                                                <div className="text-[8px] font-black text-brand-muted uppercase mt-0.5">
                                                    {m.parentId ? `● Fils de ${m.parentName}` : '○ Titulaire'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-[10px] font-black uppercase text-brand-text">{m.districtName}</div>
                                        <div className="text-[8px] font-bold text-brand-primary uppercase mt-0.5">{m.tributeName}</div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <PaymentStatusBadge active={m.isActiveMember} />
                                    </td>
                                    <td className="p-6">
										<div className="flex justify-end gap-3">
											<ActionBtn 
												variant="view" 
												onClick={() => setViewMember(m)} 
												icon={<AiOutlineEye size={18} />} 
												title="Voir les détails"
											/>
											<ActionBtn 
												variant="edit" 
												onClick={() => setFormModal({ isOpen: true, memberToEdit: m })} 
												icon={<AiOutlineEdit size={18} />} 
												title="Modifier le membre"
											/>
											{isSuperAdmin && (
												<ActionBtn 
													variant="delete" 
													onClick={() => deleteAction([m.id])} 
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
            </div>

            {viewMember && (
                <MemberDetailModal member={viewMember} onClose={() => setViewMember(null)} />
            )}

            <MemberForm
                isOpen={formModal.isOpen}
                onClose={() => setFormModal({ isOpen: false, memberToEdit: null })}
                memberToEdit={formModal.memberToEdit}
                onSuccess={refreshMembers}
                allMembers={allMembers}
            />
        </div>
    );
};
const PaymentStatusBadge = ({ active }: { active: boolean }) => (
    <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase border-2 ${
        active 
        ? 'bg-green-50 text-green-600 border-green-100' 
        : 'bg-red-50 text-red-500 border-red-100'
    }`}>
        {active ? 'À JOUR' : 'IMPAYÉ'}
    </span>
);

const MemberDetailModal = ({ member, onClose }: { member: PersonResponseDto; onClose: () => void }) => (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white dark:bg-brand-border-dark rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border-2 border-brand-border border-b-8 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center bg-brand-bg/20 border-b-2 border-brand-border relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white rounded-full transition-colors"><AiOutlineClose size={22} /></button>
                <div className="relative inline-block mt-4">
                    <img src={member.imageUrl} className="w-32 h-44 object-cover rounded-4xl shadow-xl border-4 border-white rotate-3" alt="" />
                </div>
                <h3 className={`${THEME.font.black} text-2xl uppercase tracking-tighter mt-6`}>{member.firstName} {member.lastName}</h3>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-2">ID: {member.sequenceNumber || '---'}</p>
            </div>

            <div className="p-8 grid grid-cols-2 gap-4">
                <DetailBox icon={<AiOutlineCalendar />} label="Naissance" value={MemberHelper.formatDate?.(member.birthDate) || member.birthDate} />
                <DetailBox icon={<AiOutlineGlobal />} label="District" value={member.districtName} />
                <DetailBox icon={<AiOutlineTeam />} label="Tribu" value={member.tributeName} />
                <DetailBox icon={<AiOutlinePhone />} label="Contact" value={member.phoneNumber || "---"} />
            </div>

            <div className="p-8 pt-0">
                <Button variant="secondary" onClick={onClose} className="w-full rounded-2xl!">FERMER LA FICHE</Button>
            </div>
        </div>
    </div>
);

const DetailBox = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
    <div className="bg-brand-bg/30 p-4 rounded-3xl border-2 border-brand-border/50 flex items-center gap-3">
        <div className="text-brand-primary opacity-60">{icon}</div>
        <div>
            <p className="text-[7px] font-black text-brand-muted uppercase tracking-widest">{label}</p>
            <p className="font-black text-[10px] uppercase text-brand-text truncate">{value}</p>
        </div>
    </div>
);

export default memo(MemberManagement);