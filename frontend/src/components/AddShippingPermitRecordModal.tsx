import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { CreateShippingPermitRecord, OwnerSearchResult } from '../services/shippingPermitRecordService';
import OwnerDropdown from './OwnerDropdown';

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

  const handleOwnerChange = (ownerName: string, ownerData?: OwnerSearchResult) => {
    if (ownerData) {
      // Convert birthdate to YYYY-MM-DD format for HTML date input
      let formattedBirthdate = '';
      if (ownerData.birthdate) {
        try {
          const dateStr = String(ownerData.birthdate);
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            formattedBirthdate = dateStr;
          } else {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              formattedBirthdate = date.toISOString().split('T')[0];
            } else {
              const parts = dateStr.split('T')[0];
              if (parts && /^\d{4}-\d{2}-\d{2}$/.test(parts)) {
                formattedBirthdate = parts;
              }
            }
          }
        } catch (error) {
          console.error('Error formatting birthdate:', error);
          formattedBirthdate = String(ownerData.birthdate || '');
        }
      }

      // Update form with owner data
      setFormData(prevFormData => ({
        ...prevFormData,
        owner_name: ownerData.owner_name,
        contact_number: ownerData.contact_number || '',
        pet_name: ownerData.pet_name || '',
        birthdate: formattedBirthdate,
        pet_age: ownerData.pet_age || 0,
        pet_species: ownerData.pet_species || '',
        pet_breed: ownerData.pet_breed || '',
      }));
    } else {
      // Clear owner-related fields when owner is removed
      setFormData(prevFormData => ({
        ...prevFormData,
        owner_name: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.owner_name || !formData.pet_name || !formData.birthdate || !formData.issue_date || !formData.expiry_date) {
      alert('Please fill in all required fields (Owner Name, Pet Name, Birthdate, Issue Date, Expiry Date)');
      return;
    }
    
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name *
              </label>
              <OwnerDropdown
                selectedOwner={formData.owner_name}
                onOwnerChange={handleOwnerChange}
                placeholder="Type or search owner name..."
                required
              />
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