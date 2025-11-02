import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { shippingPermitRecordService, OwnerSearchResult } from '../services/shippingPermitRecordService';

interface OwnerDropdownProps {
  selectedOwner: string;
  onOwnerChange: (ownerName: string, ownerData?: OwnerSearchResult) => void;
  placeholder?: string;
  required?: boolean;
}

const OwnerDropdown: React.FC<OwnerDropdownProps> = ({
  selectedOwner,
  onOwnerChange,
  placeholder = "Type or search owner name...",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [owners, setOwners] = useState<OwnerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(selectedOwner);
  const [selectedOwnerData, setSelectedOwnerData] = useState<OwnerSearchResult | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with selectedOwner prop
  useEffect(() => {
    setInputValue(selectedOwner);
    if (!selectedOwner) {
      setSelectedOwnerData(null);
    }
  }, [selectedOwner]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchOwners = async (q: string) => {
      if (q.length < 2) {
        setOwners([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      try {
        console.log('Searching for owners with query:', q);
        const fetchedOwners = await shippingPermitRecordService.searchOwners(q);
        console.log('Fetched owners:', fetchedOwners);
        setOwners(fetchedOwners);
        setIsOpen(fetchedOwners.length > 0);
      } catch (error) {
        console.error('Error fetching owners:', error);
        console.error('Error details:', error);
        setOwners([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    };

    if (inputValue && inputValue.length >= 2) {
      // Debounce search
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
      // @ts-ignore - setTimeout returns number in browser
      searchTimeoutRef.current = window.setTimeout(() => {
        fetchOwners(inputValue.trim());
      }, 300);
    } else {
      setOwners([]);
      setIsOpen(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // If user is typing and it doesn't match selected owner, clear selection
    if (selectedOwnerData && value !== selectedOwnerData.owner_name) {
      setSelectedOwnerData(null);
      onOwnerChange(value, undefined);
    } else if (!selectedOwnerData) {
      onOwnerChange(value, undefined);
    }
  };

  const handleInputFocus = () => {
    if (inputValue && inputValue.length >= 2 && owners.length > 0) {
      setIsOpen(true);
    }
  };

  const handleOwnerSelect = (owner: OwnerSearchResult) => {
    setInputValue(owner.owner_name);
    setSelectedOwnerData(owner);
    onOwnerChange(owner.owner_name, owner);
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && isOpen && owners.length > 0) {
      // Select first owner on Enter
      handleOwnerSelect(owners[0]);
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setSelectedOwnerData(null);
              onOwnerChange('', undefined);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && owners.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {loading ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Loading...</div>
            ) : (
              owners.map((owner, index) => (
                <div
                  key={`${owner.owner_name}-${index}`}
                  className="flex items-center justify-between px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleOwnerSelect(owner)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{owner.owner_name}</div>
                      {owner.contact_number && (
                        <div className="text-xs text-gray-600">{owner.contact_number}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Pet: {owner.pet_name} • {owner.pet_species || 'Unknown'} • {owner.pet_breed || 'Unknown breed'}
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

export default OwnerDropdown;

