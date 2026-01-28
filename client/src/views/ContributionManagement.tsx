import React, { useState, memo } from "react";
import { AiOutlineSearch, AiOutlineDollar, AiOutlineCheck, AiOutlineUser } from "react-icons/ai";
import { useContribution } from "../hooks/useContribution";
import { usePayment } from "../hooks/usePayment";
import { THEME } from "../styles/theme";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";

const ContributionManagement: React.FC = () => {
	const { contributions, search, setSearch, refresh, loading } = useContribution();
	const { processPayment, isSubmitting } = usePayment(refresh);
	const [inputAmounts, setInputAmounts] = useState<Record<string, string>>({});

	const handleAmountChange = (id: string, value: string) => {
		setInputAmounts(prev => ({ ...prev, [id]: value }));
	};
	const TABLE_HEADERS = [
		{ label: "Membre", align: "text-left" },
		{ label: "Total Dû", align: "text-center" },
		{ label: "Déjà Payé", align: "text-center" },
		{ label: "Reste à percevoir", align: "text-center" },
		{ label: "Encaisser", align: "text-right" },
	];

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className={`${THEME.font.black} text-3xl tracking-tighter`}>
						Saisie des Cotisations
					</h1>
					<p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1">
						Année Scolaire / Exercice {new Date().getFullYear()}
					</p>
				</div>
				<div className="flex items-center gap-3 px-6 py-3 bg-brand-primary/5 border-2 border-brand-primary border-b-4 rounded-2xl">
					<AiOutlineUser className="text-brand-primary" size={20} />
					<span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
						{contributions.length} Membres éligibles
					</span>
				</div>
			</div>
			<div className="w-full max-w-2xl">
				<Input
					placeholder="Rechercher un membre par nom..."
					icon={<AiOutlineSearch size={22} />}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="rounded-3xl! shadow-sm"
				/>
			</div>

			<div className="bg-white dark:bg-brand-border-dark rounded-[2.5rem] border-2 border-brand-border border-b-8 overflow-hidden shadow-2xl">
				<div className="overflow-x-auto custom-scrollbar">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-brand-bg/50 border-b-2 border-brand-border">
								{TABLE_HEADERS.map((header, index) => (
									<th
										key={index}
										className={`p-6 text-[9px] font-black uppercase text-brand-muted tracking-[0.2em] ${header.align}`}
									>
										{header.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y-2 divide-brand-bg">
							{contributions.map((c) => (
								<tr key={c.id} className="group hover:bg-brand-primary/5 transition-colors">
									<td className="p-6">
										<div className={`${THEME.font.black} text-[11px] text-brand-text group-hover:text-brand-primary transition-colors`}>
											{c.memberName}
										</div>
										<div className={`text-[8px] font-black uppercase mt-1 ${c.remaining === 0 ? 'text-green-500' : 'text-brand-muted'}`}>
											{c.remaining === 0 ? '● Dossier Soldé' : '○ En attente'}
										</div>
									</td>

									<td className="p-6 text-center">
										<span className="font-black text-xs">{c.amount.toLocaleString()}</span>
										<span className="text-[8px] ml-1 opacity-40">AR</span>
									</td>

									<td className="p-6 text-center">
										<span className="font-black text-xs text-green-600">+{c.totalPaid.toLocaleString()}</span>
									</td>

									<td className="p-6 text-center">
										<span className={`px-4 py-1.5 rounded-xl font-black text-[10px] ${c.remaining > 0
											? 'bg-red-50 text-red-500 border border-red-100'
											: 'bg-green-50 text-green-600 border border-green-100'
											}`}>
											{c.remaining === 0 ? "PAYÉ" : `${c.remaining.toLocaleString()} Ar`}
										</span>
									</td>

									<td className="p-6">
										<div className="flex gap-3 justify-end items-center">
											<Input
												type="number"
												placeholder="Montant..."
												disabled={c.remaining === 0 || isSubmitting}
												className="w-32! py-2! rounded-xl! text-xs! bg-brand-bg/50!"
												value={inputAmounts[c.id] || ""}
												onChange={(e) => handleAmountChange(c.id, e.target.value)}
											/>
											<Button
												onClick={() => {
													processPayment(c, Number(inputAmounts[c.id]));
													handleAmountChange(c.id, "");
												}}
												disabled={!inputAmounts[c.id] || c.remaining === 0}
												isLoading={isSubmitting}
												className="p-3! rounded-xl!"
											>
												{!isSubmitting && <AiOutlineCheck size={18} />}
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default memo(ContributionManagement);