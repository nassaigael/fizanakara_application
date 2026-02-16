import React, { useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AiOutlineArrowRight, 
    AiOutlineGlobal,
    AiOutlineWarning,
    AiOutlineSearch, 
    AiOutlineTeam,
    AiOutlineCalendar,
    AiOutlineDollar,
    AiOutlineAreaChart,
    AiOutlineUserAdd,
    AiOutlineFlag,
    AiOutlineFire,
    AiOutlineTrophy,
    AiOutlineRise,
    AiOutlineClose,
    AiOutlineUser
} from 'react-icons/ai';
import { GiMoneyStack } from 'react-icons/gi';

import { THEME } from '../styles/theme';
import { useMembers } from '../hooks/useMembers';
import { useFinance } from '../hooks/useFinance';
import { PersonResponseModel } from '../lib/types/models/person.models.types';

interface DistrictStats {
    count: number;
    contributions: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState("");
    const [showGeoModal, setShowGeoModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'members'>('overview');

    const { members: allMembers } = useMembers();
    const { contributions } = useFinance(undefined, selectedYear);

    const stats = useMemo(() => {
        const membersAtYear = allMembers;
        const totalPaid = contributions.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
        const totalRemaining = contributions.reduce((acc, curr) => acc + (curr.remaining || 0), 0);
        const totalExpected = totalPaid + totalRemaining;
        const progressPercent = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
        const upToDateMembers = contributions.filter(c => (c.remaining || 0) === 0).length;
        const lateMembers = contributions.filter(c => (c.remaining || 0) > 0).length;
        const atRisk = [...contributions]
            .filter((c) => (c.remaining || 0) > 0)
            .sort((a, b) => (b.remaining || 0) - (a.remaining || 0))
            .slice(0, 5);
        const avgContribution = membersAtYear.length > 0 ? totalExpected / membersAtYear.length : 0;
        const districtStats = membersAtYear.reduce((acc: Record<string, DistrictStats>, member: PersonResponseModel) => {
            if (member.districtName) {
                if (!acc[member.districtName]) acc[member.districtName] = { count: 0, contributions: 0 };
                acc[member.districtName].count += 1;
            }
            return acc;
        }, {});
        const topDistrict = Object.entries(districtStats).sort((a, b) => b[1].count - a[1].count)[0];
        const topDistrictInfo = topDistrict ? [topDistrict[0], topDistrict[1].count] as [string, number] : ['Aucun', 0] as [string, number];

        return {
            totalMembers: membersAtYear.length,
            totalPaid,
            totalRemaining,
            totalExpected,
            progressPercent,
            upToDateMembers,
            lateMembers,
            atRisk,
            avgContribution,
            districts: Object.entries(districtStats),
            topDistrict: topDistrictInfo,
        };
    }, [allMembers, contributions]);

    const streakDays = 7;

    return (
        <div className="min-h-screen bg-brand-bg p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {/* --- HEADER --- */}
            <header className="mb-8 animate-fadeIn">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div 
                            className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300 duo-card-primary group"
                            style={{ backgroundColor: 'var(--app-primary)' }}
                        >
                            <GiMoneyStack className="text-white text-2xl sm:text-3xl group-hover:scale-110 transition-transform" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
                                <AiOutlineTrophy className="text-yellow-800 text-xs sm:text-sm" />
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <h1 className={`${THEME.font.black} text-2xl sm:text-4xl md:text-5xl text-brand-text truncate`}>
                                Tableau de Bord
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-2xl flex items-center gap-2 shadow-sm border-2 border-brand-border duo-card">
                                    <AiOutlineCalendar className="text-brand-primary" size={16} />
                                    <span className="text-xs sm:text-sm font-black text-brand-text truncate">Année {selectedYear}</span>
                                </div>
                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-2 shadow-sm duo-card-primary">
                                    <AiOutlineFire className="text-white animate-pulse" size={16} />
                                    <span className="text-xs sm:text-sm font-black text-white">{streakDays} j 🔥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Recherche & Filtre Corrigé */}
					<div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
						{/* Barre de recherche utilisant THEME.input */}
						<div className="relative w-full sm:w-64 lg:w-80">
							<AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
							<input
								type="text"
								placeholder="Rechercher un membre..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className={`${THEME.input} pl-12 h-12`} // Utilisation du style global
							/>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm("")}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary"
								>
									<AiOutlineClose size={16} />
								</button>
							)}
						</div>

						{/* Select des années stylisé Duo */}
						<div className="relative w-full sm:w-44">
							<AiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted z-10" size={18} />
							<select
								value={selectedYear}
								onChange={(e) => setSelectedYear(Number(e.target.value))}
								className={`
									w-full h-12 cursor-pointer appearance-none
									bg-white border-2 border-brand-border border-b-4 
									rounded-xl pl-12 pr-10
									${THEME.font.bold} text-brand-text
									focus:border-brand-primary outline-none transition-all
									active:border-b-2 active:translate-y-0.5
								`}
							>
								{[...Array(5)].map((_, i) => {
									const y = new Date().getFullYear() - i;
									return (
										<option key={y} value={y} className="text-brand-text bg-white">
											Année {y}
										</option>
									);
								})}
							</select>
							{/* Flèche personnalisée pour garantir la visibilité */}
							<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>
					</div>
                </div>
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl sm:rounded-3xl border-2 border-brand-border shadow-lg w-full sm:w-fit duo-card">
                    {(['overview', 'finance', 'members'] as const).map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl ${THEME.font.black} text-[10px] sm:text-sm transition-all duration-300 ${
                                activeTab === tab 
                                    ? 'text-white shadow-lg duo-card-primary' 
                                    : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                            }`}
                        >
                            {tab === 'overview' ? 'Général' : tab === 'finance' ? 'Finance' : 'Membres'}
                        </button>
                    ))}
                </div>
            </header>

            {/* --- PROGRESS BAR --- */}
            <div className="mb-8 duo-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className={`${THEME.font.black} text-lg sm:text-xl text-brand-text flex items-center gap-2`}>
                            <div className="p-2 rounded-xl bg-brand-primary text-white shadow-sm">
                                <AiOutlineRise size={20} />
                            </div>
                            Collecte {selectedYear}
                        </h3>
                    </div>
                    <div className="text-left sm:text-right px-4 py-2 sm:px-6 sm:py-4 rounded-2xl border-2 border-brand-border bg-brand-bg w-full sm:w-auto duo-card">
                        <p className="text-2xl sm:text-3xl font-black text-brand-primary">
                            {Math.round(stats.progressPercent)}%
                        </p>
                        <p className="text-[10px] sm:text-xs text-brand-muted font-bold">
                            {stats.totalPaid.toLocaleString()} Ar encaissés
                        </p>
                    </div>
                </div>
                
                <div className="relative w-full bg-brand-border rounded-full h-6 sm:h-8 overflow-hidden shadow-inner border-2 border-brand-border">
                    <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-inner"
                        style={{ 
                            width: `${stats.progressPercent}%`, 
                            backgroundColor: 'var(--app-primary)',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
                        }}
                    />
                </div>
            </div>

            {/* --- STAT CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard 
                    title="Membres" 
                    value={stats.totalMembers} 
                    sub={`${stats.upToDateMembers} à jour`} 
                    icon={<AiOutlineTeam size={24} />} 
                    gradient="from-red-500 to-orange-500" 
                />
                <StatCard 
                    title="Encaissé" 
                    value={`${stats.totalPaid.toLocaleString()}`} 
                    sub="Ariary" 
                    icon={<AiOutlineDollar size={24} />} 
                    gradient="from-green-500 to-emerald-500" 
                />
                <StatCard 
                    title="En attente" 
                    value={`${stats.totalRemaining.toLocaleString()}`} 
                    sub={`${stats.lateMembers} retards`} 
                    icon={<AiOutlineWarning size={24} />} 
                    gradient="from-orange-500 to-amber-500" 
                />
                <StatCard 
                    title="Moyenne" 
                    value={`${Math.round(stats.avgContribution).toLocaleString()}`} 
                    sub="Ar / membre" 
                    icon={<AiOutlineAreaChart size={24} />} 
                    gradient="from-purple-500 to-indigo-500" 
                />
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Retards critiques */}
                <div className="lg:col-span-8 duo-card">
                    <h3 className={`${THEME.font.black} text-lg sm:text-xl mb-6 flex items-center gap-3 text-brand-text`}>
                        <div className="p-2 sm:p-3 rounded-2xl shadow-lg text-white duo-card-primary">
                            <AiOutlineWarning size={20} />
                        </div>
                        Retards critiques
                    </h3>

                    <div className="space-y-3">
                        {stats.atRisk.length > 0 ? (
                            stats.atRisk.map((c, index) => (
                                <div key={c.id} className="group flex items-center justify-between p-4 sm:p-6 bg-brand-bg rounded-2xl border-2 border-brand-border hover:border-brand-primary transition-all cursor-pointer duo-card hover:shadow-lg">
                                    <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                                        <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${
                                            index === 0 ? 'bg-linear-to-br from-red-600 to-red-700' : 'bg-linear-to-br from-orange-500 to-amber-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-black text-sm sm:text-lg text-brand-text truncate">{c.memberName}</p>
                                            <p className="text-[10px] sm:text-xs text-brand-muted font-bold">Prévu: {c.amount.toLocaleString()} Ar</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <p className="text-sm sm:text-2xl font-black text-red-600">-{c.remaining?.toLocaleString()} Ar</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 duo-card">
                                <AiOutlineTrophy className="text-brand-primary text-5xl mx-auto mb-4 opacity-20" />
                                <p className="font-bold text-brand-muted">Aucun retard critique</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions rapides et Leader */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="duo-card">
                        <h3 className={`${THEME.font.black} mb-6 flex items-center gap-2 text-brand-text text-sm sm:text-base`}>
                            <div className="p-2 rounded-xl bg-brand-primary text-white shadow-sm">
                                <AiOutlineFlag size={18} />
                            </div>
                            Actions rapides
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            <ActionButton 
                                icon={<AiOutlineTeam />} 
                                title="Membres" 
                                subtitle={`${stats.totalMembers} membres`} 
                                onClick={() => navigate('/admin/members')} 
                            />
                            <ActionButton 
                                icon={<AiOutlineGlobal />} 
                                title="Zones" 
                                subtitle="Cartographie" 
                                onClick={() => setShowGeoModal(true)} 
                            />
                            <ActionButton 
                                icon={<AiOutlineDollar />} 
                                title="Collectes" 
                                subtitle="Suivi financier" 
                                onClick={() => navigate('/admin/contributions')} 
                            />
                            <ActionButton 
                                icon={<AiOutlineUserAdd />} 
                                title="Nouveau" 
                                subtitle="Ajouter un membre" 
                                onClick={() => navigate('/admin/members/add')} 
                            />
                        </div>
                    </div>
                    
                    <div className="duo-card-primary relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-black text-sm sm:text-lg flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-xl bg-yellow-400 text-yellow-800 shadow-sm">
                                    <AiOutlineTrophy size={20} />
                                </div>
                                District Leader
                            </h3>
                            <p className="text-2xl sm:text-3xl font-black mb-1 truncate">{stats.topDistrict[0]}</p>
                            <p className="text-xs sm:text-lg opacity-90 font-bold">{stats.topDistrict[1]} membres actifs</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showGeoModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-t-4xl sm:rounded-[2.5rem] border-4 border-brand-border w-full max-w-2xl overflow-hidden shadow-2xl duo-card">
                        <div className="p-5 sm:p-6 border-b-4 border-brand-border flex justify-between items-center bg-brand-bg rounded-t-4xl sm:rounded-t-[2.5rem]">
                            <h2 className={`${THEME.font.black} text-base sm:text-xl flex items-center gap-2`}>
                                <AiOutlineGlobal className="text-brand-primary" />
                                Districts
                            </h2>
                            <button 
                                onClick={() => setShowGeoModal(false)} 
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors duo-card"
                            >
                                <AiOutlineClose size={24} />
                            </button>
                        </div>
                        <div className="p-5 sm:p-8 max-h-[70vh] overflow-y-auto space-y-3">
                            {stats.districts.map(([name, data]) => (
                                <div key={name} className="duo-card flex justify-between items-center p-4 hover:border-brand-primary transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-brand-bg">
                                            <AiOutlineUser className="text-brand-primary" />
                                        </div>
                                        <span className="font-black text-brand-text text-sm">{name}</span>
                                    </div>
                                    <span className="bg-brand-primary text-white px-3 py-1 rounded-full font-black text-xs duo-card-primary">
                                        {data.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    sub: string; 
    icon: React.ReactNode; 
    gradient: string 
}> = ({ title, value, sub, icon, gradient }) => (
    <div className="duo-card hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className="overflow-hidden">
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-text mb-1 truncate">{value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider truncate">{title}</p>
            </div>
            <div className={`shrink-0 p-3 sm:p-4 rounded-2xl bg-linear-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
        <p className="text-[10px] font-black text-brand-muted flex items-center gap-1.5 uppercase truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> {sub}
        </p>
    </div>
);

const ActionButton: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    subtitle: string; 
    onClick: () => void 
}> = ({ icon, title, subtitle, onClick }) => (
    <button 
        onClick={onClick} 
        className="w-full p-4 rounded-2xl bg-brand-bg border-2 border-brand-border hover:border-brand-primary transition-all flex items-center justify-between group duo-card hover:shadow-md"
    >
        <div className="flex items-center gap-3 overflow-hidden text-left">
            <div className="shrink-0 p-2 sm:p-3 bg-white rounded-xl text-brand-primary shadow-sm group-hover:scale-110 transition-transform duo-card">
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="font-black text-[10px] sm:text-xs text-brand-text uppercase truncate">{title}</p>
                <p className="text-[9px] sm:text-[11px] text-brand-muted font-bold truncate">{subtitle}</p>
            </div>
        </div>
        <AiOutlineArrowRight className="text-brand-muted group-hover:text-brand-primary ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
    </button>
);

export default memo(Dashboard);