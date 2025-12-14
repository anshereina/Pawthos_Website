import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Pet } from '../services/petService';

interface PetDropdownProps {
  selectedPet: string;
  onPetChange: (petName: string, petData?: Pet) => void;
  ownerName?: string; // Optional filter by owner
  placeholder?: string;
  required?: boolean;
  pets: Pet[]; // Pass pets array as prop
}

const PetDropdown: React.FC<PetDropdownProps> = ({
  selectedPet,
  onPetChange,
  ownerName,
  placeholder = "Type or search pet name...",
  required = false,
  pets = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(selectedPet);
  const [selectedPetData, setSelectedPetData] = useState<Pet | null>(null);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with selectedPet prop
  useEffect(() => {
    setInputValue(selectedPet);
    if (!selectedPet) {
      setSelectedPetData(null);
    }
  }, [selectedPet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

    // Filter pets based on search and owner
  useEffect(() => {
    const filterPets = () => {
      let filtered = pets;
      
      // Filter by owner if provided
      if (ownerName) {
        filtered = filtered.filter(pet => pet.owner_name === ownerName);
      }
      
      // Filter by search term if provided
      if (inputValue && inputValue.length >= 1) {
        const searchLower = inputValue.toLowerCase();
        filtered = filtered.filter(pet => 
          pet.name.toLowerCase().includes(searchLower) ||
          pet.species?.toLowerCase().includes(searchLower) ||
          pet.breed?.toLowerCase().includes(searchLower)
        );
      }
      
      setFilteredPets(filtered);
      // Keep dropdown open if there are filtered pets or if input is empty (to show all pets)
      if (filtered.length > 0) {
        setIsOpen(true);
      }
    };

    if (inputValue && inputValue.length >= 1) {
      // Debounce search
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
      // @ts-ignore - setTimeout returns number in browser
      searchTimeoutRef.current = window.setTimeout(() => {
        filterPets();
      }, 300);
    } else {
      // If no search term, show all pets (filtered by owner if provided)
      let filtered = pets;
      if (ownerName) {
        filtered = filtered.filter(pet => pet.owner_name === ownerName);
      }
      setFilteredPets(filtered);
      // Don't auto-open when empty, let focus handler manage it
    }

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue, ownerName, pets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // If user is typing and it doesn't match selected pet, clear selection
    if (selectedPetData && value !== selectedPetData.name) {
      setSelectedPetData(null);
      onPetChange(value, undefined);
    } else if (!selectedPetData) {
      onPetChange(value, undefined);
    }
  };

  const handleInputFocus = () => {
    // Show dropdown when focused if there are pets to show
    if (filteredPets.length > 0 || (!inputValue && pets.length > 0)) {
      // If no search term, show all pets (filtered by owner if provided)
      if (!inputValue) {
        let filtered = pets;
        if (ownerName) {
          filtered = filtered.filter(pet => pet.owner_name === ownerName);
        }
        setFilteredPets(filtered);
      }
      setIsOpen(true);
    }
  };

  const handlePetSelect = (pet: Pet) => {
    setInputValue(pet.name);
    setSelectedPetData(pet);
    onPetChange(pet.name, pet);
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && isOpen && filteredPets.length > 0) {
      // Select first pet on Enter
      handlePetSelect(filteredPets[0]);
      e.preventDefault();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setSelectedPetData(null);
              onPetChange('', undefined);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && filteredPets.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {loading ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Loading...</div>
            ) : (
              filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePetSelect(pet)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{pet.name}</div>
                      <div className="text-xs text-gray-600">
                        Owner: {pet.owner_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {pet.species || 'Unknown'} • {pet.breed || 'Unknown breed'} • {pet.color || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Age: {pet.date_of_birth ? (() => {
                          const birthDate = new Date(pet.date_of_birth);
                          const today = new Date();
                          const ageInMs = today.getTime() - birthDate.getTime();
                          const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
                          if (ageInYears < 1) {
                            const ageInMonths = Math.floor(ageInMs / (30.44 * 24 * 60 * 60 * 1000));
                            return `${ageInMonths} months`;
                          }
                          return `${ageInYears} years`;
                        })() : 'N/A'} • {pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'N/A'} • {pet.reproductive_status ? pet.reproductive_status.charAt(0).toUpperCase() + pet.reproductive_status.slice(1) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDropdown;

