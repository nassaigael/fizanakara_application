import React, { useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	AiOutlineArrowRight, AiOutlineGlobal,
	AiOutlineCheckCircle, AiOutlineWarning,
	AiOutlineCalendar, AiOutlineSearch, AiOutlineClose
} from 'react-icons/ai';
import { useMemberLogic } from '../hooks/useMembers';
import { useContribution } from '../hooks/useContribution';
import { THEME } from '../styles/theme';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';

const Dashboard: React.FC = () => {
	const navigate = useNavigate();
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const { allMembers } = useMemberLogic();
	const { contributions } = useContribution(selectedYear);
	const [searchTerm, setSearchTerm] = useState("");
	const [showGeoModal, setShowGeoModal] = useState(false);

	const stats = useMemo(() => {
		const membersAtYear = allMembers.filter(m => {
			const creationYear = new Date(m.createdAt).getFullYear();
			return creationYear <= selectedYear;
		});
		const totalPaid = contributions.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
		const totalRemaining = contributions.reduce((acc, curr) => acc + (curr.remaining || 0), 0);
		const totalExpected = totalPaid + totalRemaining;
		const progressPercent = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
		const atRisk = [...contributions]
			.filter(c => c.remaining > 0)
			.sort((a, b) => b.remaining - a.remaining)
			.slice(0, 5);

		return {
			totalMembers: membersAtYear.length,
			totalPaid,
			totalRemaining,
			progressPercent,
			atRisk,
			districts: Array.from(new Set(membersAtYear.map(m => m.districtName))),
			tributes: Array.from(new Set(membersAtYear.map(m => m.tributeName))),
		};
	}, [allMembers, contributions, selectedYear]);

	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col lg:flex-row justify-between items-center gap-6">
				<div>
					<h1 className={`${THEME.font.black} text-4xl tracking-tighter uppercase`}>
						Vue d'ensemble
					</h1>
					<div className="flex items-center gap-3 mt-4 w-48">
						<Select
							label="Exercice"
							value={selectedYear}
							onChange={(e) => setSelectedYear(Number(e.target.value))}
							options={[...Array(5)].map((_, i) => {
								const y = new Date().getFullYear() - i;
								return { value: y, label: y.toString() };
							})}
						/>
					</div>
				</div>

				<div className="w-full max-w-md">
					<Input
						placeholder="Rechercher un membre..."
						icon={<AiOutlineSearch size={22} />}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</header>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white dark:bg-brand-border-dark border-2 border-brand-border border-b-8 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
					<div className="relative w-20 h-20 mb-4">
						<svg className="w-full h-full" viewBox="0 0 36 36">
							<circle cx="18" cy="18" r="16" fill="none" className="stroke-brand-bg dark:stroke-white/5" strokeWidth="4"></circle>
							<circle cx="18" cy="18" r="16" fill="none" className="stroke-brand-primary" strokeWidth="4"
								strokeDasharray={`${stats.progressPercent}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
						</svg>
						<div className={`${THEME.font.black} absolute inset-0 flex items-center justify-center text-brand-primary text-sm`}>
							{Math.round(stats.progressPercent)}%
						</div>
					</div>
					<p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Objectif Collecte</p>
				</div>

				<StatCard title="Inscrits" value={stats.totalMembers} sub={`Membres en ${selectedYear}`} />
				<StatCard title="Encaissé" value={`${stats.totalPaid.toLocaleString()} Ar`} sub="Flux réel" variant="primary" />
				<StatCard title="Restant" value={`${stats.totalRemaining.toLocaleString()} Ar`} sub="À percevoir" color="text-orange-500" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">				<div className="lg:col-span-7 bg-white dark:bg-brand-border-dark border-2 border-brand-border border-b-8 rounded-[3rem] p-8 shadow-xl">
				<div className="flex justify-between items-center mb-8">
					<h3 className={`${THEME.font.black} text-sm flex items-center gap-2 uppercase`}>
						<AiOutlineWarning className="text-orange-500" size={20} /> Retards de paiement
					</h3>
					<span className="text-[8px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">Top 5</span>
				</div>

				<div className="space-y-4">
					{stats.atRisk.length > 0 ? stats.atRisk.map((c, i) => (
						<div key={i} className="flex items-center justify-between p-4 bg-brand-bg/40 rounded-2xl border-2 border-transparent hover:border-brand-primary/20 transition-all group">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-brand-primary border-2 border-brand-border group-hover:rotate-6 transition-transform">
									{i + 1}
								</div>
								<div>
									<p className="font-black text-[11px] uppercase text-brand-text">{c.memberName}</p>
									<p className="text-[8px] text-brand-muted font-black uppercase">Total dû : {c.amount.toLocaleString()} Ar</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-xs font-black text-red-600">-{c.remaining.toLocaleString()} Ar</p>
								<p className="text-[7px] font-black text-brand-muted uppercase opacity-50">En attente</p>
							</div>
						</div>
					)) : (
						<div className="text-center py-10 opacity-50">
							<AiOutlineCheckCircle size={40} className="mx-auto text-green-500 mb-2" />
							<p className="text-[10px] font-black uppercase tracking-widest">Tout est en ordre</p>
						</div>
					)}
				</div>
			</div>
				<div className="lg:col-span-5 flex flex-col gap-6">
					<Button
						variant="secondary"
						onClick={() => navigate('/members')}
						className="p-6! rounded-3xl! border-b-8! flex items-center justify-between group"
					>
						<span className="text-[10px] font-black uppercase tracking-widest">Base de données</span>
						<AiOutlineArrowRight className="group-hover:translate-x-2 transition-transform" />
					</Button>

					<Button
						variant="secondary"
						onClick={() => setShowGeoModal(true)}
						className="p-6! rounded-3xl! border-b-8! flex items-center justify-between group"
					>
						<div className="text-left">
							<span className="text-[10px] font-black uppercase tracking-widest block">Secteurs Géo</span>
							<span className="text-[8px] text-brand-muted font-black uppercase">{stats.districts.length} Districts / {stats.tributes.length} Tribus</span>
						</div>
						<AiOutlineGlobal size={24} className="text-brand-primary group-hover:rotate-12 transition-transform" />
					</Button>

					<div className="bg-brand-text p-8 rounded-[3rem] text-white border-b-8 border-black/30 space-y-6">
						<div className="flex items-center justify-between">
							<h4 className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
								<AiOutlineCalendar className="text-brand-primary" /> Flux mensuel
							</h4>
							<span className="text-[8px] opacity-40 uppercase font-black">{selectedYear}</span>
						</div>
						<div className="h-24 flex items-end gap-2 px-2">
							{[40, 70, 45, 90, 65, 85, 40, 55].map((h, i) => (
								<div key={i} className="flex-1 bg-white/10 rounded-t-md relative group overflow-hidden">
									<div className="absolute bottom-0 w-full bg-brand-primary rounded-t-md transition-all duration-700" style={{ height: `${h}%` }} />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			{showGeoModal && (
				<div className="fixed inset-0 bg-brand-text/60 backdrop-blur-md z-100 flex items-center justify-center p-6">
					<div className="bg-white dark:bg-brand-border-dark w-full max-w-xl rounded-[3rem] shadow-2xl p-10 border-2 border-brand-border border-b-8 animate-in zoom-in-95 duration-300">
						<div className="flex justify-between items-center mb-8">
							<h2 className={`${THEME.font.black} text-xl uppercase tracking-tighter`}>Répertoire Géo</h2>
							<button onClick={() => setShowGeoModal(false)} className="p-2 hover:bg-brand-bg rounded-full transition-colors"><AiOutlineClose size={24} /></button>
						</div>
						<div className="grid grid-cols-2 gap-8">
							<div>
								<p className="text-[9px] font-black text-brand-primary uppercase mb-4 tracking-[0.2em]">Districts</p>
								<div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
									{stats.districts.map(d => <div key={d} className="p-3 bg-brand-bg/50 rounded-xl text-[10px] font-black border-2 border-brand-border uppercase">{d}</div>)}
								</div>
							</div>
							<div>
								<p className="text-[9px] font-black text-brand-muted uppercase mb-4 tracking-[0.2em]">Tribus</p>
								<div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
									{stats.tributes.map(t => <div key={t} className="p-3 bg-brand-bg/50 rounded-xl text-[10px] font-black border-2 border-brand-border uppercase">{t}</div>)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const StatCard = ({ title, value, sub, variant = "secondary", color, icon }: any) => (
	<div className={`
        p-8 rounded-[2.5rem] border-2 border-b-8 transition-all
        ${variant === 'primary'
			? 'bg-brand-primary border-brand-primary text-white shadow-[0_8px_0_0_#b91c1c]'
			: 'bg-white dark:bg-brand-border-dark border-brand-border shadow-sm'
		}
    `}>
		<p className={`text-2xl ${THEME.font.black} ${color || ''}`}>{value}</p>
		<p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${variant === 'primary' ? 'opacity-70' : 'text-brand-muted'}`}>{title}</p>
		<div className={`h-0.5 w-8 my-3 ${variant === 'primary' ? 'bg-white/30' : 'bg-brand-primary/20'}`} />
		<p className={`text-[8px] font-bold uppercase italic ${variant === 'primary' ? 'opacity-50' : 'text-brand-muted/60'}`}>{sub}</p>
	</div>
);

export default memo(Dashboard);