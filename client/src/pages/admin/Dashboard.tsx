import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AiOutlineTeam,
    AiOutlineDollar,
    AiOutlineWarning,
    AiOutlineRise,
    AiOutlineUserAdd,
    AiOutlineCalendar,
    AiOutlineFileText
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useFinance } from '../../hooks/useFinance';
import { Card } from '../../components/ui/Card';
import { ProgressCard } from '../../components/ui/ProgressCard';
import { RiskMemberCard } from '../../components/ui/RiskMemberCard';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';
import { formatCurrency, formatDate } from '../../lib/helper';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [selectedYear] = useState(new Date().getFullYear());
    
    const { members, isLoading: loadingMembers } = useMembers();
    const { contributions, isLoading: loadingContribs } = useFinance(undefined, selectedYear);

    const stats = useMemo(() => {
        const totalMembers = members?.length || 0;
        const activeMembers = members?.filter(m => m.isActiveMember).length || 0;
        const students = members?.filter(m => m.status === 'STUDENT').length || 0;
        const workers = members?.filter(m => m.status === 'WORKER').length || 0;
        
        const totalDue = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = contributions.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
        const progressPercent = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
        
        const atRisk = [...contributions]
            .filter(c => (c.remaining || 0) > 0)
            .sort((a, b) => (b.remaining || 0) - (a.remaining || 0))
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                memberId: c.memberId,
                memberName: c.memberName,
                amount: c.amount,
                remaining: c.remaining
            }));

        return {
            totalMembers,
            activeMembers,
            students,
            workers,
            totalPaid,
            totalDue,
            totalRemaining: totalDue - totalPaid,
            progressPercent,
            atRisk
        };
    }, [members, contributions]);

    if (loadingMembers || loadingContribs) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500">Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-primary text-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AiOutlineRise size={32} />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.h1} text-3xl`}>DASHBOARD ADMIN</h1>
                        <p className={`${THEME.font.muted} mt-1 text-xs uppercase tracking-widest`}>
                            {formatDate(new Date().toISOString(), 'long')}
                        </p>
                    </div>
                </div>

                <Button 
                    variant="primary" 
                    onClick={() => navigate('/admin/members')}
                    className="flex items-center gap-2"
                >
                    <AiOutlineUserAdd size={18} />
                    Nouveau membre
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    title="Membres"
                    value={stats.totalMembers}
                    subtitle={`${stats.activeMembers} actifs`}
                    icon={<AiOutlineTeam size={24} />}
                    gradient="from-blue-500 to-cyan-500"
                />
                <Card
                    title="Étudiants"
                    value={stats.students}
                    subtitle={`${((stats.students / stats.totalMembers) * 100 || 0).toFixed(1)}%`}
                    icon={<AiOutlineFileText size={24} />}
                    gradient="from-purple-500 to-pink-500"
                />
                <Card
                    title="Travailleurs"
                    value={stats.workers}
                    subtitle={`${((stats.workers / stats.totalMembers) * 100 || 0).toFixed(1)}%`}
                    icon={<AiOutlineTeam size={24} />}
                    gradient="from-orange-500 to-red-500"
                />
                <Card
                    title="Cotisations"
                    value={formatCurrency(stats.totalDue)}
                    subtitle={`Année ${selectedYear}`}
                    icon={<AiOutlineDollar size={24} />}
                    gradient="from-green-500 to-emerald-500"
                />
            </div>

            {/* Progress Card */}
            <ProgressCard
                title="Collecte annuelle"
                subtitle={`Taux de recouvrement ${selectedYear}`}
                progress={stats.progressPercent}
                current={stats.totalPaid}
                total={stats.totalDue}
            />

            {/* Two columns layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Members List */}
                <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-b-8 border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`${THEME.font.h2} text-xl flex items-center gap-2`}>
                            <AiOutlineWarning className="text-red-500" />
                            RETARDS CRITIQUES
                        </h2>
                        <span className="text-sm font-black text-gray-400">
                            {stats.atRisk.length} membre(s)
                        </span>
                    </div>

                    {stats.atRisk.length === 0 ? (
                        <div className="text-center py-12 opacity-50">
                            <AiOutlineCheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                            <p className="font-black">Aucun retard de paiement</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.atRisk.map((item, index) => (
                                <RiskMemberCard
                                    key={item.id}
                                    index={index}
                                    name={item.memberName}
                                    amount={item.amount}
                                    remaining={item.remaining}
                                    onClick={() => navigate(`/admin/finance?member=${item.memberId}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-brand-primary to-orange-600 rounded-3xl border-2 border-black p-6 text-white">
                    <h2 className={`${THEME.font.h2} text-xl mb-6 flex items-center gap-2`}>
                        <AiOutlineCalendar /> ACTIONS RAPIDES
                    </h2>
                    
                    <div className="space-y-4">
                        <QuickActionButton
                            title="Gérer les membres"
                            onClick={() => navigate('/admin/members')}
                            icon={<AiOutlineTeam />}
                        />
                        <QuickActionButton
                            title="Gérer les cotisations"
                            onClick={() => navigate('/admin/finance')}
                            icon={<AiOutlineDollar />}
                        />
                        <QuickActionButton
                            title="Générer rapport"
                            onClick={() => navigate('/admin/finance?report=true')}
                            icon={<AiOutlineFileText />}
                        />
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-2xl border-2 border-white/20">
                        <p className="text-[10px] font-black uppercase mb-1">Statut du système</p>
                        <p className="text-xs font-medium">
                            ✓ Synchronisé • {new Date().toLocaleTimeString('fr-FR')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickActionButton: React.FC<{ title: string; onClick: () => void; icon: React.ReactNode }> = ({
    title, onClick, icon
}) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl border-2 border-white/20 transition-all group"
    >
        <span className="font-black uppercase text-sm">{title}</span>
        <div className="group-hover:translate-x-2 transition-transform">
            {icon}
        </div>
    </button>
);

const AiOutlineCheckCircle = ({ size, className }: { size?: number; className?: string }) => (
    <svg 
        stroke="currentColor" 
        fill="currentColor" 
        strokeWidth="0" 
        viewBox="0 0 1024 1024" 
        height={size || 20} 
        width={size || 20} 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
    </svg>
);

export default AdminDashboard;