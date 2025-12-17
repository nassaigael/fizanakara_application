import React, { useState, useMemo } from 'react';
import {
    AiOutlineTeam,
    AiOutlinePlus,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineSearch,
    AiOutlineClose,
    AiOutlineMan,
    AiOutlineWoman,
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useForm } from '../../hooks/useForm';
import { useLocations } from '../../hooks/useLocations';
import { personSchema } from '../../lib/validators/member.validator';
import { PersonDto, Gender, MemberStatus } from '../../lib/types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import { formatDate } from '../../lib/helper';

const AdminMembers: React.FC = () => {
    // États pour les filtres et la recherche
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<MemberStatus | 'ALL'>('ALL');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Hooks de données
    const { members, isLoading, createMember, updateMember, deleteMember } = useMembers();
    const { districts, tributes } = useLocations();

    // Configuration du formulaire
    const form = useForm<PersonDto>({
        initialValues: {
            firstName: '',
            lastName: '',
            birthDate: '',
            gender: Gender.MALE,
            phoneNumber: '',
            status: MemberStatus.STUDENT,
            districtId: districts[0]?.id || 1,
            tributeId: tributes[0]?.id || 1,
        },
        validationSchema: personSchema,
        onSubmit: async (data) => {
            try {
                if (editingId) {
                    await updateMember.mutateAsync({ id: editingId, data });
                } else {
                    await createMember.mutateAsync(data);
                }
                handleCloseForm();
            } catch (error) {
                // Erreur gérée par le toast global du hook
            }
        }
    });

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        form.resetForm();
    };

    const handleEdit = (member: any) => {
        setEditingId(member.id);
        form.setFieldValue('firstName', member.firstName);
        form.setFieldValue('lastName', member.lastName);
        form.setFieldValue('birthDate', member.birthDate);
        form.setFieldValue('gender', member.gender);
        form.setFieldValue('phoneNumber', member.phoneNumber);
        form.setFieldValue('status', member.status);
        form.setFieldValue('districtId', member.districtId);
        form.setFieldValue('tributeId', member.tributeId);
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

    if (isLoading) return <div className="p-10 text-center">Chargement des membres...</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className={`${THEME.font.h1} flex items-center gap-3`}>
                        <AiOutlineTeam className="text-brand-primary" />
                        GESTION DES MEMBRES
                    </h1>
                    <p className="text-gray-500 mt-1">{members.length} membres enregistrés</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <AiOutlinePlus className="mr-2" /> NOUVEAU MEMBRE
                </Button>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-primary outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <Select
                        options={[
                            { label: 'Tous les statuts', value: 'ALL' },
                            { label: 'Étudiants', value: MemberStatus.STUDENT },
                            { label: 'Travailleurs', value: MemberStatus.WORKER },
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val as any)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6 hover:border-brand-primary transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                                member.gender === Gender.MALE ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                            }`}>
                                {member.gender === Gender.MALE ? <AiOutlineMan /> : <AiOutlineWoman />}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(member)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-primary">
                                    <AiOutlineEdit size={20} />
                                </button>
                                <button onClick={() => setDeleteId(member.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                                    <AiOutlineDelete size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-lg uppercase">
                            {member.lastName} <span className="text-brand-primary">{member.firstName}</span>
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">{member.phoneNumber}</p>
                        
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase">
                                {member.status}
                            </span>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">
                                {formatDate(member.birthDate)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border-b-8 border-brand-primary">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={THEME.font.h2}>
                                {editingId ? 'MODIFIER LE MEMBRE' : 'NOUVEAU MEMBRE'}
                            </h2>
                            <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full">
                                <AiOutlineClose size={24} />
                            </button>
                        </div>

                        <form onSubmit={form.handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Nom" name="lastName" value={form.values.lastName} onChange={form.handleChange} error={form.errors.lastName} required />
                                <Input label="Prénom" name="firstName" value={form.values.firstName} onChange={form.handleChange} error={form.errors.firstName} required />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Date de naissance" name="birthDate" type="date" value={form.values.birthDate} onChange={form.handleChange} error={form.errors.birthDate} required />
                                <Select 
                                    label="Genre"
                                    options={[{ label: 'Masculin', value: Gender.MALE }, { label: 'Féminin', value: Gender.FEMALE }]}
                                    value={form.values.gender}
                                    onChange={(val) => form.setFieldValue('gender', val)}
                                />
                            </div>

                            <Input label="Téléphone" name="phoneNumber" value={form.values.phoneNumber} onChange={form.handleChange} error={form.errors.phoneNumber} required />

                            <div className="grid grid-cols-2 gap-4">
                                <Select 
                                    label="District"
                                    options={districts.map(d => ({ label: d.name, value: d.id! }))}
                                    value={form.values.districtId}
                                    onChange={(val) => form.setFieldValue('districtId', Number(val))}
                                />
                                <Select 
                                    label="Tribu"
                                    options={tributes.map(t => ({ label: t.name, value: t.id! }))}
                                    value={form.values.tributeId}
                                    onChange={(val) => form.setFieldValue('tributeId', Number(val))}
                                />
                            </div>

                            <Select 
                                label="Statut"
                                options={[{ label: 'Étudiant', value: MemberStatus.STUDENT }, { label: 'Travailleur', value: MemberStatus.WORKER }]}
                                value={form.values.status}
                                onChange={(val) => form.setFieldValue('status', val)}
                            />

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="secondary" onClick={handleCloseForm} className="flex-1">ANNULER</Button>
                                <Button type="submit" isLoading={form.isSubmitting} className="flex-1">
                                    {editingId ? 'METTRE À JOUR' : 'ENREGISTRER'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Alert
                isOpen={!!deleteId}
                title="Supprimer le membre"
                message="Cette action est irréversible."
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