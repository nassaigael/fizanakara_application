import React, { useRef, useEffect, useState } from 'react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineClose } from 'react-icons/ai';
import Select from '../../ui/Select';
import { MemberStatus } from '../../../lib/types';

interface FilterOptions {
	searchQuery: string;
	statusFilter: MemberStatus | 'ALL';
	districtFilter: string;
	tributeFilter: string;
}

interface MembersFiltersProps {
	filters: FilterOptions;
	onFilterChange: (key: keyof FilterOptions, value: string) => void;
	onClearAll: () => void;
	districts: { id: number; name: string }[];
	tributes: { id: number; name: string }[];
	hasActiveFilters: boolean;
}

const MembersFilters: React.FC<MembersFiltersProps> = ({
	filters,
	onFilterChange,
	onClearAll,
	districts,
	tributes,
	hasActiveFilters,
}) => {
	const [showFilters, setShowFilters] = useState(false);
	const filtersRef = useRef<HTMLDivElement>(null);
	const [isFiltersSticky, setIsFiltersSticky] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (filtersRef.current) {
				const rect = filtersRef.current.getBoundingClientRect();
				setIsFiltersSticky(rect.top <= 80);
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const statusOptions = [
		{ value: 'ALL', label: 'Tous les statuts' },
		{ value: MemberStatus.STUDENT, label: 'Étudiants' },
		{ value: MemberStatus.WORKER, label: 'Travailleurs' },
	];

	const districtOptions = [
		{ value: 'ALL', label: 'Tous les districts' },
		...districts.map(d => ({ value: d.id?.toString() || '', label: d.name })),
	];

	const tributeOptions = [
		{ value: 'ALL', label: 'Toutes les tribus' },
		...tributes.map(t => ({ value: t.id?.toString() || '', label: t.name })),
	];

	return (
		<div
			ref={filtersRef}
			className={`sticky top-0 z-30 transition-all duration-300 mb-5 sm:mb-6 ${isFiltersSticky
				? 'bg-brand-bg/95 backdrop-blur-md shadow-lg py-2 -mt-2'
				: 'bg-transparent py-0'
				}`}
		>
			<div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-3 sm:p-4 shadow-sm">
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
					<div className="flex-1 relative">
						<AiOutlineSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
						<input
							type="text"
							placeholder="Rechercher par ID, prénom ou nom..."
							className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-xs sm:text-sm font-medium transition-all"
							value={filters.searchQuery}
							onChange={(e) => onFilterChange('searchQuery', e.target.value)}
						/>
						{filters.searchQuery && (
							<button
								onClick={() => onFilterChange('searchQuery', '')}
								className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								<AiOutlineClose size={14} />
							</button>
						)}
					</div>
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`
              flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all whitespace-nowrap
              ${showFilters
								? 'bg-brand-primary text-white border-brand-primary'
								: 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'
							}
            `}
					>
						<AiOutlineFilter size={16} />
						<span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">Filtres</span>
						{hasActiveFilters && !showFilters && (
							<span className="ml-1 w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
						)}
					</button>
				</div>

				{showFilters && (
					<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
							<Select
								label="Statut"
								options={statusOptions}
								value={filters.statusFilter}
								onChange={(val) => onFilterChange('statusFilter', typeof val === 'string' ? val : val.target.value)}
								containerClassName="w-full"
							/>
							<Select
								label="District"
								options={districtOptions}
								value={filters.districtFilter}
								onChange={(val) => onFilterChange('districtFilter', typeof val === 'string' ? val : val.target.value)}
								containerClassName="w-full"
							/>
							<Select
								label="Tribu"
								options={tributeOptions}
								value={filters.tributeFilter}
								onChange={(val) => onFilterChange('tributeFilter', typeof val === 'string' ? val : val.target.value)}
								containerClassName="w-full"
							/>
						</div>

						{hasActiveFilters && (
							<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
								<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">
											Filtres actifs :
										</span>
										{filters.searchQuery && (
											<span className="px-2 py-1 bg-gray-100 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
												Recherche : {filters.searchQuery}
											</span>
										)}
										{filters.statusFilter !== 'ALL' && (
											<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
												{filters.statusFilter === MemberStatus.STUDENT ? 'Étudiant' : 'Travailleur'}
											</span>
										)}
										{filters.districtFilter !== 'ALL' && (
											<span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
												District : {districts.find(d => d.id?.toString() === filters.districtFilter)?.name}
											</span>
										)}
										{filters.tributeFilter !== 'ALL' && (
											<span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[8px] sm:text-[9px] font-black uppercase">
												Tribu : {tributes.find(t => t.id?.toString() === filters.tributeFilter)?.name}
											</span>
										)}
									</div>
									<button
										onClick={onClearAll}
										className="text-[9px] sm:text-[10px] font-black uppercase text-red-500 hover:text-red-600 transition-colors"
									>
										Effacer tous les filtres
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default MembersFilters;