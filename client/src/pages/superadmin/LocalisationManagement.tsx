import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AiOutlineGlobal, 
    AiOutlinePlus, 
    AiOutlineDelete,
    AiOutlineEnvironment,
    AiOutlineFlag,
    AiOutlineEdit
} from 'react-icons/ai';
import Alert from '../../components/ui/Alert';
import toast from 'react-hot-toast';
import { THEME } from '../../styles/theme';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import { getApiErrorMessage } from '../../lib/helper';

const LocalisationManagement: React.FC = () => {
    const navigate = useNavigate();
    const { districts, deleteDistrict } = useDistrict();
    const { tributes, deleteTribute } = useTribute();

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteType, setDeleteType] = useState<'district' | 'tribute' | null>(null);

    const handleDelete = async () => {
        if (!deleteId || !deleteType) return;
        try {
            if (deleteType === 'district') {
                await deleteDistrict.mutateAsync(deleteId);
                toast.success('District supprimé');
            } else if (deleteType === 'tribute') {
                await deleteTribute.mutateAsync(deleteId);
                toast.success('Tribu supprimée');
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    return (
        <div className={THEME.section}>
            <div className="relative overflow-hidden rounded-3xl border-2 border-b-4 border-brand-border shadow-lg mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-green-500/10"></div>
                <div className="relative flex items-center justify-between p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-110 transition-transform">
                            <AiOutlineGlobal size={36} />
                        </div>
                        <div>
                            <h1 className={`${THEME.font.h1} text-3xl md:text-4xl`}>STRUCTURES GÉOGRAPHIQUES</h1>
                            <p className="text-brand-muted text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                Gérez les zones et les entités traditionnelles
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:block px-6 py-3 bg-white rounded-2xl border-2 border-brand-border">
                        <p className="text-2xl font-black text-brand-primary">{districts.length + tributes.length}</p>
                        <p className="text-xs text-brand-muted font-black">ENTITÉS</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border-2 border-b-4 border-brand-border p-8 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-brand-border">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <AiOutlineEnvironment className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-lg uppercase text-brand-text">Districts</h2>
                                <p className="text-xs text-brand-muted">Zones géographiques</p>
                            </div>
                        </div>
                        <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full border-2 border-blue-300 font-black text-sm">
                            {districts.length}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {districts.length === 0 ? (
                            <div className="text-center py-12">
                                <AiOutlineEnvironment className="mx-auto mb-4 text-gray-300" size={48} />
                                <p className="font-black text-gray-400">Aucun district configuré</p>
                                <button 
                                    onClick={() => navigate('/superadmin/management?tab=districts')}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl font-black text-sm hover:bg-blue-600"
                                >
                                    <AiOutlinePlus className="inline mr-2" />
                                    Ajouter
                                </button>
                            </div>
                        ) : (
                            districts.map((d) => (
                                <div
                                    key={d.id}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 hover:border-blue-500 transition-all group cursor-pointer transform hover:scale-105 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                                            {d.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-sm uppercase text-brand-text">{d.name}</p>
                                            <p className="text-xs text-brand-muted">Zone active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => navigate(`/superadmin/management?tab=districts&edit=${d.id}`)}
                                            className="p-2 hover:bg-blue-200 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            <AiOutlineEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (d.id) {
                                                    setDeleteId(d.id);
                                                    setDeleteType('district');
                                                }
                                            }}
                                            className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                                        >
                                            <AiOutlineDelete size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-b-4 border-brand-border p-8 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-brand-border">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-2xl">
                                <AiOutlineFlag className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-lg uppercase text-brand-text">Tribus</h2>
                                <p className="text-xs text-brand-muted">Entités traditionnelles</p>
                            </div>
                        </div>
                        <div className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full border-2 border-purple-300 font-black text-sm">
                            {tributes.length}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {tributes.length === 0 ? (
                            <div className="text-center py-12">
                                <AiOutlineFlag className="mx-auto mb-4 text-gray-300" size={48} />
                                <p className="font-black text-gray-400">Aucune tribu configurée</p>
                                <button 
                                    onClick={() => navigate('/superadmin/management?tab=tributes')}
                                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl font-black text-sm hover:bg-purple-600"
                                >
                                    <AiOutlinePlus className="inline mr-2" />
                                    Ajouter
                                </button>
                            </div>
                        ) : (
                            tributes.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:border-purple-500 transition-all group cursor-pointer transform hover:scale-105 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                                            {t.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-sm uppercase text-brand-text">{t.name}</p>
                                            <p className="text-xs text-brand-muted">Entité active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => navigate(`/superadmin/management?tab=tributes&edit=${t.id}`)}
                                            className="p-2 hover:bg-purple-200 rounded-lg text-purple-600 hover:text-purple-700 transition-colors"
                                        >
                                            <AiOutlineEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (t.id) {
                                                    setDeleteId(t.id);
                                                    setDeleteType('tribute');
                                                }
                                            }}
                                            className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                                        >
                                            <AiOutlineDelete size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="Zones" value={districts.length} icon="🗺️" color="blue" />
                <StatBox label="Entités" value={tributes.length} icon="🏛️" color="purple" />
                <StatBox label="Total" value={districts.length + tributes.length} icon="📊" color="green" />
                <StatBox label="Statut" value="Actif" icon="✓" color="orange" />
            </div>

            <Alert
                isOpen={!!deleteId}
                variant="danger"
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
                confirmText="SUPPRIMER"
                onClose={() => {
                    setDeleteId(null);
                    setDeleteType(null);
                }}
                onConfirm={handleDelete}
            />
        </div>
    );
};

interface StatBoxProps {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 border-blue-300',
        purple: 'bg-purple-100 text-purple-600 border-purple-300',
        green: 'bg-green-100 text-green-600 border-green-300',
        orange: 'bg-orange-100 text-orange-600 border-orange-300',
    };

    return (
        <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-2xl border-2 p-4 text-center hover:shadow-md transition-all`}>
            <p className="text-2xl font-black mb-1">{icon}</p>
            <p className="font-black text-xl">{value}</p>
            <p className="text-xs uppercase font-black opacity-70">{label}</p>
        </div>
    );
};

export default LocalisationManagement;