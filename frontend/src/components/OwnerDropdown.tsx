import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { shippingPermitRecordService, OwnerSearchResult } from '../services/shippingPermitRecordService';

interface OwnerDropdownProps {
  selectedOwner: string;
  onOwnerChange: (ownerName: string, ownerData?: OwnerSearchResult) => void;
  placeholder?: string;
}

const OwnerDropdown: React.FC<OwnerDropdownProps> = ({
  selectedOwner,
  onOwnerChange,
  placeholder = "Search owner name..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [owners, setOwners] = useState<OwnerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const searchTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        return;
      }
      setLoading(true);
      try {
        const fetchedOwners = await shippingPermitRecordService.searchOwners(q);
        setOwners(fetchedOwners);
      } catch (error) {
        console.error('Error fetching owners:', error);
        setOwners([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && search.length >= 2) {
      // Debounce search
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
      // @ts-ignore - setTimeout returns number in browser
      searchTimeoutRef.current = window.setTimeout(() => {
        fetchOwners(search.trim());
      }, 300);
    } else if (!isOpen) {
      setOwners([]);
      setSearch('');
    }

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isOpen, search]);

  const handleOwnerSelect = (owner: OwnerSearchResult) => {
    onOwnerChange(owner.owner_name, owner);
    setIsOpen(false);
    setSearch('');
  };

  const removeOwner = () => {
    onOwnerChange('', undefined);
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          role="combobox"
          aria-expanded={isOpen}
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 min-h-6 flex-1">
              {!selectedOwner ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                  <span>{selectedOwner}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOwner();
                    }}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {/* Search */}
            <div className="px-3 py-2 border-b border-gray-200 sticky top-0 bg-white">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Type owner name to search..."
                autoFocus
              />
            </div>

            {loading ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Loading...</div>
            ) : search.length < 2 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Type at least 2 characters to search</div>
            ) : owners.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No owners found</div>
            ) : (
              owners.map((owner, index) => (
                <div
                  key={`${owner.owner_name}-${index}`}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleOwnerSelect(owner)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{owner.owner_name}</div>
                      {owner.contact_number && (
                        <div className="text-xs text-gray-500">{owner.contact_number}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Pet: {owner.pet_name} • {owner.pet_species || 'Unknown'} • {owner.pet_breed || 'Unknown breed'}
                      </div>
                    </div>
                  </div>
                  {selectedOwner === owner.owner_name && (
                    <Check size={16} className="text-green-600 flex-shrink-0" />
                  )}
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

