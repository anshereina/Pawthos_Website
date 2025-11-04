import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeletePostAbattoirRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  establishment: string;
}

const DeletePostAbattoirRecordModal: React.FC<DeletePostAbattoirRecordModalProps> = ({ isOpen, onClose, onConfirm, establishment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Delete Record</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-gray-800">Are you sure you want to delete this record?</p>
              <p className="text-sm text-gray-500 mt-1">Establishment: <span className="font-medium">{establishment}</span></p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePostAbattoirRecordModal;


