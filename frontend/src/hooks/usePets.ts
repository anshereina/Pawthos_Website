import { useState, useCallback } from 'react';
import { petService, Pet, CreatePetData, UpdatePetData } from '../services/petService';

export const usePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPets = useCallback(async (species?: string, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await petService.getPets(species, search);
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPet = useCallback(async (petData: CreatePetData) => {
    setLoading(true);
    setError(null);
    try {
      const newPet = await petService.createPet(petData);
      setPets(prev => [...prev, newPet]);
      return newPet;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePet = useCallback(async (petId: string, petData: UpdatePetData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPet = await petService.updatePet(petId, petData);
      setPets(prev => prev.map(pet => pet.pet_id === petId ? updatedPet : pet));
      return updatedPet;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePet = useCallback(async (petId: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await petService.deletePet(petId);
      setPets(prev => prev.filter(pet => pet.pet_id !== petId));
      setSuccessMessage('Pet and all related records deleted successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPet = useCallback(async (petId: string) => {
    setLoading(true);
    setError(null);
    try {
      const pet = await petService.getPet(petId);
      return pet;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pets,
    loading,
    error,
    successMessage,
    fetchPets,
    createPet,
    updatePet,
    deletePet,
    getPet,
  };
}; 