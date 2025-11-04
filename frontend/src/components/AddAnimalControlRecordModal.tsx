import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { AnimalControlRecordCreate } from '../services/animalControlRecordService';
import { config } from '../config';

interface AddAnimalControlRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: AnimalControlRecordCreate) => Promise<void>;
  recordType: 'catch' | 'surrendered';
}

const AddAnimalControlRecordModal: React.FC<AddAnimalControlRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  recordType,
}) => {
  const [formData, setFormData] = useState<AnimalControlRecordCreate>({
    owner_name: '',
    contact_number: '',
    address: '',
    record_type: recordType,
    detail: '',
    species: '',
    breed: '',
    gender: '',
    date: new Date().toISOString().split('T')[0],
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        owner_name: '',
        contact_number: '',
        address: '',
        record_type: recordType,
        detail: '',
        species: '',
        breed: '',
        gender: '',
        date: new Date().toISOString().split('T')[0],
        image_url: '',
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload the image to backend and use returned URL
      const form = new FormData();
      form.append('file', file);
      fetch(`${config.apiUrl}/uploads/pain-assessment-image/`, {
        method: 'POST',
        body: form,
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Upload failed');
          }
          return res.json();
        })
        .then((data: { url: string }) => {
          const fullUrl = `${config.apiUrl}${data.url}`;
          setImagePreview(fullUrl);
          setFormData(prev => ({
            ...prev,
            image_url: data.url,
          }));
        })
        .catch((err) => {
          console.error('Image upload error:', err);
        });
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: '',
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Add New {recordType === 'catch' ? 'Catch' : 'Surrendered'} Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name *
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet's Name *
              </label>
              <input
                type="text"
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="Enter pet's name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="Enter breed (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet's Sex *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {recordType === 'surrendered' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detail/Purpose of Surrendering
                </label>
                <textarea
                  name="detail"
                  value={formData.detail}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Photo
              </label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload animal photo</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Animal preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAnimalControlRecordModal; 