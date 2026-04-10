import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AiOutlineTeam,
    AiOutlineDollar,
    AiOutlineWarning,
    AiOutlineRise,
    AiOutlineUserAdd,
    AiOutlineCalendar,
    AiOutlineFileText,
    AiOutlineCheckCircle,
    AiOutlineDown,
    AiOutlineClockCircle
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useFinance } from '../../hooks/useFinance';
import { AnnualCollectionChart } from '../../components/ui/AnnualCollectionChart';
import { RiskMemberCard } from '../../components/ui/RiskMemberCard';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';
import { formatCurrency, formatDate } from '../../lib/helper';
import { generateContributionReport } from '../../services/report.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const { members, isLoading: loadingMembers } = useMembers();
    const { contributions, isLoading: loadingContribs } = useFinance(undefined, selectedYear);

    const monthlyData = useMemo(() => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const targetPerMonth = 15000;

        const monthlyCollected = new Array(12).fill(0);

        contributions.forEach(contribution => {
            if (contribution.payments && contribution.payments.length > 0) {
                contribution.payments.forEach(payment => {
                    const paymentDate = new Date(payment.paymentDate);
                    const paymentYear = paymentDate.getFullYear();
                    const paymentMonth = paymentDate.getMonth();

                    if (paymentYear === selectedYear) {
                        monthlyCollected[paymentMonth] += payment.amountPaid;
                    }
                });
            }
        });

        return months.map((month, index) => ({
            month,
            collected: monthlyCollected[index],
            target: targetPerMonth
        }));
    }, [contributions, selectedYear]);

    const stats = useMemo(() => {
        const totalMembers = members?.length || 0;
        const activeMembers = members?.filter(m => m.isActiveMember).length || 0;
        const students = members?.filter(m => m.status === 'STUDENT').length || 0;
        const workers = members?.filter(m => m.status === 'WORKER').length || 0;

        const totalDue = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = contributions.reduce((sum, c) => sum + (c.totalPaid || 0), 0);

        const today = new Date();
        const currentMonth = today.getMonth();

        const atRisk = [...contributions]
            .filter(c => {
                const remaining = c.remaining || 0;
                const dueDate = new Date(c.dueDate);
                const isOverdue = dueDate < today;
                const isOverdueOrAfterAugust = isOverdue || (currentMonth >= 7);

                return remaining > 0 && isOverdueOrAfterAugust;
            })
            .sort((a, b) => (b.remaining || 0) - (a.remaining || 0))
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                memberId: c.memberId,
                memberName: c.memberName,
                amount: c.amount,
                remaining: c.remaining,
                dueDate: c.dueDate,
                isOverdue: new Date(c.dueDate) < today
            }));

        return {
            totalMembers,
            activeMembers,
            students,
            workers,
            totalPaid,
            totalDue,
            totalRemaining: totalDue - totalPaid,
            atRisk
        };
    }, [members, contributions]);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const allContributions = await import('../../services/contribution.services').then(
                    module => module.ContributionService.getAll()
                );
                const years = [...new Set(allContributions.map(c => c.year))];
                setAvailableYears(years.sort((a, b) => a - b));
                if (years.length > 0 && !years.includes(selectedYear)) {
                    setSelectedYear(years[years.length - 1]);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des années:', error);
            }
        };
        fetchYears();
    }, []);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(parseInt(e.target.value, 10));
    };

    const handleGenerateReport = async () => {
        try {
            const allContributions = await import('../../services/contribution.services').then(
                module => module.ContributionService.getAll()
            );
            
            const filteredContributions = allContributions.filter(c => c.year === selectedYear);
            
            const reportData = filteredContributions.map(c => ({
                memberName: c.memberName,
                year: c.year,
                amount: c.amount,
                totalPaid: c.totalPaid,
                remaining: c.remaining,
                status: c.status === 'PAID' ? 'Payé' : c.status === 'PARTIAL' ? 'Partiel' : 'En attente'
            }));
            
            generateContributionReport({
                title: 'Rapport des Cotisations',
                year: selectedYear,
                data: reportData,
                totalDue: stats.totalDue,
                totalPaid: stats.totalPaid,
                totalRemaining: stats.totalRemaining,
                generatedBy: `${user?.firstName} ${user?.lastName} (${user?.email})`
            });
            
            toast.success(`Rapport ${selectedYear} généré avec succès`);
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            toast.error('Erreur lors de la génération du rapport');
        }
    };

    if (loadingMembers || loadingContribs) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#E51A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-[#E51A1A] text-white rounded-2xl md:rounded-3xl border-2 border-black shadow-md">
                        <AiOutlineRise size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.h1} text-xl sm:text-2xl md:text-3xl uppercase`}>
                            TABLEAU DE BORD ADMIN
                        </h1>
                        <p className={`${THEME.font.muted} text-[10px] sm:text-xs mt-0.5 md:mt-1 uppercase tracking-widest flex items-center gap-1 sm:gap-2`}>
                            <AiOutlineCalendar size={10} className="sm:w-3 sm:h-3" />
                            {formatDate(new Date().toISOString(), 'long')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {availableYears.length > 0 && (
                        <div className="relative">
                            <AiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="appearance-none bg-white border-2 border-gray-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-black uppercase tracking-wider cursor-pointer hover:border-[#E51A1A] transition-all focus:outline-none focus:border-[#E51A1A] w-full sm:w-auto"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>
                                        Année {year}
                                    </option>
                                ))}
                            </select>
                            <AiOutlineDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/members')}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm w-full sm:w-auto bg-[#E51A1A] hover:bg-[#C41515] text-white"
                    >
                        <AiOutlineUserAdd size={16} className="sm:w-5 sm:h-5" />
                        <span className="font-black">NOUVEAU MEMBRE</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 text-center border border-blue-400/30">
                    <p className="font-black text-white text-3xl sm:text-4xl">{stats.totalMembers}</p>
                    <p className="font-bold text-blue-200 text-[11px] uppercase tracking-wider mt-2">Membres</p>
                    <div className="mt-3 pt-3 border-t border-blue-400/30">
                        <p className="text-blue-200 text-xs font-medium">
                            <span className="font-black text-white text-base">{stats.activeMembers}</span> actifs
                        </p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-pink-600 to-pink-700 rounded-xl p-5 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 text-center border border-pink-400/30">
                    <p className="font-black text-white text-3xl sm:text-4xl">{stats.students}</p>
                    <p className="font-bold text-pink-200 text-[11px] uppercase tracking-wider mt-2">Étudiants</p>
                    <div className="mt-3 pt-3 border-t border-pink-400/30">
                        <p className="text-pink-200 text-xs font-medium">
                            <span className="font-black text-white text-base">{stats.totalMembers > 0 ? ((stats.students / stats.totalMembers) * 100).toFixed(1) : 0}%</span> du total
                        </p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-cyan-600 to-cyan-700 rounded-xl p-5 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 text-center border border-cyan-400/30">
                    <p className="font-black text-white text-3xl sm:text-4xl">{stats.workers}</p>
                    <p className="font-bold text-cyan-200 text-[11px] uppercase tracking-wider mt-2">Travailleurs</p>
                    <div className="mt-3 pt-3 border-t border-cyan-400/30">
                        <p className="text-cyan-200 text-xs font-medium">
                            <span className="font-black text-white text-base">{stats.totalMembers > 0 ? ((stats.workers / stats.totalMembers) * 100).toFixed(1) : 0}%</span> du total
                        </p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-rose-600 to-rose-700 rounded-xl p-5 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all duration-300 text-center border border-rose-400/30">
                    <p className="font-black text-white text-xl sm:text-2xl">{formatCurrency(stats.totalDue)}</p>
                    <p className="font-bold text-rose-200 text-[11px] uppercase tracking-wider mt-2">Cotisations</p>
                    <div className="mt-3 pt-3 border-t border-rose-400/30">
                        <p className="text-rose-200 text-xs font-medium">
                            Année <span className="font-black text-white text-base">{selectedYear}</span>
                        </p>
                    </div>
                </div>
            </div>

            <AnnualCollectionChart
                selectedYear={selectedYear}
                totalPaid={stats.totalPaid}
                totalDue={stats.totalDue}
                remaining={stats.totalRemaining}
                monthlyData={monthlyData}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border-2 border-b-8 border-gray-200 overflow-hidden">
                    <div className="bg-[#E51A1A] px-4 py-3 md:px-6 md:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <AiOutlineWarning className="text-white text-base md:text-xl" />
                                </div>
                                <h2 className="font-black text-white text-sm md:text-lg uppercase tracking-wider">
                                    Retards Critiques
                                </h2>
                            </div>
                            <div className="bg-white/20 px-2 py-1 rounded-lg">
                                <span className="text-white font-black text-[10px] md:text-xs">
                                    {stats.atRisk.length} membre(s)
                                </span>
                            </div>
                        </div>
                        <p className="text-white/80 text-[8px] md:text-[10px] mt-1 ml-8">
                            Membres avec paiements en retard ou partiels
                        </p>
                    </div>

                    <div className="p-4 md:p-6">
                        {stats.atRisk.length === 0 ? (
                            <div className="text-center py-8 md:py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E51A1A]/10 flex items-center justify-center">
                                    <AiOutlineCheckCircle size={32} className="text-[#E51A1A]" />
                                </div>
                                <p className="font-black text-gray-600 text-sm">Aucun retard de paiement</p>
                                <p className="text-gray-400 text-[10px] mt-1">Toutes les cotisations sont à jour</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.atRisk.map((item, index) => (
                                    <RiskMemberCard
                                        key={item.id}
                                        index={index}
                                        name={item.memberName}
                                        amount={item.amount}
                                        remaining={item.remaining}
                                        isOverdue={item.isOverdue}
                                        onClick={() => navigate(`/admin/finance?member=${item.memberId}&year=${selectedYear}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#E51A1A] rounded-2xl md:rounded-3xl border-2 border-black p-4 md:p-6 text-white">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <AiOutlineCalendar size={16} className="md:w-5 md:h-5" />
                        </div>
                        <h2 className={`${THEME.font.h2} text-base md:text-xl font-black uppercase tracking-wider`}>
                            Actions Rapides
                        </h2>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <QuickActionButton
                            title="Gérer les membres"
                            onClick={() => navigate('/admin/members')}
                            icon={<AiOutlineTeam size={16} className="md:w-5 md:h-5" />}
                        />
                        <QuickActionButton
                            title="Gérer les cotisations"
                            onClick={() => navigate(`/admin/finance?year=${selectedYear}`)}
                            icon={<AiOutlineDollar size={16} className="md:w-5 md:h-5" />}
                        />
                        <QuickActionButton
                            title="Générer un rapport"
                            onClick={handleGenerateReport}
                            icon={<AiOutlineFileText size={16} className="md:w-5 md:h-5" />}
                        />
                    </div>

                    <div className="mt-6 md:mt-8 p-3 md:p-4 bg-white/10 rounded-xl md:rounded-2xl border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <AiOutlineClockCircle size={12} className="text-white/70" />
                            <p className="text-[8px] md:text-[10px] font-black uppercase text-white/70">État du système</p>
                        </div>
                        <p className="text-[9px] md:text-[11px] font-medium text-white">
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
        className="w-full flex items-center justify-between p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl border border-white/20 transition-all group"
    >
        <span className="font-black uppercase text-[11px] md:text-sm">{title}</span>
        <div className="group-hover:translate-x-1 transition-transform text-white">
            {icon}
        </div>
    </button>
);

export default AdminDashboard;