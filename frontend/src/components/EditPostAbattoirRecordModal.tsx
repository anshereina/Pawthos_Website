import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PostAbattoirRecord, PostAbattoirRecordUpdate } from '../services/postAbattoirRecordService';

interface EditPostAbattoirRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, record: PostAbattoirRecordUpdate) => Promise<void>;
  record: PostAbattoirRecord | null;
}

const EditPostAbattoirRecordModal: React.FC<EditPostAbattoirRecordModalProps> = ({ isOpen, onClose, onSubmit, record }) => {
  const [formData, setFormData] = useState<PostAbattoirRecordUpdate>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      // Format date to YYYY-MM-DD for date input
      const dateValue = record.date ? new Date(record.date).toISOString().split('T')[0] : '';
      setFormData({
        date: dateValue,
        time: record.time || '',
        barangay: record.barangay || '',
        establishment: record.establishment || '',
        doc_mic: record.doc_mic || false,
        doc_vhc: record.doc_vhc || false,
        doc_sp: record.doc_sp || false,
        color_ok: record.color_ok || false,
        texture_ok: record.texture_ok || false,
        odor_ok: record.odor_ok || false,
        condem: record.condem || false,
        owner: record.owner || '',
      });
      setError(null);
    }
  }, [record]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    setSubmitting(true);
    setError(null);
    try {
      // Send all form fields - form validation ensures required fields have values
      const updatePayload: PostAbattoirRecordUpdate = {
        date: formData.date,
        time: formData.time,
        barangay: formData.barangay,
        establishment: formData.establishment,
        owner: formData.owner,
        doc_mic: formData.doc_mic,
        doc_vhc: formData.doc_vhc,
        doc_sp: formData.doc_sp,
        color_ok: formData.color_ok,
        texture_ok: formData.texture_ok,
        odor_ok: formData.odor_ok,
        condem: formData.condem,
      };
      
      console.log('Update payload being sent:', JSON.stringify(updatePayload, null, 2));
      await onSubmit(record.id, updatePayload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update record. Please try again.');
      console.error('Error updating record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Edit Post Abattoir Inspection Record</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {error && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Date</label>
            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Time</label>
            <input type="text" name="time" value={formData.time || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Barangay</label>
            <input type="text" name="barangay" value={formData.barangay || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Establishment</label>
            <input type="text" name="establishment" value={formData.establishment || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>

          <div className="md:col-span-2 border-t pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">Documents</p>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="doc_mic" checked={!!formData.doc_mic} onChange={handleChange} /> MIC</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="doc_vhc" checked={!!formData.doc_vhc} onChange={handleChange} /> VHC</label>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="doc_sp" checked={!!formData.doc_sp} onChange={handleChange} /> SP</label>
            </div>
          </div>

          <div className="md:col-span-2 border-t pt-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">Meat Appearance</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                <span>COLOR OK</span>
                <input type="checkbox" name="color_ok" checked={!!formData.color_ok} onChange={handleChange} />
              </label>
              <label className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                <span>TEXTURE OK</span>
                <input type="checkbox" name="texture_ok" checked={!!formData.texture_ok} onChange={handleChange} />
              </label>
              <label className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                <span>ODOR OK</span>
                <input type="checkbox" name="odor_ok" checked={!!formData.odor_ok} onChange={handleChange} />
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
            <input type="text" name="owner" value={formData.owner || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostAbattoirRecordModal;


