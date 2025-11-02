import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import { CreateShippingPermitRecord, shippingPermitRecordService, OwnerSearchResult } from '../services/shippingPermitRecordService';

interface AddShippingPermitRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: CreateShippingPermitRecord) => Promise<void>;
}

const AddShippingPermitRecordModal: React.FC<AddShippingPermitRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateShippingPermitRecord>({
    owner_name: '',
    contact_number: '',
    birthdate: '',
    pet_name: '',
    pet_age: 0,
    pet_species: '',
    pet_breed: '',
    destination: '',
    purpose: '',
    issue_date: '',
    expiry_date: '',
    status: 'Active',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [ownerSuggestions, setOwnerSuggestions] = useState<OwnerSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const ownerInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search for owners when owner_name changes
  useEffect(() => {
    const searchOwners = async () => {
      if (formData.owner_name && formData.owner_name.length >= 2) {
        setIsSearching(true);
        try {
          const results = await shippingPermitRecordService.searchOwners(formData.owner_name);
          setOwnerSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Failed to search owners:', error);
          setOwnerSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setOwnerSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchOwners, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [formData.owner_name]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking on suggestions dropdown
      if (suggestionsRef.current && suggestionsRef.current.contains(target)) {
        return;
      }
      // Close if clicking outside both input and suggestions
      if (
        ownerInputRef.current &&
        !ownerInputRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    // Use click event with capture phase to ensure it fires after onClick
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const handleOwnerSelect = (owner: OwnerSearchResult) => {
    console.log('Owner selected:', owner);
    
    // Convert birthdate to YYYY-MM-DD format for HTML date input
    let formattedBirthdate = '';
    if (owner.birthdate) {
      try {
        // Handle different date formats
        const dateStr = owner.birthdate;
        // If it's already in YYYY-MM-DD format, use it directly
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          formattedBirthdate = dateStr;
        } else {
          // Try to parse and format the date
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            formattedBirthdate = date.toISOString().split('T')[0];
          }
        }
      } catch (error) {
        console.error('Error formatting birthdate:', error);
        formattedBirthdate = owner.birthdate || '';
      }
    }
    
    const newFormData = {
      owner_name: owner.owner_name,
      contact_number: owner.contact_number || '',
      pet_name: owner.pet_name,
      birthdate: formattedBirthdate,
      pet_age: owner.pet_age || 0,
      pet_species: owner.pet_species || '',
      pet_breed: owner.pet_breed || '',
      destination: formData.destination,
      purpose: formData.purpose,
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date,
      status: formData.status,
      remarks: formData.remarks,
    };
    
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    setShowSuggestions(false);
    
    // Force a small delay to ensure state update completes
    setTimeout(() => {
      console.log('Form data after update:', newFormData);
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        owner_name: '',
        contact_number: '',
        birthdate: '',
        pet_name: '',
        pet_age: 0,
        pet_species: '',
        pet_breed: '',
        destination: '',
        purpose: '',
        issue_date: '',
        expiry_date: '',
        status: 'Active',
        remarks: '',
      });
    } catch (error) {
      console.error('Failed to create record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pet_age' ? parseInt(value) || 0 : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Shipping Permit Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Information */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name *
              </label>
              <input
                ref={ownerInputRef}
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                onFocus={() => {
                  if (ownerSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {showSuggestions && ownerSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {ownerSuggestions.map((owner, index) => (
                    <div
                      key={`${owner.owner_name}-${index}`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur before click
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Suggestion clicked:', owner);
                        handleOwnerSelect(owner);
                      }}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{owner.owner_name}</div>
                      {owner.contact_number && (
                        <div className="text-sm text-gray-600">{owner.contact_number}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Pet: {owner.pet_name} • {owner.pet_species || 'Unknown'} • {owner.pet_breed || 'Unknown breed'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Pet Information - Swapped positions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name *
              </label>
              <input
                type="text"
                name="pet_name"
                value={formData.pet_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthdate *
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Age (years) *
              </label>
              <input
                type="number"
                name="pet_age"
                value={formData.pet_age}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Species
              </label>
              <input
                type="text"
                name="pet_species"
                value={formData.pet_species}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Breed
              </label>
              <input
                type="text"
                name="pet_breed"
                value={formData.pet_breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Permit Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShippingPermitRecordModal; 