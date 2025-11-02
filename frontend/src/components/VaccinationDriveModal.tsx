import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Syringe, Hash, User, Phone, PawPrint, Plus, Edit, Trash2, Save, HelpCircle, FileText, Search, ChevronDown, Download } from 'lucide-react';
import { vaccinationDriveService, VaccinationDriveData } from '../services/vaccinationDriveService';
import { petService, Pet } from '../services/petService';
import OtherServiceModal from './OtherServiceModal';
import OwnerDropdown from './OwnerDropdown';
import { OwnerSearchResult } from '../services/shippingPermitRecordService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VaccinationEvent {
  id: number;
  event_date: string;
  barangay: string;
  service_coordinator: string;
  status: string;
  event_title: string;
}

interface PetVaccinationRecord {
  id: number;
  ownerName: string;
  petName: string;
  ownerContact: string;
  species: string;
  breed: string;
  color: string;
  age: string;
  sex: string;
  otherServices: string[];
}

interface VaccinationDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: VaccinationEvent | null;
  readOnly?: boolean;
}

const VaccinationDriveModal: React.FC<VaccinationDriveModalProps> = ({
  isOpen,
  onClose,
  event,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    barangay: '',
    vaccineUsed: '',
    batchNoLotNo: '',
  });

  const [petRecords, setPetRecords] = useState<PetVaccinationRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<PetVaccinationRecord | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Data for dropdowns
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Dropdown visibility states - track which record is showing dropdown
  const [activePetDropdown, setActivePetDropdown] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Other Service Modal state
  const [isOtherServiceModalOpen, setIsOtherServiceModalOpen] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        date: event.event_date || '',
        barangay: event.barangay || '',
        vaccineUsed: '',
        batchNoLotNo: '',
      });
    }
  }, [event]);

  // Fetch pets data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPets();
      setIsEditMode(false); // Reset edit mode when modal opens
    }
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setActivePetDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoadingPets(false);
    }
  };

  const getFilteredPets = (searchTerm: string, ownerName?: string) => {
    let filteredPets = pets;
    
    // If owner is selected, filter pets by that owner
    if (ownerName) {
      filteredPets = pets.filter(pet => pet.owner_name === ownerName);
    }
    
    // Then filter by search term
    return filteredPets.filter(pet => 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const barangayOptions = [
    'Barangay San Antonio',
    'Barangay San Pedro',
    'Barangay San Jose',
    'Barangay San Miguel',
    'Barangay San Isidro',
    'Barangay San Nicolas',
    'Barangay San Vicente',
    'Barangay San Lorenzo',
  ];

  const vaccineOptions = [
    'Nobivac Rabies',
    'Defensor 3',
    'Rabisin',
    'Rabvac 3',
    'Imrab 3',
    'Rabies Vaccine (Generic)',
  ];

  const speciesOptions = ['Dog', 'Cat', 'Other'];
  const sexOptions = ['Male', 'Female'];

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInMs = today.getTime() - birthDate.getTime();
    const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
    
    if (ageInYears < 1) {
      const ageInMonths = Math.floor(ageInMs / (30.44 * 24 * 60 * 60 * 1000));
      return `${ageInMonths} months`;
    } else {
      return `${ageInYears} years`;
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addPetRecord = () => {
    const newRecord: PetVaccinationRecord = {
      id: Date.now(),
      ownerName: '',
      petName: '',
      ownerContact: '',
      species: '',
      breed: '',
      color: '',
      age: '',
      sex: '',
      otherServices: [],
    };
    setPetRecords(prev => [...prev, newRecord]);
  };

  const addMultiplePetRecords = (count: number) => {
    const newRecords: PetVaccinationRecord[] = Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      ownerName: '',
      petName: '',
      ownerContact: '',
      species: '',
      breed: '',
      color: '',
      age: '',
      sex: '',
      otherServices: [],
    }));
    setPetRecords(prev => [...prev, ...newRecords]);
  };

  const updatePetRecord = (id: number, field: keyof PetVaccinationRecord, value: string | string[]) => {
    setPetRecords(prev => prev.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
  };

  const deletePetRecord = (id: number) => {
    setPetRecords(prev => prev.filter(record => record.id !== id));
  };

  const addOtherService = (recordId: number, service: string) => {
    if (service.trim()) {
      updatePetRecord(recordId, 'otherServices', [...petRecords.find(r => r.id === recordId)?.otherServices || [], service.trim()]);
    }
  };

  const handleAddOtherService = (recordId: number) => {
    setCurrentRecordId(recordId);
    setIsOtherServiceModalOpen(true);
  };

  const handleOtherServiceSubmit = (serviceData: any) => {
    if (currentRecordId) {
      // Create a formatted service string with vaccine, expiry, and payment information
      const serviceString = `Vaccine: ${serviceData.vaccineUsed}, Expiry: ${serviceData.dateExpiration}, Payment: ${serviceData.payment}`;
      addOtherService(currentRecordId, serviceString);
    }
    setCurrentRecordId(null);
  };

  const removeOtherService = (recordId: number, serviceIndex: number) => {
    const record = petRecords.find(r => r.id === recordId);
    if (record) {
      const updatedServices = record.otherServices.filter((_, index) => index !== serviceIndex);
      updatePetRecord(recordId, 'otherServices', updatedServices);
    }
  };

  const handleSave = async () => {
    if (!event) return;

    // Validate required fields
    if (!formData.vaccineUsed || !formData.batchNoLotNo) {
      alert('Please fill in the vaccine used and batch/lot number.');
      return;
    }

    // Validate pet records
    const incompleteRecords = petRecords.filter(r => !r.ownerName || !r.petName || !r.ownerContact);
    if (incompleteRecords.length > 0) {
      alert(`Please complete ${incompleteRecords.length} record(s) before saving.`);
      return;
    }

    setSaving(true);
    try {
      const driveData: VaccinationDriveData = {
        event_id: event.id,
        vaccine_used: formData.vaccineUsed,
        batch_no_lot_no: formData.batchNoLotNo,
        pet_records: petRecords.map(record => ({
          owner_name: record.ownerName,
          pet_name: record.petName,
          owner_contact: record.ownerContact,
          species: record.species,
          breed: record.breed,
          color: record.color,
          age: record.age,
          sex: record.sex,
          other_services: record.otherServices,
          vaccine_used: formData.vaccineUsed,
          batch_no_lot_no: formData.batchNoLotNo,
          vaccination_date: event.event_date,
        })),
      };

      await vaccinationDriveService.saveVaccinationDrive(driveData);
      alert('Vaccination drive data saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save vaccination drive:', error);
      alert('Failed to save vaccination drive data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOwnerChange = (recordId: number, ownerName: string, ownerData?: OwnerSearchResult) => {
    if (ownerData) {
      // Auto-fill owner name and contact when owner is selected
      updatePetRecord(recordId, 'ownerName', ownerData.owner_name);
      updatePetRecord(recordId, 'ownerContact', ownerData.contact_number || '');
      // Clear pet-related fields when owner changes
      updatePetRecord(recordId, 'petName', '');
      updatePetRecord(recordId, 'species', '');
      updatePetRecord(recordId, 'breed', '');
      updatePetRecord(recordId, 'color', '');
      updatePetRecord(recordId, 'sex', '');
    } else {
      // Just update the owner name if manually typing
      updatePetRecord(recordId, 'ownerName', ownerName);
    }
  };

  // Pagination logic
  const totalItems = petRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPetRecords = petRecords.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when records change
  useEffect(() => {
    setCurrentPage(1);
  }, [petRecords.length]);

  // Determine if modal is editable
  const isEditable = !readOnly || isEditMode;

  const handleExportPDF = () => {
    if (!event) return;

    const doc = new jsPDF();
    
    // Set up colors
    const primaryColor = [34, 139, 34]; // Green
    const secondaryColor = [240, 248, 255]; // Light blue
    
    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Vaccination Drive Report', 20, 20);
    
    // Event Information Section
    let yPosition = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Event Information', 20, yPosition);
    yPosition += 10;
    
    // Event details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const eventInfo = [
      ['Event Title:', event.event_title || 'N/A'],
      ['Date:', event.event_date || 'N/A'],
      ['Barangay:', event.barangay || 'N/A'],
      ['Service Coordinator:', event.service_coordinator || 'N/A'],
      ['Vaccine Used:', formData.vaccineUsed || 'N/A'],
      ['Batch/Lot No.:', formData.batchNoLotNo || 'N/A']
    ];
    
    eventInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Pet Records Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Pet Vaccination Records', 20, yPosition);
    yPosition += 10;
    
    // Summary statistics
    const totalRecords = petRecords.length;
    const completedRecords = petRecords.filter(r => r.ownerName && r.petName && r.ownerContact).length;
    const incompleteRecords = totalRecords - completedRecords;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${totalRecords}`, 20, yPosition);
    doc.text(`Completed: ${completedRecords}`, 80, yPosition);
    doc.text(`Incomplete: ${incompleteRecords}`, 130, yPosition);
    yPosition += 15;
    
    // Prepare table data
    const tableData = petRecords.map((record, index) => [
      index + 1,
      record.ownerName || '',
      record.petName || '',
      record.ownerContact || '',
      record.species || '',
      record.breed || '',
      record.color || '',
      record.age || '',
      record.sex || '',
      record.otherServices.join(', ') || ''
    ]);
    
    // Create table
    autoTable(doc, {
      head: [['#', 'Owner Name', 'Pet Name', 'Contact', 'Species', 'Breed', 'Color', 'Age', 'Sex', 'Other Services']],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 20, right: 20 },
      didDrawPage: (data: any) => {
        // Footer
        const pageSize = doc.internal.pageSize;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${data.pageNumber}`,
          pageSize.width / 2,
          pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `Generated on: ${new Date().toLocaleDateString()}`,
          20,
          pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    const fileName = `Vaccination_Drive_${event.event_title || 'Report'}_${event.event_date || new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-green-800 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X size={24} />
            </button>
            <h1 className="text-2xl font-bold">Vaccination Drive</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-green-200 hover:text-white transition-colors flex items-center space-x-2">
              <HelpCircle size={20} />
              <span>Help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Event Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <div className="relative">
                <FileText size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={event.event_title || ''}
                  disabled={!isEditable}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Event title from vaccination event"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  disabled={!isEditable}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barangay
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.barangay}
                  disabled={!isEditable}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Barangay from vaccination event"
                />
              </div>
            </div>

            {/* Service Coordinator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Coordinator
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={event.service_coordinator || ''}
                  disabled={!isEditable}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Service coordinator from vaccination event"
                />
              </div>
            </div>
          </div>

          {/* Vaccine Information Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vaccine Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vaccine Used */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaccine Used
                </label>
                <div className="relative">
                  <Syringe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="vaccineUsed"
                    value={formData.vaccineUsed}
                    onChange={handleFormChange}
                    disabled={!isEditable}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                  >
                    <option value="">Select Vaccine</option>
                    {vaccineOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch No./Lot No. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch No./Lot No.
                </label>
                <div className="relative">
                  <Hash size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="batchNoLotNo"
                    value={formData.batchNoLotNo}
                    onChange={handleFormChange}
                    disabled={!isEditable}
                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                    placeholder="Enter batch/lot number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Individual Pet Vaccination Records Table */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Individual Pet Vaccination Records</h2>
              {isEditable && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Add rows:</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      defaultValue="5"
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      id="rowCount"
                    />
                    <button
                      onClick={() => {
                        const count = parseInt((document.getElementById('rowCount') as HTMLInputElement)?.value || '5');
                        addMultiplePetRecords(count);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                    >
                      <Plus size={16} />
                      <span>Add Multiple</span>
                    </button>
                  </div>
                  <button
                    onClick={addPetRecord}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Plus size={20} />
                    <span>Add Single</span>
                  </button>
                </div>
              )}
              {!isEditable && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    📖 View Only Mode - Click Edit to Modify
                  </span>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Download size={16} />
                    <span>Export PDF</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Records: <span className="font-semibold text-gray-800">{petRecords.length}</span></span>
              <span>Completed: <span className="font-semibold text-green-600">{petRecords.filter(r => r.ownerName && r.petName && r.ownerContact).length}</span></span>
              <span>Incomplete: <span className="font-semibold text-yellow-600">{petRecords.filter(r => !r.ownerName || !r.petName || !r.ownerContact).length}</span></span>
            </div>
          </div>

          {petRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <PawPrint size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No pet records added yet</p>
              <p className="text-sm">Click "Add Single" or "Add Multiple" to start logging vaccinations</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-sm">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Owner's Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Pet's Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Contact No.</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Species</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Breed</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Color</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Age</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Sex</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Other Service</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPetRecords.map((record, index) => {
                      const globalIndex = startIndex + index;
                      return (
                        <tr 
                          key={record.id}
                          className={`${
                            globalIndex % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
                          } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                        >
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {globalIndex + 1}
                          </td>
                          <td className="px-4 py-3 text-gray-900 relative">
                            {isEditable ? (
                              <OwnerDropdown
                                selectedOwner={record.ownerName}
                                onOwnerChange={(ownerName, ownerData) => handleOwnerChange(record.id, ownerName, ownerData)}
                                placeholder="Type or search owner name..."
                                required
                              />
                            ) : (
                              <div className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed`}>
                                {record.ownerName || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-900 relative">
                            <div className="dropdown-container">
                              <input
                                type="text"
                                value={record.petName}
                                onChange={(e) => updatePetRecord(record.id, 'petName', e.target.value)}
                                onFocus={() => {
                                  if (isEditable) setActivePetDropdown(record.id);
                                }}
                                disabled={!isEditable}
                                className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                                placeholder="Pet name"
                              />
                          {isEditable && activePetDropdown === record.id && (
                            <div className="absolute z-50 w-80 mt-1 bg-white border-2 border-green-500 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              {getFilteredPets(record.petName, record.ownerName).map((pet) => (
                                <div
                                  key={pet.id}
                                  className="px-3 py-2 hover:bg-green-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    updatePetRecord(record.id, 'petName', pet.name);
                                    // Map species to match dropdown options
                                    let mappedSpecies = '';
                                    if (pet.species) {
                                      if (pet.species.toLowerCase() === 'canine') {
                                        mappedSpecies = 'Dog';
                                      } else if (pet.species.toLowerCase() === 'feline') {
                                        mappedSpecies = 'Cat';
                                      } else {
                                        mappedSpecies = 'Other';
                                      }
                                    }
                                    updatePetRecord(record.id, 'species', mappedSpecies);
                                    updatePetRecord(record.id, 'breed', pet.breed || '');
                                    updatePetRecord(record.id, 'color', pet.color || '');
                                    // Capitalize gender to match dropdown options
                                    updatePetRecord(record.id, 'sex', pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : '');
                                    // Calculate age from date of birth
                                    updatePetRecord(record.id, 'age', pet.date_of_birth ? calculateAge(pet.date_of_birth) : '');
                                    setActivePetDropdown(null);
                                  }}
                                >
                                  <div className="font-medium">{pet.name}</div>
                                  <div className="text-gray-500">
                                    {pet.species} • {pet.breed || 'Unknown breed'}
                                  </div>
                                </div>
                              ))}
                            </div>
                            )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <input
                              type="tel"
                              value={record.ownerContact}
                              onChange={(e) => updatePetRecord(record.id, 'ownerContact', e.target.value)}
                              disabled={!isEditable}
                              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                              placeholder="Contact"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <select
                              value={record.species}
                              onChange={(e) => updatePetRecord(record.id, 'species', e.target.value)}
                              disabled={!isEditable}
                              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                            >
                              <option value="">-</option>
                              {speciesOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <input
                              type="text"
                              value={record.breed}
                              onChange={(e) => updatePetRecord(record.id, 'breed', e.target.value)}
                              disabled={!isEditable}
                              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                              placeholder="Breed"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <input
                              type="text"
                              value={record.color}
                              onChange={(e) => updatePetRecord(record.id, 'color', e.target.value)}
                              disabled={!isEditable}
                              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                              placeholder="Color"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <input
                              type="text"
                              value={record.age}
                              onChange={(e) => updatePetRecord(record.id, 'age', e.target.value)}
                              disabled={!isEditable}
                              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                              placeholder="Age"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <select
                              value={record.sex}
                              onChange={(e) => updatePetRecord(record.id, 'sex', e.target.value)}
                              disabled={!isEditable}
                              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-transparent ${!isEditable ? 'cursor-not-allowed bg-gray-50' : ''}`}
                            >
                              <option value="">-</option>
                              {sexOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            <div className="flex flex-wrap gap-1">
                              {record.otherServices.map((service, serviceIndex) => (
                                <span key={serviceIndex} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {service}
                                </span>
                              ))}
                              {isEditable && (
                                <button
                                  onClick={() => handleAddOtherService(record.id)}
                                  className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded-full border border-green-300 hover:bg-green-50 transition-colors"
                                  title="Add service"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {isEditable && (
                                <>
                                  <button 
                                    onClick={() => setEditingRecord(record)}
                                    className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                                    title="Edit row"
                                  >
                                    <Edit size={18} className="text-green-600" />
                                  </button>
                                  <button 
                                    onClick={() => deletePetRecord(record.id)}
                                    className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                                    title="Delete row"
                                  >
                                    <Trash2 size={18} className="text-red-600" />
                                  </button>
                                </>
                              )}
                              {!isEditable && (
                                <button 
                                  onClick={() => setIsEditMode(true)}
                                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                                  title="Edit mode"
                                >
                                  <Edit size={18} className="text-green-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {petRecords.length > 0 && totalPages > 1 && (
                <div className="bg-white px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current page
                        const shouldShow = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        if (!shouldShow) {
                          // Show ellipsis for gaps
                          if (page === 2 && currentPage > 4) {
                            return (
                              <span key={`ellipsis-start`} className="px-3 py-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 3) {
                            return (
                              <span key={`ellipsis-end`} className="px-3 py-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-green-600 text-white'
                                : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary and Save Section */}
        <div className="mt-6 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total Records: <span className="font-semibold text-gray-800">{petRecords.length}</span></span>
              <span>Completed: <span className="font-semibold text-green-600">{petRecords.filter(r => r.ownerName && r.petName && r.ownerContact).length}</span></span>
              <span>Incomplete: <span className="font-semibold text-yellow-600">{petRecords.filter(r => !r.ownerName || !r.petName || !r.ownerContact).length}</span></span>
            </div>
            <div className="flex items-center space-x-3">
              {isEditable ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Details</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleExportPDF}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Download size={20} />
                  <span>Export PDF Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Other Service Modal */}
      <OtherServiceModal
        isOpen={isOtherServiceModalOpen}
        onClose={() => {
          setIsOtherServiceModalOpen(false);
          setCurrentRecordId(null);
        }}
        onSubmit={handleOtherServiceSubmit}
      />
    </div>
  );
};

export default VaccinationDriveModal; 