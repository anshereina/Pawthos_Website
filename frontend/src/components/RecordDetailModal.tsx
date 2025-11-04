import React from 'react';
import { X, Download } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface RecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'MIC' | 'PA';
  data: any;
}

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ isOpen, onClose, type, data }) => {
  if (!isOpen || !data) return null;

  const mic = type === 'MIC' ? data : null;
  const pa = type === 'PA' ? data : null;

  const pictureUrl = mic?.picture_url ? `${API_BASE_URL}${mic.picture_url}` : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{type === 'MIC' ? 'Meat Inspection Certificate' : 'Post Abattoir Inspection'} Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {type === 'MIC' && (
            <>
              {/* Inspection Information Section */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Inspection Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Inspection</label>
                    <p className="text-gray-900">{new Date(mic.date_of_inspection).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <p className="text-gray-900">{mic.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Name</label>
                    <p className="text-gray-900">{mic.dealer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                    <p className="text-gray-900">{mic.barangay || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilos</label>
                    <p className="text-gray-900">{mic.kilos} kg</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Slaughter</label>
                    <p className="text-gray-900">{new Date(mic.date_of_slaughter).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Issued</label>
                    <p className="text-gray-900">{mic.certificate_issued ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <p className="text-gray-900">{mic.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
                    <p className="text-gray-900">{mic.inspector_name || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <p className="text-gray-900">{mic.remarks || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Picture Section */}
              {pictureUrl && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Picture</h3>
                  <div className="space-y-3">
                    <div className="w-full">
                      <img src={pictureUrl} alt="Uploaded" className="max-h-64 rounded border" />
                    </div>
                    <a 
                      href={pictureUrl} 
                      download 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
                    >
                      <Download size={16} />
                      <span>Download picture</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
          {type === 'PA' && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Post Abattoir Inspection Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{new Date(pa.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <p className="text-gray-900">{pa.time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                  <p className="text-gray-900">{pa.barangay}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Establishment</label>
                  <p className="text-gray-900">{pa.establishment}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
                  <p className="text-gray-900">{[pa.doc_mic && 'MIC', pa.doc_vhc && 'VHC', pa.doc_sp && 'SP'].filter(Boolean).join(', ') || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meat Appearance</label>
                  <p className="text-gray-900">COLOR: {pa.color_ok ? 'Yes' : 'No'}, TEXTURE: {pa.texture_ok ? 'Yes' : 'No'}, ODOR: {pa.odor_ok ? 'Yes' : 'No'}, CONDEM: {pa.condem ? 'Yes' : 'No'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <p className="text-gray-900">{pa.owner}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;


