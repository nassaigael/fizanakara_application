import React, { memo, useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
	AiOutlineSave, AiOutlineClose, AiOutlineGlobal, AiOutlineTeam,
	AiOutlineUser, AiOutlineInfoCircle, AiOutlineCamera, AiOutlineCalendar
} from 'react-icons/ai';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { getImageUrl } from '../../lib/constant/constant';
import { useMemberForm } from '../../hooks/useMemberForm';
import { DistrictService } from '../../services/district.service';
import { TributeService } from '../../services/tribute.service';
import { DistrictDto, TributeDto } from '../../lib/types/models/common.type';

const MemberForm: React.FC<any> = ({ isOpen, onClose, memberToEdit, onSuccess, allMembers }) => {
	const [districts, setDistricts] = useState<DistrictDto[]>([]);
	const [tributes, setTributes] = useState<TributeDto[]>([]);
	const [isChildMode, setIsChildMode] = useState(false);

	const { formData, handleChange, handleSubmit, loading, errors } = useMemberForm(() => {
		onSuccess(); onClose();
	}, memberToEdit);

	useEffect(() => {
		if (isOpen) {
			Promise.all([
				DistrictService.getAll(),
				TributeService.getAll()
			]).then(([distData, tribData]) => {
				setDistricts(distData);
				setTributes(tribData);
			});
			setIsChildMode(!!memberToEdit?.parentId);
		}
	}, [isOpen, memberToEdit]);
	const parentOptions = useMemo(() =>
		allMembers?.filter((m: any) => m.id !== memberToEdit?.id && !m.parentId)
			.map((m: any) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })) || [],
		[allMembers, memberToEdit]
	);
	if (!isOpen) return null;
	return createPortal(
		<div className="fixed inset-0 z-100 flex items-center justify-center bg-brand-text/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
			<div className="bg-white dark:bg-brand-border-dark rounded-[2.5rem] md:rounded-[3rem] w-full max-w-5xl h-full max-h-[98vh] md:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-4 border-white dark:border-brand-border">
				<div className="px-8 py-6 border-b border-brand-bg dark:border-brand-bg/10 flex justify-between items-center bg-white dark:bg-transparent shrink-0">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border-b-4 border-brand-primary shadow-sm">
							<AiOutlineTeam size={24} />
						</div>
						<div>
							<h2 className="text-xl font-black text-brand-text uppercase leading-none">
								{memberToEdit ? 'Modifier Membre' : 'Ajouter Membre'}
							</h2>
							<p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mt-1 italic">Registre Fizanakara</p>
						</div>
					</div>
					<button onClick={onClose} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all active:scale-90 text-brand-muted">
						<AiOutlineClose size={24} />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-brand-bg/30 dark:bg-brand-bg/5">
					<div className="max-w-xs mx-auto flex gap-2 p-1.5 bg-white dark:bg-brand-border-dark border-2 border-brand-border rounded-2xl mb-10 shadow-sm">
						<button type="button" onClick={() => { setIsChildMode(false); handleChange({ target: { name: 'parentId', value: '' } } as any); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isChildMode ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:bg-brand-bg dark:hover:bg-brand-bg/10'}`}>
							Titulaire
							</button>
						<button type="button" onClick={() => setIsChildMode(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isChildMode ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:bg-brand-bg dark:hover:bg-brand-bg/10'}`}>
							Enfant
						</button>
					</div>
					<form id="member-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
						<div className="lg:col-span-4 space-y-6">
							<div className="bg-white dark:bg-brand-border-dark p-6 rounded-[2.5rem] border-2 border-brand-border border-b-8 flex flex-col items-center shadow-sm">
								<div className="w-36 h-44 bg-brand-bg dark:bg-brand-bg/10 rounded-3xl border-4 border-white dark:border-brand-border shadow-xl overflow-hidden mb-6 group relative">
									<img src={getImageUrl(formData.imageUrl, formData.firstName, 'member')} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
								</div>
								<Input label="Référence Image" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Ex: membre_01.jpg" icon={<AiOutlineCamera />}/>
							</div>
							{isChildMode && (
								<div className="p-6 bg-orange-50 dark:bg-orange-500/5 rounded-4xl border-2 border-dashed border-orange-200 dark:border-orange-500/20 animate-in slide-in-from-top-4">
									<Select label="Parent responsable" name="parentId" value={formData.parentId || ""} onChange={handleChange} error={errors.parentId} options={parentOptions} icon={<AiOutlineUser />}/>
									<div className="flex items-start gap-2 mt-4 text-orange-700 dark:text-orange-400">
										<AiOutlineInfoCircle size={16} className="shrink-0 mt-0.5" />
										<p className="text-[9px] font-bold uppercase leading-tight tracking-tight">
											L'enfant sera rattaché aux cotisations du parent.
										</p>
									</div>
								</div>
							)}
						</div>
						<div className="lg:col-span-8 space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Ex: Jean" />
								<Input label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Ex: DUPONT" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Input label="Date de naissance" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} error={errors.birthDate} icon={<AiOutlineCalendar />} />
								<Select label="Sexe" name="gender" value={formData.gender} onChange={handleChange}
									options={[{ value: 'MALE', label: 'Masculin' }, { value: 'FEMALE', label: 'Féminin' }]}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Select label="District" name="districtId" value={formData.districtId} onChange={handleChange} error={errors.districtId}
									options={districts.map(d => ({ value: d.id ?? 0, label: d.name }))} icon={<AiOutlineGlobal />}
								/>
								<Select label="Tribu" name="tributeId" value={formData.tributeId} onChange={handleChange} error={errors.tributeId}
									options={tributes.map(t => ({ value: t.id ?? 0, label: t.name }))}
									icon={<AiOutlineTeam />}
								/>
								<Select label="Statut" name="status" value={formData.status} onChange={handleChange}
									options={[{ value: 'STUDENT', label: 'Étudiant' }, { value: 'WORKER', label: 'Travailleur' }]}
								/>
							</div>
							<Input label="Numéro de téléphone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="034 00 000 00" icon={<span className="text-[10px] font-black text-brand-muted">+261</span>}/>
						</div>
					</form>
				</div>
				<div className="px-8 py-6 bg-white dark:bg-brand-border-dark border-t-2 border-brand-border flex flex-col md:flex-row items-center gap-4 shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
					<Button type="button" variant="secondary" onClick={onClose} className="w-full md:w-auto px-10">
						Annuler
					</Button>
					<Button type="submit" form="member-form" disabled={loading} className="w-full md:flex-1 flex items-center justify-center gap-2">
						{loading ? (
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<AiOutlineSave size={20} />
						)}
						<span>{memberToEdit ? 'Enregistrer les modifications' : 'Confirmer la création'}</span>
					</Button>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default memo(MemberForm);