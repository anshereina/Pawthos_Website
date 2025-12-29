import React from 'react';
import { X, Download, Calendar, Clock, User, MapPin, Weight, FileText, CheckCircle, XCircle, Building2, FileCheck } from 'lucide-react';
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

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Yes/No Badge Component
  const YesNoBadge = ({ value }: { value: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${value ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {value ? <CheckCircle size={14} /> : <XCircle size={14} />}
      {value ? 'Yes' : 'No'}
    </span>
  );

  // Info Row Component
  const InfoRow = ({ icon: Icon, label, value, fullWidth = false }: any) => (
    <div className={`${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={16} className="text-green-700" />}
        <label className="text-sm font-medium text-gray-600">{label}</label>
      </div>
      <div className="text-gray-900 font-medium">{value || '-'}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck size={28} />
            <div>
              <h2 className="text-xl font-bold">
                {type === 'MIC' ? 'Meat Inspection Certificate' : 'Post Abattoir Inspection'}
              </h2>
              <p className="text-green-100 text-sm">Record Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {type === 'MIC' && (
            <>
              {/* Main Information Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-green-700" />
                  Inspection Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow
                    icon={Calendar}
                    label="Date of Inspection"
                    value={new Date(mic.date_of_inspection).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <InfoRow icon={Clock} label="Time" value={mic.time} />
                  <InfoRow icon={User} label="Dealer Name" value={mic.dealer_name} />
                  <InfoRow icon={MapPin} label="Barangay" value={mic.barangay} />
                  <InfoRow icon={Weight} label="Weight" value={`${mic.kilos} kg`} />
                  <InfoRow
                    icon={Calendar}
                    label="Date of Slaughter"
                    value={new Date(mic.date_of_slaughter).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <InfoRow icon={User} label="Inspector Name" value={mic.inspector_name} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck size={16} className="text-green-700" />
                      <label className="text-sm font-medium text-gray-600">Status</label>
                    </div>
                    <StatusBadge status={mic.status} />
                  </div>
                </div>
              </div>

              {/* Certificate & Remarks Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Certificate Issued</h3>
                  <YesNoBadge value={mic.certificate_issued} />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Remarks</h3>
                  <p className="text-gray-700">{mic.remarks || 'No remarks'}</p>
                </div>
              </div>

              {/* Picture Section */}
              {pictureUrl && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-green-700" />
                    Attached Picture
                  </h3>
                  <div className="space-y-4">
                    <img 
                      src={pictureUrl} 
                      alt="Inspection" 
                      className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
                    />
                    <a 
                      href={pictureUrl} 
                      download 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
                    >
                      <Download size={16} />
                      <span>Download Picture</span>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'PA' && (
            <>
              {/* Main Information Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-green-700" />
                  Post Abattoir Inspection Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow
                    icon={Calendar}
                    label="Date"
                    value={new Date(pa.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <InfoRow icon={Clock} label="Time" value={pa.time} />
                  <InfoRow icon={MapPin} label="Barangay" value={pa.barangay} />
                  <InfoRow icon={Building2} label="Establishment" value={pa.establishment} />
                  <InfoRow icon={User} label="Owner" value={pa.owner} fullWidth />
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileCheck size={18} className="text-green-700" />
                  Documents
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {pa.doc_mic && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      MIC
                    </span>
                  )}
                  {pa.doc_vhc && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                      VHC
                    </span>
                  )}
                  {pa.doc_sp && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                      SP
                    </span>
                  )}
                  {!pa.doc_mic && !pa.doc_vhc && !pa.doc_sp && (
                    <span className="text-gray-500">No documents</span>
                  )}
                </div>
              </div>

              {/* Meat Appearance Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Meat Appearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Color OK</span>
                    <YesNoBadge value={pa.color_ok} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Texture OK</span>
                    <YesNoBadge value={pa.texture_ok} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Odor OK</span>
                    <YesNoBadge value={pa.odor_ok} />
                  </div>
                </div>
              </div>

              {/* CONDEM Section - Prominent */}
              <div className={`border-2 rounded-lg p-6 ${pa.condem ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-bold ${pa.condem ? 'text-red-800' : 'text-green-800'}`}>
                      CONDEM Status
                    </h3>
                    <p className={`text-sm ${pa.condem ? 'text-red-600' : 'text-green-600'}`}>
                      Meat condemned for consumption
                    </p>
                  </div>
                  <div className={`px-6 py-3 rounded-lg font-bold text-lg ${pa.condem ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    {pa.condem ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;
