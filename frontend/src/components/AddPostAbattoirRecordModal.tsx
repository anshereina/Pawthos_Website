import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PostAbattoirRecordCreate } from '../services/postAbattoirRecordService';

interface AddPostAbattoirRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: PostAbattoirRecordCreate) => Promise<void>;
}

const AddPostAbattoirRecordModal: React.FC<AddPostAbattoirRecordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<PostAbattoirRecordCreate>({
    date: new Date().toISOString().split('T')[0],
    time: '',
    barangay: '',
    establishment: '',
    doc_mic: false,
    doc_vhc: false,
    doc_sp: false,
    color_ok: false,
    texture_ok: false,
    odor_ok: false,
    condem: false,
    owner: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Add Post Abattoir Inspection Record</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Time</label>
            <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="HH:MM" className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Barangay</label>
            <input type="text" name="barangay" value={formData.barangay} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Establishment</label>
            <input type="text" name="establishment" value={formData.establishment} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>

          <div className="md:col-span-2 border-t pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">Documents</p>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="doc_mic" checked={formData.doc_mic} onChange={handleChange} /> MIC</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="doc_vhc" checked={formData.doc_vhc} onChange={handleChange} /> VHC</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="doc_sp" checked={formData.doc_sp} onChange={handleChange} /> SP</label>
            </div>
          </div>

          <div className="md:col-span-2 border-t pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">Meat Appearance</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                <span>COLOR OK</span>
                <input type="checkbox" name="color_ok" checked={formData.color_ok} onChange={handleChange} />
              </label>
              <label className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                <span>TEXTURE OK</span>
                <input type="checkbox" name="texture_ok" checked={formData.texture_ok} onChange={handleChange} />
              </label>
              <label className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                <span>ODOR OK</span>
                <input type="checkbox" name="odor_ok" checked={formData.odor_ok} onChange={handleChange} />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 border-t pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">CONDEM?</p>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="condem" 
                  checked={formData.condem === true} 
                  onChange={() => setFormData(prev => ({ ...prev, condem: true }))}
                  className="text-green-600 focus:ring-green-500"
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="condem" 
                  checked={formData.condem === false} 
                  onChange={() => setFormData(prev => ({ ...prev, condem: false }))}
                  className="text-green-600 focus:ring-green-500"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Owner</label>
            <input type="text" name="owner" value={formData.owner} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
              {submitting ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostAbattoirRecordModal;


