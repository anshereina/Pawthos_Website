import React from 'react';
import { X, Download } from 'lucide-react';
import { PostAbattoirRecord } from '../services/postAbattoirRecordService';
import { postAbattoirExportService } from '../services/postAbattoirExportService';

interface PostAbattoirExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PostAbattoirRecord[];
  search: string;
}

const PostAbattoirExportModal: React.FC<PostAbattoirExportModalProps> = ({ isOpen, onClose, records, search }) => {
  if (!isOpen) return null;

  const filtered = records.filter(r => !search || r.establishment.toLowerCase().includes(search.toLowerCase()) || r.barangay.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Export Post Abattoir Records</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">This will export {filtered.length} records as a PDF.</p>
          <button
            onClick={() => { postAbattoirExportService.generatePDF(filtered, {}); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostAbattoirExportModal;


