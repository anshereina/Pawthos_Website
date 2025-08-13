import React, { useState } from 'react';
import { X, Download, Calendar, FileText } from 'lucide-react';
import { AnimalControlRecord } from '../services/animalControlRecordService';
import { pdfExportService } from '../services/pdfExportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AnimalControlRecord[];
  activeTab: 'catch' | 'surrendered';
  search: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  records,
  activeTab,
  search,
}) => {
  const [exportType, setExportType] = useState<'current' | 'today' | 'all' | 'date'>('current');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      switch (exportType) {
        case 'current':
          pdfExportService.exportCurrentRecords(records, activeTab, search);
          break;
        case 'today':
          pdfExportService.exportTodayRecords(records, activeTab);
          break;
        case 'all':
          pdfExportService.exportAllRecords(records);
          break;
        case 'date':
          pdfExportService.exportRecordsByDate(records, selectedDate, activeTab);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecordCount = () => {
    switch (exportType) {
      case 'current':
        return records.filter(record => {
          const matchesTab = record.record_type === activeTab;
          const matchesSearch = search === '' || 
            record.owner_name.toLowerCase().includes(search.toLowerCase()) ||
            (record.contact_number && record.contact_number.toLowerCase().includes(search.toLowerCase())) ||
            (record.address && record.address.toLowerCase().includes(search.toLowerCase()));
          return matchesTab && matchesSearch;
        }).length;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        return records.filter(record => 
          record.date === today && record.record_type === activeTab
        ).length;
      case 'all':
        return records.length;
      case 'date':
        return records.filter(record => 
          record.date === selectedDate && record.record_type === activeTab
        ).length;
      default:
        return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Export Records</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value="current"
                  checked={exportType === 'current'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-gray-600" />
                  <span>Current View ({activeTab} records)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value="today"
                  checked={exportType === 'today'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-600" />
                  <span>Today's Records</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value="date"
                  checked={exportType === 'date'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-600" />
                  <span>Specific Date</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <Download size={16} className="text-gray-600" />
                  <span>All Records</span>
                </div>
              </label>
            </div>
          </div>

          {/* Date Selection for Specific Date */}
          {exportType === 'date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* Record Count Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Records to export: <span className="font-semibold text-gray-800">{getRecordCount()}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              File will be downloaded as PDF format
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading || getRecordCount() === 0}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>{loading ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 