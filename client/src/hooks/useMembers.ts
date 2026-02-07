import { useState, useCallback } from 'react';
import PersonService, { PersonFilterOptions } from '../services/person.services';
import type { PersonDto, PersonResponseDto, MemberStatus } from '../lib/types/models/person.type';

/**
 * Hook personnalisé pour la gestion des personnes
 */
export const usePersons = () => {
  const [persons, setPersons] = useState<PersonResponseDto[]>([]);
  const [currentPerson, setCurrentPerson] = useState<PersonResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge toutes les personnes
   */
  const loadAllPersons = useCallback(async (filters?: PersonFilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PersonService.getAllPersons(filters);
      setPersons(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Charge une personne par son ID
   */
  const loadPersonById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PersonService.getPersonById(id);
      setCurrentPerson(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée une nouvelle personne
   */
  const createPerson = useCallback(async (personData: PersonDto) => {
    setLoading(true);
    setError(null);
    try {
      const newPerson = await PersonService.createPerson(personData);
      setPersons(prev => [...prev, newPerson]);
      return newPerson;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ajoute un enfant à un parent
   */
  const addChildToPerson = useCallback(async (parentId: string, childData: PersonDto) => {
    setLoading(true);
    setError(null);
    try {
      const child = await PersonService.addChild(parentId, childData);
      
      // Mettre à jour le parent dans la liste
      setPersons(prev => prev.map(person => {
        if (person.id === parentId) {
          return {
            ...person,
            childrenCount: person.childrenCount + 1,
            children: [...(person.children || []), child]
          };
        }
        return person;
      }));
      
      return child;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour une personne
   */
  const updatePerson = useCallback(async (id: string, updateData: Partial<PersonDto>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPerson = await PersonService.updatePerson(id, updateData);
      
      // Mettre à jour dans la liste
      setPersons(prev => prev.map(person => 
        person.id === id ? updatedPerson : person
      ));
      
      // Mettre à jour la personne courante si c'est celle-ci
      if (currentPerson?.id === id) {
        setCurrentPerson(updatedPerson);
      }
      
      return updatedPerson;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPerson]);

  /**
   * Promouvoir une personne à membre actif
   */
  const promoteToActiveMember = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const promotedPerson = await PersonService.promoteToActiveMember(id);
      
      // Mettre à jour dans la liste
      setPersons(prev => prev.map(person => 
        person.id === id ? promotedPerson : person
      ));
      
      return promotedPerson;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime une personne
   */
  const deletePerson = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await PersonService.deletePerson(id);
      
      // Retirer de la liste
      setPersons(prev => prev.filter(person => person.id !== id));
      
      // Effacer la personne courante si c'est celle-ci
      if (currentPerson?.id === id) {
        setCurrentPerson(null);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPerson]);

  /**
   * Charge les enfants d'un parent
   */
  const loadChildren = useCallback(async (parentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const children = await PersonService.getChildrenByParentId(parentId);
      
      // Mettre à jour le parent dans la liste
      setPersons(prev => prev.map(person => {
        if (person.id === parentId) {
          return { ...person, children };
        }
        return person;
      }));
      
      return children;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recherche des personnes
   */
  const searchPersons = useCallback(async (criteria: {
    query?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    status?: MemberStatus;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const results = await PersonService.searchPersons(criteria);
      setPersons(results);
      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour le statut d'une personne
   */
  const updatePersonStatus = useCallback(async (id: string, status: MemberStatus) => {
    return updatePerson(id, { status });
  }, [updatePerson]);

  /**
   * Efface les données locales
   */
  const clearData = useCallback(() => {
    setPersons([]);
    setCurrentPerson(null);
    setError(null);
  }, []);

  return {
    // État
    persons,
    currentPerson,
    loading,
    error,
    
    // Actions
    loadAllPersons,
    loadPersonById,
    createPerson,
    addChildToPerson,
    updatePerson,
    promoteToActiveMember,
    deletePerson,
    loadChildren,
    searchPersons,
    updatePersonStatus,
    clearData,
    
    // Utilitaires
    clearError: () => setError(null),
  };
};