import { useState, useEffect, useCallback, useMemo } from 'react';
import { PersonService } from '../services/person.services';
import { PersonResponseDto } from '../lib/types/models/person.type';
import toast from 'react-hot-toast';

export const useMemberLogic = () => {
	const [members, setMembers] = useState<PersonResponseDto[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [filterSex, setFilterSex] = useState("");
	const [filterDistrict, setFilterDistrict] = useState("");
	const [filterTribe, setFilterTribe] = useState("");

	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

	const fetchMembers = useCallback(async () => {
		setLoading(true);
		try {
			const data = await PersonService.getAll();
			setMembers(data);
		} catch (error) {
			toast.error("Erreur de synchronisation avec la base de données");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchMembers(); }, [fetchMembers]);

	const filteredMembers = useMemo(() => {
		return members.filter(m => {
			const matchesSearch = !search ||
				`${m.firstName} ${m.lastName} ${m.phoneNumber} ${m.sequenceNumber}`
					.toLowerCase()
					.includes(search.toLowerCase());

			const matchesSex = !filterSex || m.gender === filterSex;
			const matchesDistrict = !filterDistrict || m.districtName === filterDistrict;
			const matchesTribe = !filterTribe || m.tributeName === filterTribe;

			return matchesSearch && matchesSex && matchesDistrict && matchesTribe;
		});
	}, [members, search, filterSex, filterDistrict, filterTribe]);

	// --- Actions ---
	const handleSelect = (id: string) => {
		setSelectedMembers(prev =>
			prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
		);
	};

	const handleSelectAll = (checked: boolean) => {
		setSelectedMembers(checked ? filteredMembers.map(m => m.id) : []);
	};

	const deleteAction = async (ids: string[]) => {
		if (ids.length === 0) return;

		const confirmMsg = ids.length === 1
			? "Supprimer ce membre ?"
			: `Supprimer ces ${ids.length} membres et leurs données rattachées ?`;

		if (!window.confirm(confirmMsg)) return;

		try {
			await Promise.all(ids.map(id => PersonService.delete(id)));
			toast.success("Suppression effectuée");
			setSelectedMembers([]);
			fetchMembers();
		} catch (error) {
			toast.error("Certains membres n'ont pas pu être supprimés");
		}
	};

	return {
		// Data
		members: filteredMembers,
		allMembersCount: members.length,
		loading,

		search, setSearch,
		filterSex, setFilterSex,
		filterDistrict, setFilterDistrict,
		filterTribe, setFilterTribe,

		selectedMembers,
		handleSelect,
		handleSelectAll,
		isAllSelected: filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length,

		deleteAction,
		refreshMembers: fetchMembers
	};
};