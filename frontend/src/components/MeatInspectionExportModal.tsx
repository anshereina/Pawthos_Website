import React, { useState } from 'react';
import { X, Download, Calendar, FileText, Filter } from 'lucide-react';
import { MeatInspectionRecord } from '../services/meatInspectionRecordService';
import { meatInspectionExportService } from '../services/meatInspectionExportService';

interface MeatInspectionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MeatInspectionRecord[];
  search: string;
}

const MeatInspectionExportModal: React.FC<MeatInspectionExportModalProps> = ({
  isOpen,
  onClose,
  records,
  search,
}) => {
  const [exportType, setExportType] = useState<'current' | 'today' | 'all' | 'date'>('current');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState<'Pending' | 'Approved' | 'Rejected' | 'all'>('all');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      switch (exportType) {
        case 'current':
          meatInspectionExportService.exportCurrentRecords(records, search);
          break;
        case 'today':
          meatInspectionExportService.exportTodayRecords(records, selectedStatus);
          break;
        case 'all':
          meatInspectionExportService.exportAllRecords(records);
          break;
        case 'date':
          meatInspectionExportService.exportRecordsByDate(records, selectedDate, selectedStatus);
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
          return search === '' || 
            record.dealer_name.toLowerCase().includes(search.toLowerCase()) ||
            record.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
            record.remarks?.toLowerCase().includes(search.toLowerCase());
        }).length;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        let todayRecords = records.filter(record => record.date_of_inspection === today);
        if (selectedStatus !== 'all') {
          todayRecords = todayRecords.filter(record => record.status === selectedStatus);
        }
        return todayRecords.length;
      case 'all':
        return records.length;
      case 'date':
        let dateRecords = records.filter(record => record.date_of_inspection === selectedDate);
        if (selectedStatus !== 'all') {
          dateRecords = dateRecords.filter(record => record.status === selectedStatus);
        }
        return dateRecords.length;
      default:
        return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Export Meat Inspection Records</h2>
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
                  <span>Current View (filtered records)</span>
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

          {/* Status Filter for Today and Date exports */}
          {(exportType === 'today' || exportType === 'date') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
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

export default MeatInspectionExportModal; 