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
    AiOutlineDown
} from 'react-icons/ai';
import { useMembers } from '../../hooks/useMembers';
import { useFinance } from '../../hooks/useFinance';
import { Card } from '../../components/ui/Card';
import { AnnualCollectionChart } from '../../components/ui/AnnualCollectionChart';
import { RiskMemberCard } from '../../components/ui/RiskMemberCard';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';
import { formatCurrency, formatDate } from '../../lib/helper';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const { members, isLoading: loadingMembers } = useMembers();
    const { contributions, isLoading: loadingContribs } = useFinance(undefined, selectedYear);

    // Générer les données mensuelles simulées
    // Dans un vrai projet, ces données viendraient du backend
    const monthlyData = useMemo(() => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const targetPerMonth = 15000; // Objectif mensuel de 15 000 Ar
        
        // Simuler des données de collecte (à remplacer par des vraies données)
        const collectedData = [0, 0, 0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 38000, 40000];
        
        return months.map((month, index) => ({
            month,
            collected: collectedData[index] || 0,
            target: targetPerMonth
        }));
    }, []);

    // Récupérer les années disponibles depuis les cotisations
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
                console.error('Failed to fetch years:', error);
            }
        };
        fetchYears();
    }, []);

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

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(parseInt(e.target.value, 10));
    };

    if (loadingMembers || loadingContribs) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-brand-primary text-white rounded-2xl md:rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AiOutlineRise size={24} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className={`${THEME.font.h1} text-xl sm:text-2xl md:text-3xl uppercase`}>
                            ADMIN DASHBOARD
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
                                className="appearance-none bg-white border-2 border-gray-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-black uppercase tracking-wider cursor-pointer hover:border-brand-primary transition-all focus:outline-none focus:border-brand-primary w-full sm:w-auto"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>
                                        Year {year}
                                    </option>
                                ))}
                            </select>
                            <AiOutlineDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/members')}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm w-full sm:w-auto"
                    >
                        <AiOutlineUserAdd size={16} className="sm:w-5 sm:h-5" />
                        <span className="font-black">NEW MEMBER</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <Card
                    title="Members"
                    value={stats.totalMembers}
                    subtitle={`${stats.activeMembers} active`}
                    icon={<AiOutlineTeam size={20} className="sm:w-6 sm:h-6" />}
                    gradient="from-blue-500 to-cyan-500"
                />
                <Card
                    title="Students"
                    value={stats.students}
                    subtitle={`${stats.totalMembers > 0 ? ((stats.students / stats.totalMembers) * 100).toFixed(1) : 0}%`}
                    icon={<AiOutlineFileText size={20} className="sm:w-6 sm:h-6" />}
                    gradient="from-purple-500 to-pink-500"
                />
                <Card
                    title="Workers"
                    value={stats.workers}
                    subtitle={`${stats.totalMembers > 0 ? ((stats.workers / stats.totalMembers) * 100).toFixed(1) : 0}%`}
                    icon={<AiOutlineTeam size={20} className="sm:w-6 sm:h-6" />}
                    gradient="from-orange-500 to-red-500"
                />
                <Card
                    title="Contributions"
                    value={formatCurrency(stats.totalDue)}
                    subtitle={`Year ${selectedYear}`}
                    icon={<AiOutlineDollar size={20} className="sm:w-6 sm:h-6" />}
                    gradient="from-green-500 to-emerald-500"
                />
            </div>

            {/* Annual Collection Chart */}
            <AnnualCollectionChart
                selectedYear={selectedYear}
                totalPaid={stats.totalPaid}
                totalDue={stats.totalDue}
                remaining={stats.totalRemaining}
                monthlyData={monthlyData}
            />

            {/* Two columns layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border-2 border-b-8 border-gray-200 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className={`${THEME.font.h2} text-base md:text-xl flex items-center gap-2`}>
                            <AiOutlineWarning className="text-red-500 text-base md:text-xl" />
                            CRITICAL DELAYS
                        </h2>
                        <span className="text-[10px] md:text-sm font-black text-gray-400">
                            {stats.atRisk.length} member(s)
                        </span>
                    </div>

                    {stats.atRisk.length === 0 ? (
                        <div className="text-center py-8 md:py-12 opacity-50">
                            <AiOutlineCheckCircle size={32} className="sm:w-12 sm:h-12 mx-auto mb-3 md:mb-4 text-green-500" />
                            <p className="font-black text-xs sm:text-sm">No payment delays</p>
                        </div>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            {stats.atRisk.map((item, index) => (
                                <RiskMemberCard
                                    key={item.id}
                                    index={index}
                                    name={item.memberName}
                                    amount={item.amount}
                                    remaining={item.remaining}
                                    onClick={() => navigate(`/admin/finance?member=${item.memberId}&year=${selectedYear}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-linear-to-br from-brand-primary to-orange-600 rounded-2xl md:rounded-3xl border-2 border-black p-4 md:p-6 text-white">
                    <h2 className={`${THEME.font.h2} text-base md:text-xl mb-4 md:mb-6 flex items-center gap-2`}>
                        <AiOutlineCalendar size={16} className="md:w-5 md:h-5" /> 
                        QUICK ACTIONS
                    </h2>

                    <div className="space-y-3 md:space-y-4">
                        <QuickActionButton
                            title="Manage Members"
                            onClick={() => navigate('/admin/members')}
                            icon={<AiOutlineTeam size={16} className="md:w-5 md:h-5" />}
                        />
                        <QuickActionButton
                            title="Manage Contributions"
                            onClick={() => navigate(`/admin/finance?year=${selectedYear}`)}
                            icon={<AiOutlineDollar size={16} className="md:w-5 md:h-5" />}
                        />
                        <QuickActionButton
                            title="Generate Report"
                            onClick={() => navigate(`/admin/finance?report=true&year=${selectedYear}`)}
                            icon={<AiOutlineFileText size={16} className="md:w-5 md:h-5" />}
                        />
                    </div>

                    <div className="mt-6 md:mt-8 p-3 md:p-4 bg-white/10 rounded-xl md:rounded-2xl border-2 border-white/20">
                        <p className="text-[8px] md:text-[10px] font-black uppercase mb-1">System Status</p>
                        <p className="text-[10px] md:text-xs font-medium">
                            ✓ Synchronized • {new Date().toLocaleTimeString('en-US')}
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
        className="w-full flex items-center justify-between p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl border-2 border-white/20 transition-all group"
    >
        <span className="font-black uppercase text-xs md:text-sm">{title}</span>
        <div className="group-hover:translate-x-1 transition-transform">
            {icon}
        </div>
    </button>
);

export default AdminDashboard;