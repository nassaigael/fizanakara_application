// hooks/useMemberLogic.ts
import { useState, useEffect, useCallback } from 'react';
import PersonService from '../services/person.services';
import type { PersonResponseDto, PersonDto} from '../lib/types/models/person.type';

/**
 * Hook personnalisé pour la logique des membres
 */
export const useMemberLogic = () => {
  const [members, setMembers] = useState<PersonResponseDto[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<PersonResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États de filtres
  const [search, setSearch] = useState('');
  const [filterSex, setFilterSex] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterTribe, setFilterTribe] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Charger les membres
  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PersonService.getAllPersons();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Appliquer les filtres
  const applyFilters = useCallback(() => {
    let result = [...members];

    // Filtre de recherche
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(member =>
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.phoneNumber?.toLowerCase().includes(query) ||
        member.districtName?.toLowerCase().includes(query) ||
        member.tributeName?.toLowerCase().includes(query)
      );
    }

    // Filtre par sexe
    if (filterSex) {
      result = result.filter(member => member.gender === filterSex);
    }

    // Filtre par district
    if (filterDistrict) {
      result = result.filter(member => member.districtName === filterDistrict);
    }

    // Filtre par tribu
    if (filterTribe) {
      result = result.filter(member => member.tributeName === filterTribe);
    }

    // Filtre par statut
    if (filterStatus) {
      result = result.filter(member => member.status === filterStatus);
    }

    setFilteredMembers(result);
  }, [members, search, filterSex, filterDistrict, filterTribe, filterStatus]);

  // Initialisation et application des filtres
  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Actions CRUD
  const createMember = useCallback(async (memberData: PersonDto) => {
    setLoading(true);
    setError(null);
    try {
      const newMember = await PersonService.createPerson(memberData);
      setMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMember = useCallback(async (id: string, updateData: Partial<PersonDto>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMember = await PersonService.updatePerson(id, updateData);
      setMembers(prev => prev.map(member => 
        member.id === id ? updatedMember : member
      ));
      return updatedMember;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await PersonService.deletePerson(id);
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultiple = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);
    try {
      // Supprimer un par un (ou implémenter un endpoint batch)
      await Promise.all(ids.map(id => PersonService.deletePerson(id)));
      setMembers(prev => prev.filter(member => !ids.includes(member.id)));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const promoteMember = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const promotedMember = await PersonService.promoteToActiveMember(id);
      setMembers(prev => prev.map(member => 
        member.id === id ? promotedMember : member
      ));
      return promotedMember;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addChild = useCallback(async (parentId: string, childData: PersonDto) => {
    setLoading(true);
    setError(null);
    try {
      const child = await PersonService.addChild(parentId, childData);
      // Mettre à jour le parent dans la liste
      setMembers(prev => prev.map(member => {
        if (member.id === parentId) {
          return {
            ...member,
            childrenCount: member.childrenCount + 1,
            children: [...(member.children || []), child]
          };
        }
        return member;
      }));
      return child;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setSearch('');
    setFilterSex('');
    setFilterDistrict('');
    setFilterTribe('');
    setFilterStatus('');
  }, []);

  return {
    // États
    members: filteredMembers,
    allMembers: members,
    loading,
    error,
    
    // Filtres
    search,
    setSearch,
    filterSex,
    setFilterSex,
    filterDistrict,
    setFilterDistrict,
    filterTribe,
    setFilterTribe,
    filterStatus,
    setFilterStatus,
    
    // Actions
    loadMembers: () => loadMembers().then(applyFilters),
    createMember,
    updateMember,
    deleteMember,
    deleteAction: deleteMultiple, // Pour la compatibilité avec le composant existant
    deleteMultiple,
    promoteMember,
    addChild,
    resetFilters,
    
    // Utilitaires
    clearError: () => setError(null),
  };
};