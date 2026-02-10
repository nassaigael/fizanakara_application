import React, { useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	AiOutlineArrowRight, 
	AiOutlineGlobal,
	AiOutlineWarning,
	AiOutlineSearch, 
	AiOutlineClose,
	AiOutlineTeam,
	AiOutlineCalendar,
	AiOutlineDollar,
	AiOutlineAreaChart,
	AiOutlineUserAdd,
	AiOutlineFlag,
	AiOutlineFire,
	AiOutlineTrophy,
	AiOutlineRise
} from 'react-icons/ai';
import { GiMoneyStack } from 'react-icons/gi';

// Hooks
import { useMembers } from '../hooks/useMembers';
import { useFinance } from '../hooks/useFinance';

// Types
import { PersonResponseModel } from '../lib/types/models/person.models.types';
import { ContributionResponseModel } from '../lib/types/models/contribution.models.types';

// Interface pour les stats du district
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
		
		// Calculs financiers
		const totalPaid = contributions.reduce((acc: number, curr: ContributionResponseModel) => 
			acc + (curr.totalPaid || 0), 0
		);
		const totalRemaining = contributions.reduce((acc: number, curr: ContributionResponseModel) => 
			acc + (curr.remaining || 0), 0
		);
		const totalExpected = totalPaid + totalRemaining;
		const progressPercent = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
		
		// Membres à jour
		const upToDateMembers = contributions.filter(c => (c.remaining || 0) === 0).length;
		const lateMembers = contributions.filter(c => (c.remaining || 0) > 0).length;
		
		// Top 5 des retards
		const atRisk = [...contributions]
			.filter((c: ContributionResponseModel) => (c.remaining || 0) > 0)
			.sort((a, b) => (b.remaining || 0) - (a.remaining || 0))
			.slice(0, 5);
		
		// Contribution moyenne
		const avgContribution = membersAtYear.length > 0 ? 
			totalExpected / membersAtYear.length : 0;
		
		// Districts avec statistiques
		const districtStats = membersAtYear.reduce((acc: Record<string, DistrictStats>, member: PersonResponseModel) => {
			if (member.districtName) {
				if (!acc[member.districtName]) {
					acc[member.districtName] = { count: 0, contributions: 0 };
				}
				acc[member.districtName].count += 1;
			}
			return acc;
		}, {});
		
		// Top district
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
			districts: Object.keys(districtStats),
			topDistrict: topDistrictInfo,
			tributes: Array.from(new Set(membersAtYear.map((m: PersonResponseModel) => m.tributeName).filter(Boolean))),
		};
	}, [allMembers, contributions]);

	const streakDays = 7;

	return (
		<div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8">
			{/* --- HEADER ANIMÉ STYLE DUOLINGO --- */}
			<header className="mb-8 animate-fadeIn">
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
					<div className="flex items-center gap-4">
						<div className="relative w-20 h-20 bg-linear-to-br from-red-500 via-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300 hover:rotate-3">
							<GiMoneyStack className="text-white text-3xl" />
							<div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
								<AiOutlineTrophy className="text-yellow-800 text-sm" />
							</div>
						</div>
						<div>
							<h1 className="font-black text-4xl md:text-5xl bg-linear-to-r from-red-600 to-orange-600 bg-clip-text text-transparent tracking-tight">
								Tableau de Bord
							</h1>
							<div className="flex items-center gap-3 mt-3">
								<div className="px-4 py-2 bg-white rounded-2xl flex items-center gap-2 shadow-md border-2 border-red-100 hover:shadow-lg transition-shadow">
									<AiOutlineCalendar className="text-red-600" size={18} />
									<span className="text-sm font-black text-gray-800">Année {selectedYear}</span>
								</div>
								<div className="px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 rounded-2xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105">
									<AiOutlineFire className="text-white animate-pulse" size={18} />
									<span className="text-sm font-black text-white">{streakDays} jours 🔥</span>
								</div>
							</div>
						</div>
					</div>
					
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 w-full lg:w-auto">
	<div className="flex flex-col sm:flex-row gap-2">
		<div className="flex-1 min-w-0">
			<div className="relative">
				<AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
				<input
					type="text"
					placeholder="Rechercher un membre..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="
						w-full
						pl-10 pr-4 py-2.5
						rounded-lg
						border-0
						focus:outline-none
						focus:ring-1 focus:ring-red-500
						bg-gray-50
						text-gray-900
						placeholder-gray-400
						transition-colors
					"
				/>
				{searchTerm && (
					<button
						onClick={() => setSearchTerm("")}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<AiOutlineClose size={16} />
					</button>
				)}
			</div>
		</div>
		
		<div className="w-full sm:w-40">
			<div className="relative">
				<AiOutlineCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
				<select
					value={selectedYear}
					onChange={(e) => setSelectedYear(Number(e.target.value))}
					className="
						w-full
						pl-10 pr-4 py-2.5
						rounded-lg
						border-0
						focus:outline-none
						focus:ring-1 focus:ring-red-500
						bg-gray-50
						text-gray-900
						appearance-none
						transition-colors
						font-medium
					"
				>
					{[...Array(5)].map((_, i) => {
						const y = new Date().getFullYear() - i;
						return (
							<option key={y} value={y}>
								{y}
							</option>
						);
					})}
				</select>
				<div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
					<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>
		</div>
	</div>
</div>
				</div>
				
				{/* TABS AMÉLIORÉS STYLE DUOLINGO */}
				<div className="gap-3 p-2 bg-white rounded-3xl border-2 border-gray-200 shadow-lg inline-flex">
					<button 
						onClick={() => setActiveTab('overview')}
						className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase transition-all duration-300 ${activeTab === 'overview' 
							? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105' 
							: 'text-gray-600 hover:bg-gray-50'}`}
					>
						Vue d'ensemble
					</button>
					<button 
						onClick={() => setActiveTab('finance')}
						className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase transition-all duration-300 ${activeTab === 'finance' 
							? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105' 
							: 'text-gray-600 hover:bg-gray-50'}`}
					>
						Finance
					</button>
					<button 
						onClick={() => setActiveTab('members')}
						className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase transition-all duration-300 ${activeTab === 'members' 
							? 'bg-linear-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105' 
							: 'text-gray-600 hover:bg-gray-50'}`}
					>
						Membres
					</button>
				</div>
			</header>

			{/* --- PROGRESS BAR ANIMÉE STYLE DUOLINGO --- */}
			<div className="mb-8 bg-white rounded-3xl p-8 border-3 border-gray-200 shadow-xl hover:shadow-2xl transition-shadow">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
							<AiOutlineRise className="text-red-500" size={24} />
							Progression de la collecte
						</h3>
						<p className="text-sm text-gray-500 mt-1 font-semibold">Objectif annuel {selectedYear}</p>
					</div>
					<div className="text-right bg-linear-to-br from-red-50 to-orange-50 px-6 py-4 rounded-2xl border-2 border-red-200">
						<p className="text-3xl font-black bg-linear-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
							{Math.round(stats.progressPercent)}%
						</p>
						<p className="text-xs text-gray-600 font-bold mt-1">
							{stats.totalPaid.toLocaleString()} / {stats.totalExpected.toLocaleString()} Ar
						</p>
					</div>
				</div>
				
				<div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
					<div 
						className="h-full rounded-full bg-linear-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-1000 ease-out relative overflow-hidden"
						style={{ width: `${stats.progressPercent}%` }}
					>
						<div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
					</div>
					{stats.progressPercent > 10 && (
						<div 
							className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000"
							style={{ left: `${Math.min(stats.progressPercent - 5, 92)}%` }}
						>
							<div className="bg-white px-3 py-1 rounded-full shadow-lg border-2 border-orange-400">
								<span className="text-xs font-black text-orange-600">{Math.round(stats.progressPercent)}%</span>
							</div>
						</div>
					)}
				</div>
				
				<div className="flex justify-between mt-3 text-xs font-bold">
					<span className="text-gray-500 flex items-center gap-1">
						<div className="w-2 h-2 bg-gray-400 rounded-full" />
						Début
					</span>
					<span className="text-green-600 flex items-center gap-1">
						Objectif
						<div className="w-2 h-2 bg-green-500 rounded-full" />
					</span>
				</div>
			</div>

			{/* --- CARTES STATISTIQUES AMÉLIORÉES --- */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<StatCard 
					title="Membres Inscrits" 
					value={stats.totalMembers} 
					sub={`✓ ${stats.upToDateMembers} à jour`}
					icon={<AiOutlineTeam size={28} />}
					gradient="from-red-500 to-pink-500"
					accentColor="red"
				/>
				<StatCard 
					title="Encaissé" 
					value={`${stats.totalPaid.toLocaleString()}`} 
					sub="Ariary"
					icon={<AiOutlineDollar size={28} />}
					gradient="from-green-500 to-emerald-500"
					accentColor="green"
				/>
				<StatCard 
					title="En attente" 
					value={`${stats.totalRemaining.toLocaleString()}`} 
					sub={`${stats.lateMembers} retards`}
					icon={<AiOutlineWarning size={28} />}
					gradient="from-orange-500 to-amber-500"
					accentColor="orange"
				/>
				<StatCard 
					title="Moyenne" 
					value={`${Math.round(stats.avgContribution).toLocaleString()}`} 
					sub="Ar / membre"
					icon={<AiOutlineAreaChart size={28} />}
					gradient="from-purple-500 to-indigo-500"
					accentColor="purple"
				/>
			</div>

			{/* --- CONTENU PRINCIPAL --- */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Section retards critiques améliorée */}
				<div className="lg:col-span-8 bg-white rounded-3xl p-8 border-3 border-gray-200 shadow-xl">
					<div className="flex justify-between items-center mb-8">
						<h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
							<div className="p-3 bg-linear-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
								<AiOutlineWarning className="text-white" size={24} />
							</div>
							Retards critiques
						</h3>
						<div className="flex items-center gap-3">
							<span className="px-5 py-2 bg-linear-to-r from-red-100 to-orange-100 text-red-700 rounded-full text-sm font-black border-2 border-red-200">
								{stats.atRisk.length} membres
							</span>
						</div>
					</div>

					{stats.atRisk.length > 0 ? (
						<div className="space-y-4">
							{stats.atRisk.map((c: ContributionResponseModel, index: number) => (
								<div 
									key={c.id} 
									className="group relative flex items-center justify-between p-6 bg-linear-to-r from-red-50 via-orange-50 to-white rounded-2xl border-3 border-gray-200 hover:border-red-300 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
								>
									{/* Badge de position */}
									<div className="absolute -left-3 -top-3">
										<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg border-3 border-white
											${index === 0 ? 'bg-linear-to-br from-red-600 to-red-700' : 
											  index === 1 ? 'bg-linear-to-br from-orange-500 to-orange-600' : 
											  'bg-linear-to-br from-red-400 to-red-500'}`}>
											{index + 1}
										</div>
									</div>

									<div className="flex items-center gap-5 ml-4">
										<div className="w-14 h-14 bg-linear-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
											<AiOutlineTeam className="text-red-600" size={28} />
										</div>
										<div>
											<p className="font-black text-lg text-gray-900">{c.memberName}</p>
											<div className="flex items-center gap-3 mt-2">
												<span className="text-xs px-3 py-1.5 bg-white rounded-full font-bold text-gray-600 border-2 border-gray-200">
													District
												</span>
												<span className="text-xs text-gray-500 font-semibold">
													Total: {c.amount.toLocaleString()} Ar
												</span>
											</div>
										</div>
									</div>

									<div className="text-right bg-gradient-to-br from-red-100 to-orange-100 px-6 py-4 rounded-2xl border-2 border-red-200">
										<p className="text-2xl font-black text-red-600">-{c.remaining?.toLocaleString()}</p>
										<p className="text-xs text-red-500 mt-1 font-bold">Ariary</p>
									</div>

									{/* Indicateur hover */}
									<div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
										<AiOutlineArrowRight className="text-red-500" size={24} />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-16">
							<div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
								<AiOutlineTrophy className="text-white text-3xl" />
							</div>
							<h4 className="font-black text-xl text-gray-900 mb-2">Excellent travail ! 🎉</h4>
							<p className="text-gray-500 font-semibold">Aucun retard critique pour le moment</p>
						</div>
					)}
				</div>

				{/* Section actions rapides améliorée */}
				<div className="lg:col-span-4 flex flex-col gap-6">
					{/* Actions rapides */}
					<div className="bg-white rounded-3xl p-6 border-3 border-gray-200 shadow-xl">
						<h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
							<div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
								<AiOutlineFlag className="text-white" size={20} />
							</div>
							Actions rapides
						</h3>
						<div className="space-y-3">
							<ActionButton 
								icon={<AiOutlineTeam size={22} />}
								title="Gérer les membres"
								subtitle={`${stats.totalMembers} membres`}
								onClick={() => navigate('/admin/members')}
								color="red"
							/>
							
							<ActionButton 
								icon={<AiOutlineGlobal size={22} />}
								title="Cartographie"
								subtitle={`${stats.districts.length} districts`}
								onClick={() => setShowGeoModal(true)}
								color="blue"
							/>
							
							<ActionButton 
								icon={<AiOutlineDollar size={22} />}
								title="Collectes"
								subtitle={`${stats.lateMembers} retards`}
								onClick={() => navigate('/admin/contributions')}
								color="green"
							/>
							
							<ActionButton 
								icon={<AiOutlineUserAdd size={22} />}
								title="Nouveau membre"
								subtitle="Ajouter"
								onClick={() => navigate('/admin/members/add')}
								color="purple"
							/>
						</div>
					</div>
					
					{/* Widget top district amélioré */}
					<div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden border-3 border-red-400">
						{/* Décoration de fond */}
						<div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
						<div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
						
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-6">
								<h3 className="font-black text-lg flex items-center gap-2">
									<AiOutlineTrophy className="text-yellow-300" size={24} />
									District Leader
								</h3>
								<div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
									<span className="text-2xl">🏆</span>
								</div>
							</div>
							
							<p className="text-3xl font-black mb-3 drop-shadow-lg">{stats.topDistrict[0]}</p>
							<p className="text-lg opacity-90 font-bold mb-6">{stats.topDistrict[1]} membres actifs</p>
							
							<div className="relative w-full bg-red-400 rounded-full h-4 overflow-hidden shadow-inner">
								<div 
									className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 transition-all duration-1000 shadow-lg"
									style={{ width: stats.totalMembers > 0 ? `${(stats.topDistrict[1] / stats.totalMembers) * 100}%` : '0%' }}
								/>
							</div>
							<p className="text-xs mt-3 opacity-75 font-semibold">
								{stats.totalMembers > 0 ? Math.round((stats.topDistrict[1] / stats.totalMembers) * 100) : 0}% du total
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* MODAL GÉO AMÉLIORÉ */}
			{showGeoModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fadeIn">
					<div className="bg-white w-full max-w-5xl rounded-3xl p-8 border-3 border-gray-200 shadow-2xl animate-slideUp">
						<div className="flex justify-between items-center mb-8">
							<div>
								<h2 className="font-black text-3xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
									Carte des membres
								</h2>
								<p className="text-gray-500 font-semibold mt-1">Répartition géographique complète</p>
							</div>
							<button 
								onClick={() => setShowGeoModal(false)}
								className="p-4 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200 transition-all hover:scale-110 border-2 border-red-200"
							>
								<AiOutlineClose size={24} className="text-red-600" />
							</button>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Districts */}
							<div>
								<div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
									<h3 className="font-black text-xl text-gray-900 flex items-center gap-3">
										<div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
											<AiOutlineFlag className="text-white" size={20} />
										</div>
										Districts
									</h3>
									<span className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-2xl text-sm font-black border-2 border-red-200">
										{stats.districts.length}
									</span>
								</div>
								<div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
									{stats.districts.map((d: string, index: number) => (
										<div 
											key={d} 
											className="group p-5 bg-gradient-to-r from-red-50 via-orange-50 to-white rounded-2xl border-2 border-gray-200 hover:border-red-300 transition-all hover:shadow-lg hover:-translate-x-1 cursor-pointer"
										>
											<div className="flex justify-between items-center">
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
														<span className="font-black text-white">{index + 1}</span>
													</div>
													<span className="font-bold text-gray-900 text-lg">{d}</span>
												</div>
												<AiOutlineArrowRight className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
											</div>
										</div>
									))}
								</div>
							</div>
							
							{/* Tribus */}
							<div>
								<div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
									<h3 className="font-black text-xl text-gray-900 flex items-center gap-3">
										<div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
											<AiOutlineTeam className="text-white" size={20} />
										</div>
										Tribus
									</h3>
									<span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-2xl text-sm font-black border-2 border-blue-200">
										{stats.tributes.length}
									</span>
								</div>
								<div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
									{stats.tributes.map((t: string, index: number) => (
										<div 
											key={t} 
											className="group p-5 bg-linear-to-r from-blue-50 via-indigo-50 to-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg hover:translate-x-1 cursor-pointer"
										>
											<div className="flex justify-between items-center">
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
														<span className="font-black text-white">{index + 1}</span>
													</div>
													<span className="font-bold text-gray-900 text-lg">{t}</span>
												</div>
												<button className="text-xs px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all font-bold opacity-0 group-hover:opacity-100">
													Voir
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Styles CSS personnalisés */}
			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				
				@keyframes slideUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				
				@keyframes shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(100%); }
				}
				
				.animate-fadeIn {
					animation: fadeIn 0.3s ease-out;
				}
				
				.animate-slideUp {
					animation: slideUp 0.4s ease-out;
				}
				
				.animate-shimmer {
					animation: shimmer 2s infinite;
				}
				
				.custom-scrollbar::-webkit-scrollbar {
					width: 8px;
				}
				
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f1f1f1;
					border-radius: 10px;
				}
				
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: linear-gradient(to bottom, #ef4444, #f97316);
					border-radius: 10px;
				}
				
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: linear-gradient(to bottom, #dc2626, #ea580c);
				}
			`}</style>
		</div>
	);
};

// Composant StatCard amélioré
interface StatCardProps {
	title: string;
	value: string | number;
	sub: string;
	icon: React.ReactNode;
	gradient: string;
	accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, gradient }) => {

	return (
		<div className="group bg-white rounded-3xl p-6 border-3 border-gray-200 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
			<div className="flex justify-between items-start mb-4">
				<div>
					<p className="text-3xl font-black text-gray-900 mb-2">{value}</p>
					<p className="text-sm font-bold text-gray-700">{title}</p>
				</div>
				<div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
					<div className="text-white">{icon}</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
				<p className="text-xs text-gray-600 font-bold">{sub}</p>
			</div>
		</div>
	);
};

// Composant ActionButton
interface ActionButtonProps {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	onClick: () => void;
	color: 'red' | 'blue' | 'green' | 'purple';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, subtitle, onClick, color }) => {
	const colorClasses = {
		red: {
			bg: 'from-red-500 to-pink-500',
			light: 'from-red-50 to-pink-50',
			border: 'border-red-200',
			text: 'text-red-600'
		},
		blue: {
			bg: 'from-blue-500 to-indigo-500',
			light: 'from-blue-50 to-indigo-50',
			border: 'border-blue-200',
			text: 'text-blue-600'
		},
		green: {
			bg: 'from-green-500 to-emerald-500',
			light: 'from-green-50 to-emerald-50',
			border: 'border-green-200',
			text: 'text-green-600'
		},
		purple: {
			bg: 'from-purple-500 to-indigo-500',
			light: 'from-purple-50 to-indigo-50',
			border: 'border-purple-200',
			text: 'text-purple-600'
		}
	};

	const colors = colorClasses[color];

	return (
		<button 
			onClick={onClick}
			className={`group w-full p-5 rounded-2xl bg-gradient-to-r ${colors.light} border-2 ${colors.border} hover:shadow-lg transition-all hover:-translate-y-1 hover:scale-[1.02]`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className={`p-3 bg-gradient-to-br ${colors.bg} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
						<div className="text-white">{icon}</div>
					</div>
					<div className="text-left">
						<p className="font-black text-sm text-gray-900">{title}</p>
						<p className="text-xs text-gray-600 font-semibold mt-0.5">{subtitle}</p>
					</div>
				</div>
				<AiOutlineArrowRight className={`${colors.text} group-hover:translate-x-2 transition-transform`} size={20} />
			</div>
		</button>
	);
};

export default memo(Dashboard);