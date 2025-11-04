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
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{type === 'MIC' ? 'Meat Inspection Certificate' : 'Post Abattoir Inspection'} - Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {type === 'MIC' && (
            <>
              <Detail label="Date of Inspection" value={new Date(mic.date_of_inspection).toLocaleDateString()} />
              <Detail label="Time" value={mic.time} />
              <Detail label="Dealer" value={mic.dealer_name} />
              <Detail label="Barangay" value={mic.barangay || '-'} />
              <Detail label="Kilos" value={`${mic.kilos} kg`} />
              <Detail label="Date of Slaughter" value={new Date(mic.date_of_slaughter).toLocaleDateString()} />
              <Detail label="Certificate Issued" value={mic.certificate_issued ? 'Yes' : 'No'} />
              <Detail label="Status" value={mic.status} />
              <Detail label="Inspector" value={mic.inspector_name || '-'} />
              <div className="md:col-span-2">
                <Detail label="Remarks" value={mic.remarks || '-'} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Picture</label>
                {pictureUrl ? (
                  <div className="space-y-2">
                    <div className="w-full">
                      <img src={pictureUrl} alt="Uploaded" className="max-h-64 rounded border" />
                    </div>
                    <a href={pictureUrl} download className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Download size={16} />
                      <span className="text-sm">Download picture</span>
                    </a>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No picture</span>
                )}
              </div>
            </>
          )}
          {type === 'PA' && (
            <>
              <Detail label="Date" value={new Date(pa.date).toLocaleDateString()} />
              <Detail label="Time" value={pa.time} />
              <Detail label="Barangay" value={pa.barangay} />
              <Detail label="Establishment" value={pa.establishment} />
              <Detail label="Documents" value={[pa.doc_mic && 'MIC', pa.doc_vhc && 'VHC', pa.doc_sp && 'SP'].filter(Boolean).join(', ') || '-'} />
              <Detail label="Meat Appearance" value={`COLOR:${pa.color_ok?'Yes':'No'}, TEXTURE:${pa.texture_ok?'Yes':'No'}, ODOR:${pa.odor_ok?'Yes':'No'}, CONDEM:${pa.condem?'Yes':'No'}`} />
              <Detail label="Owner" value={pa.owner} />
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Close</button>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="text-sm text-gray-800">{value}</div>
  </div>
);

export default RecordDetailModal;


