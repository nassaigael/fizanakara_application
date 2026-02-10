import React, { useState, useEffect } from 'react';
import { AiOutlineGlobal, AiOutlineTeam, AiOutlineDelete, AiOutlineBulb, AiOutlinePlus } from 'react-icons/ai';
import DistrictService from '../../../services/district.services';
import TributeService  from '../../../services/tribute.services';
import { isNonEmpty } from '../../../lib/helper/validationHelpers';
import { DistrictModel, TributeModel } from '../../../lib/types/models/localisation.models.types';
import Button from '../../ui/Button';
import ActionBtn from '../../ui/ActionBtn';
import toast from 'react-hot-toast';

const ManageOrganization: React.FC = () => {
	const [districts, setDistricts] = useState<DistrictModel[]>([]);
	const [tributes, setTributes] = useState<TributeModel[]>([]);
	const [loading, setLoading] = useState(false);
	const [rawDistricts, setRawDistricts] = useState('');
	const [rawTributes, setRawTributes] = useState('');

	const loadData = async () => {
		try {
			const [d, t] = await Promise.allSettled([
				DistrictService.getAll(),
				TributeService.getAll()
			]);
			if (d.status === 'fulfilled') setDistricts(d.value);
			if (t.status === 'fulfilled') setTributes(t.value);
		} catch (err) {
			console.error("Data synchronization error");
		}
	};

	useEffect(() => { loadData(); }, []);

	const handleBulkAdd = async (type: 'district' | 'tribute') => {
		const value = type === 'district' ? rawDistricts : rawTributes;
		if (!isNonEmpty(value)) return;

		const names = value.split(/[,\n]/).map(n => n.trim()).filter(n => isNonEmpty(n));
		if (names.length === 0) return;

		setLoading(true);
		const toastId = toast.loading(`Création de ${names.length} éléments...`);

		try {
			for (const name of names) {
				type === 'district'
					? await DistrictService.create({ name })
					: await TributeService.create({ name });
			}
			toast.success(`${type === 'district' ? 'Districts' : 'Tribus'} ajoutés !`, { id: toastId });
			type === 'district' ? setRawDistricts('') : setRawTributes('');
			loadData();
		} catch (err: any) {
			const msg = err.response?.status === 403
				? "Accès refusé : Droits administrateur requis."
				: "Erreur lors de l'opération";
			toast.error(msg, { id: toastId });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number, type: 'district' | 'tribute') => {
		try {
			type === 'district' ? await DistrictService.delete(id) : await TributeService.delete(id);
			toast.success("Supprimé avec succès");
			loadData();
		} catch (err: any) {
			toast.error("Suppression impossible");
		}
	};

	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 p-5 rounded-4xl flex items-center gap-4">
				<div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
					<AiOutlineBulb size={24} />
				</div>
				<div>
					<p className="text-[11px] font-black uppercase text-brand-primary tracking-widest">Astuce Saisie Multiple</p>
					<p className="text-[10px] font-bold text-brand-muted uppercase mt-1">
						Séparez les noms par des virgules (,) ou des retours à la ligne pour gagner du temps.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<section className="bg-white dark:bg-brand-border-dark p-8 rounded-[3rem] border-2 border-brand-border border-b-8 shadow-xl flex flex-col h-162.5">
					<h2 className="text-xl font-black uppercase flex items-center gap-3 mb-6 text-brand-text">
						<AiOutlineGlobal className="text-brand-primary" /> Districts
					</h2>

					<textarea
						className="w-full p-5 bg-brand-bg dark:bg-brand-bg/5 border-2 border-brand-border rounded-2xl font-bold text-[12px] min-h-30 focus:border-brand-primary outline-none resize-none mb-4 transition-all placeholder:text-brand-muted/30"
						placeholder="Analamanga, Vakinankaratra, Atsinanana..."
						value={rawDistricts}
						onChange={(e) => setRawDistricts(e.target.value)}
					/>

					<Button onClick={() => handleBulkAdd('district')} className="w-full" disabled={loading || !isNonEmpty(rawDistricts)}>
						<AiOutlinePlus className="mr-2" size={18} /> AJOUTER LES DISTRICTS
					</Button>

					<div className="mt-8 flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
						{districts.map(d => (
							<div key={d.id} className="group flex justify-between items-center p-4 bg-brand-bg dark:bg-brand-bg/5 rounded-2xl border-2 border-transparent hover:border-brand-primary/20 transition-all">
								<span className="font-black uppercase text-[10px] text-brand-text tracking-wide">{d.name}</span>
								<ActionBtn
									variant="delete"
									title="Supprimer le district"
									icon={<AiOutlineDelete />}
									onClick={() => d.id && handleDelete(d.id, 'district')}
								/>
							</div>
						))}
					</div>
				</section>
				<section className="bg-white dark:bg-brand-border-dark p-8 rounded-[3rem] border-2 border-brand-border border-b-8 shadow-xl flex flex-col h-162.5">
					<h2 className="text-xl font-black uppercase flex items-center gap-3 mb-6 text-brand-text">
						<AiOutlineTeam className="text-orange-500" /> Tribus
					</h2>

					<textarea
						className="w-full p-5 bg-brand-bg dark:bg-brand-bg/5 border-2 border-brand-border rounded-2xl font-bold text-[12px] min-h-30 focus:border-orange-500 outline-none resize-none mb-4 transition-all placeholder:text-brand-muted/30"
						placeholder="Tribu Nord, Tribu Sud, Clan Alpha..."
						value={rawTributes}
						onChange={(e) => setRawTributes(e.target.value)}
					/>

					<Button
						onClick={() => handleBulkAdd('tribute')}
						className="w-full bg-orange-500 border-orange-700 hover:bg-orange-600"
						disabled={loading || !isNonEmpty(rawTributes)}
					>
						<AiOutlinePlus className="mr-2" size={18} /> AJOUTER LES TRIBUS
					</Button>

					<div className="mt-8 flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
						{tributes.length > 0 ? tributes.map(t => (
							<div key={t.id} className="group flex justify-between items-center p-4 bg-brand-bg dark:bg-brand-bg/5 rounded-2xl border-2 border-transparent hover:border-orange-500/20 transition-all">
								<span className="font-black uppercase text-[10px] text-brand-text tracking-wide">{t.name}</span>
								<ActionBtn
									variant="delete"
									title="Supprimer la tribu"
									icon={<AiOutlineDelete />}
									onClick={() => t.id && handleDelete(t.id, 'tribute')}
								/>
							</div>
						)) : (
							<div className="flex flex-col items-center justify-center h-full opacity-30 grayscale italic">
								<AiOutlineTeam size={48} className="mb-2" />
								<p className="text-[10px] font-black uppercase">Aucune donnée</p>
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default ManageOrganization;