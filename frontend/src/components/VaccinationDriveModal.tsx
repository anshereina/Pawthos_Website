import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, MapPin, Syringe, Hash, User, PawPrint, Plus, Edit, Trash2, Save, HelpCircle, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { vaccinationDriveService, VaccinationDriveData } from '../services/vaccinationDriveService';
import { petService, Pet } from '../services/petService';
import OwnerDropdown from './OwnerDropdown';
import PetDropdown from './PetDropdown';
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
  ownerBirthday: string;
  ownerContact: string;
  species: string;
  breed: string;
  color: string;
  age: string;
  sex: string;
  reproductiveStatus: string;
  otherServices: string[];
  nextVaccinationDate?: string; // Hidden field - auto-calculated as 1 year from vaccination date
  veterinarian?: string; // Hidden field - auto-filled with 'Dr. Fe Templado'
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
  // Removed unused: const [editingRecord, setEditingRecord] = useState<PetVaccinationRecord | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Data for dropdowns
  const [pets, setPets] = useState<Pet[]>([]);
  const [, setLoadingPets] = useState(false);
  

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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

  const fetchSavedVaccinationDriveData = useCallback(async () => {
    if (!event) return;
    
    try {
      // First, try to get the main drive info (vaccine_used and batch_no_lot_no)
      const driveInfo = await vaccinationDriveService.getVaccinationDriveByEventId(event.id);
      if (driveInfo) {
        setFormData(prev => ({
          ...prev,
          vaccineUsed: driveInfo.vaccine_used || '',
          batchNoLotNo: driveInfo.batch_no_lot_no || '',
        }));
      }

      // Then fetch the pet records
      const savedRecords = await vaccinationDriveService.getVaccinationDriveByEvent(event.id);
      if (savedRecords && savedRecords.length > 0) {
        // Load pet records
        const loadedRecords: PetVaccinationRecord[] = savedRecords.map(record => ({
          id: record.id,
          ownerName: record.owner_name,
          petName: record.pet_name,
          ownerBirthday: record.owner_birthday || '',
          ownerContact: record.owner_contact || '',
          species: record.species,
          breed: record.breed || '',
          color: record.color || '',
          age: record.age || '',
          sex: record.sex || '',
          reproductiveStatus: record.reproductive_status || '',
          otherServices: record.other_services || [],
          veterinarian: 'Dr. Fe Templado', // Hidden field - auto-filled with default value
          nextVaccinationDate: '', // Hidden field - will be recalculated on save
        }));
        setPetRecords(loadedRecords);
      } else {
        // Explicitly set empty array if no records found
        setPetRecords([]);
      }
    } catch (error) {
      // If no records exist yet, that's fine - it's a new drive
    }
  }, [event]);

  const fetchPets = useCallback(async () => {
    setLoadingPets(true);
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    } finally {
      setLoadingPets(false);
    }
  }, []);

  // Fetch pets data and saved vaccination drive data when modal opens
  useEffect(() => {
    if (isOpen && event) {
      // Reset state first, then fetch data
      setPetRecords([]);
      setFormData({
        date: event.event_date || '',
        barangay: event.barangay || '',
        vaccineUsed: '',
        batchNoLotNo: '',
      });
      setIsEditMode(false); // Reset edit mode when modal opens
      // Then fetch data
      fetchPets();
      fetchSavedVaccinationDriveData();
    }
  }, [isOpen, event, fetchSavedVaccinationDriveData, fetchPets]);

  const vaccineOptions = [
    'Nobivac Rabies',
    'Defensor 3',
    'Rabisin',
    'Rabvac 3',
    'Imrab 3',
    'Rabies Vaccine (Generic)',
  ];

  const speciesOptions = ['Canine', 'Feline', 'Other'];
  const sexOptions = ['Male', 'Female'];
  const reproductiveStatusOptions = ['Intact', 'Castrated', 'Spayed'];

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    
    try {
      // Handle different date formats
      let birthDate: Date;
      if (typeof dateOfBirth === 'string') {
        // Try parsing as ISO string first
        birthDate = new Date(dateOfBirth);
        // If invalid, try other formats
        if (isNaN(birthDate.getTime())) {
          // Try YYYY-MM-DD format
          const parts = dateOfBirth.split('-');
          if (parts.length === 3) {
            birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            return '';
          }
        }
      } else {
        birthDate = new Date(dateOfBirth);
      }
      
      if (isNaN(birthDate.getTime())) {
        return '';
      }
      
      const today = new Date();
      const ageInMs = today.getTime() - birthDate.getTime();
      const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
      
      if (ageInYears < 1) {
        const ageInMonths = Math.floor(ageInMs / (30.44 * 24 * 60 * 60 * 1000));
        return `${ageInMonths} months`;
      } else {
        return `${ageInYears} years`;
      }
    } catch (error) {
      console.error('Error calculating age:', error, dateOfBirth);
      return '';
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
      ownerBirthday: '',
      ownerContact: '',
      species: '',
      breed: '',
      color: '',
      age: '',
      sex: '',
      reproductiveStatus: '',
      otherServices: [],
      nextVaccinationDate: '', // Hidden field - will be auto-calculated on save
      veterinarian: 'Dr. Fe Templado', // Hidden field - auto-filled with default value
    };
    setPetRecords(prev => [...prev, newRecord]);
  };

  const addMultiplePetRecords = (count: number) => {
    const newRecords: PetVaccinationRecord[] = Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      ownerName: '',
      petName: '',
      ownerBirthday: '',
      ownerContact: '',
      species: '',
      breed: '',
      color: '',
      age: '',
      sex: '',
      reproductiveStatus: '',
      otherServices: [],
      nextVaccinationDate: '', // Hidden field - will be auto-calculated on save
      veterinarian: 'Dr. Fe Templado', // Hidden field - auto-filled with default value
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

  const toggleRowExpansion = (recordId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };


  const handleSave = async () => {
    if (!event) return;

    // Validate required fields
    if (!formData.vaccineUsed || !formData.batchNoLotNo) {
      alert('Please fill in the vaccine used and batch/lot number.');
      return;
    }

    // Validate pet records (owner_contact is now optional)
    const incompleteRecords = petRecords.filter(r => !r.ownerName || !r.petName);
    if (incompleteRecords.length > 0) {
      alert(`Please complete ${incompleteRecords.length} record(s) before saving.`);
      return;
    }

    setSaving(true);
    try {
      // Calculate next vaccination date (1 year from event date)
      const vaccinationDate = new Date(event.event_date);
      const nextVaccinationDate = new Date(vaccinationDate);
      nextVaccinationDate.setFullYear(nextVaccinationDate.getFullYear() + 1);
      const nextVaccinationDateStr = nextVaccinationDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      const driveData: VaccinationDriveData = {
        event_id: event.id,
        vaccine_used: formData.vaccineUsed,
        batch_no_lot_no: formData.batchNoLotNo,
        pet_records: petRecords.map(record => ({
          owner_name: record.ownerName,
          pet_name: record.petName,
          owner_birthday: record.ownerBirthday || undefined,
          owner_contact: record.ownerContact || undefined,
          species: record.species,
          breed: record.breed,
          color: record.color,
          age: record.age,
          sex: record.sex,
          reproductive_status: record.reproductiveStatus || undefined,
          other_services: record.otherServices,
          vaccine_used: formData.vaccineUsed,
          batch_no_lot_no: formData.batchNoLotNo,
          vaccination_date: event.event_date,
          next_vaccination_date: nextVaccinationDateStr, // Auto-calculated: 1 year from vaccination date
          veterinarian: record.veterinarian || 'Dr. Fe Templado', // Auto-filled with default value
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
      // Auto-fill owner name, contact, and birthday when owner is selected
      updatePetRecord(recordId, 'ownerName', ownerData.owner_name);
      updatePetRecord(recordId, 'ownerContact', ownerData.contact_number || '');
      // Use birthdate if available (format: YYYY-MM-DD)
      if (ownerData.birthdate) {
        const birthdate = typeof ownerData.birthdate === 'string' 
          ? ownerData.birthdate.split('T')[0] 
          : ownerData.birthdate;
        updatePetRecord(recordId, 'ownerBirthday', birthdate);
      }
      // Clear pet-related fields when owner changes
      updatePetRecord(recordId, 'petName', '');
      updatePetRecord(recordId, 'species', '');
      updatePetRecord(recordId, 'breed', '');
      updatePetRecord(recordId, 'color', '');
      updatePetRecord(recordId, 'sex', '');
      updatePetRecord(recordId, 'reproductiveStatus', '');
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

  // Helper function to parse age string and convert to years and months
  const parseAgeToYearsMonths = (ageString?: string): { years: number; months: number } => {
    if (!ageString) return { years: 0, months: 0 };
    
    // Try to parse "X years" or "X months" format
    const yearsMatch = ageString.match(/(\d+)\s*years?/i);
    const monthsMatch = ageString.match(/(\d+)\s*months?/i);
    
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
      return { years, months };
    } else if (monthsMatch) {
      return { years: 0, months: parseInt(monthsMatch[1]) };
    }
    
    return { years: 0, months: 0 };
  };

  const formatDateForPDF = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleExportPDF = () => {
    if (!event) return;

    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Header Section - matching the dog registry form exactly
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EILINONS', 105, 15, { align: 'center' });
    doc.text('Republic of the Philippines', 105, 20, { align: 'center' });
    doc.text('Province of Laguna', 105, 25, { align: 'center' });
    doc.text('City of San Pedro', 105, 30, { align: 'center' });
    doc.text('CITY VETERINARY OFFICE', 105, 35, { align: 'center' });
    doc.text('LUNGSOD NG', 105, 40, { align: 'center' });
    doc.text('SAN PEDRO', 105, 45, { align: 'center' });
    doc.text('UNA SA LAGUNA', 105, 50, { align: 'center' });
    
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DOG REGISTRY DATA BASE FORM', 105, 60, { align: 'center' });
    
    // Top fields section
    let yPos = 70;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Barangay
    doc.text(`Barangay: ${event.barangay || '___________________________'}`, 20, yPos);
    
    // Date
    const dateStr = formatDateForPDF(event.event_date);
    doc.text(`Date: ${dateStr || '___________________________'}`, 20, yPos + 5);
    
    // Vaccine Used
    doc.text(`Vaccine Used: ${formData.vaccineUsed || '___________________________'}`, 20, yPos + 10);
    
    // Batch/Lot Number
    doc.text(`Batch/Lot Number: ${formData.batchNoLotNo || '___________________________'}`, 20, yPos + 15);
    
    // Table Header
    yPos = yPos + 25;
    const tableStartY = yPos;
    
    // Prepare table data - matching the form structure exactly
    const tableData = petRecords.map((record) => {
      // Parse age to years and months
      const age = parseAgeToYearsMonths(record.age);
      
      // Format species
      const species = record.species 
        ? (record.species.toLowerCase() === 'canine' ? 'Canine' : 
           record.species.toLowerCase() === 'feline' ? 'Feline' : 
           record.species.charAt(0).toUpperCase() + record.species.slice(1).toLowerCase())
        : '';
      
      // Determine sex and reproductive status checkboxes
      const isMale = record.sex?.toLowerCase() === 'male';
      const isFemale = record.sex?.toLowerCase() === 'female';
      const isCastrated = record.reproductiveStatus?.toLowerCase() === 'castrated';
      const isSpayed = record.reproductiveStatus?.toLowerCase() === 'spayed';
      const isIntact = record.reproductiveStatus?.toLowerCase() === 'intact';
      
      return [
        record.ownerName || '',
        record.petName || '',
        formatDateForPDF(record.ownerBirthday) || '',
        record.ownerContact || '',
        species,
        '', // Origin - not in our data
        record.breed || '',
        record.color || '',
        age.years > 0 ? age.years.toString() : '', // Age in years
        age.months > 0 ? age.months.toString() : '', // Age in months
        isMale ? '✓' : '', // Male checkbox
        isFemale ? '✓' : '', // Female checkbox
        isCastrated ? '✓' : '', // Castrated checkbox
        isIntact && isMale ? '✓' : '', // Male Intact checkbox
        isSpayed ? '✓' : '', // Spayed checkbox
        isIntact && isFemale ? '✓' : '', // Female Intact checkbox
        '' // Signature - empty
      ];
    });
    
    // Create table - matching the form structure exactly
    autoTable(doc, {
      startY: tableStartY,
      head: [[
        "Owner's\nName",
        "Name of\nDog",
        "Owner's\nBirthday",
        "Contact\nNumber",
        "Species\n(Canine/Feline)",
        "Origin\n(pls. check)",
        "Breed",
        "COLOR",
        "AGE",
        "",
        "SEX",
        "",
        "",
        "",
        "",
        "",
        "SIGNATURE"
      ], [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "YEAR",
        "MONTH",
        "MALE",
        "",
        "FEMALE",
        "",
        "",
        "",
        ""
      ], [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "CASTRATED",
        "",
        "INTACT",
        "SPAYED",
        "INTACT",
        ""
      ]],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: 'linebreak',
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7,
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 28, halign: 'left' }, // Owner's Name
        1: { cellWidth: 25, halign: 'left' }, // Name of Dog
        2: { cellWidth: 22, halign: 'left' }, // Owner's Birthday
        3: { cellWidth: 20, halign: 'left' }, // Contact Number
        4: { cellWidth: 18, halign: 'left' }, // Species
        5: { cellWidth: 15, halign: 'center' }, // Origin
        6: { cellWidth: 15, halign: 'left' }, // Breed
        7: { cellWidth: 12, halign: 'left' }, // COLOR
        8: { cellWidth: 8, halign: 'center' },  // YEAR
        9: { cellWidth: 8, halign: 'center' },  // MONTH
        10: { cellWidth: 7, halign: 'center' }, // MALE
        11: { cellWidth: 7, halign: 'center' }, // CASTRATED
        12: { cellWidth: 7, halign: 'center' }, // FEMALE
        13: { cellWidth: 7, halign: 'center' }, // INTACT (male)
        14: { cellWidth: 7, halign: 'center' }, // SPAYED
        15: { cellWidth: 7, halign: 'center' }, // INTACT (female)
        16: { cellWidth: 18, halign: 'center' }, // SIGNATURE
      },
      margin: { left: 10, right: 10 },
      showHead: 'everyPage',
    });
    
    // Footer section - matching the form
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Noted by:', 20, finalY + 15);
    doc.text('DR. MA. FE V. TEMPLADO', 20, finalY + 20);
    doc.text('Head, CVO', 20, finalY + 25);
    doc.text('SLH-007-0', 20, finalY + 30);
    
    doc.text('Brgy. Chairman/HOA President', 150, finalY + 30);
    
    // Save the PDF
    const fileName = `Dog-Registry-${event.barangay || 'Unknown'}-${formatDateForPDF(event.event_date) || 'Unknown'}.pdf`;
    doc.save(fileName);
  };

  if (!isOpen) return null;
  
  // Show loading state if event is not yet loaded
  if (!event) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

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
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300" style={{ display: 'block' }}>
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
            </div>
          </div>

          <div className="overflow-x-auto" style={{ display: 'block' }}>
            <table className="w-full" style={{ display: 'table' }}>
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold text-sm w-12">
                    <span className="text-xs">Show more</span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm min-w-[200px]">Owner's Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm min-w-[200px]">Pet's Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Species</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Breed</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Age</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Sex</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {petRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <PawPrint size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No pet records found</p>
                      {isEditable ? (
                        <p className="text-sm">Click "Add Single" or "Add Multiple" to start logging vaccinations</p>
                      ) : (
                        <p className="text-sm">No vaccination records have been saved for this event</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentPetRecords.map((record, index) => {
                      const globalIndex = startIndex + index;
                      const isExpanded = expandedRows.has(record.id);
                      return (
                        <React.Fragment key={record.id}>
                          {/* Main Row - Simplified View */}
                          <tr 
                            className={`${
                              globalIndex % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
                            } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-200 border-b border-gray-100`}
                          >
                            {/* Expand/Collapse Button */}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleRowExpansion(record.id)}
                                className="p-1.5 rounded-lg hover:bg-green-200 transition-colors"
                                title={isExpanded ? "Collapse details" : "Expand details"}
                              >
                                {isExpanded ? (
                                  <ChevronUp size={18} className="text-green-700" />
                                ) : (
                                  <ChevronDown size={18} className="text-green-700" />
                                )}
                              </button>
                            </td>

                            {/* Row Number */}
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              {globalIndex + 1}
                            </td>

                            {/* Owner's Name */}
                            <td className="px-4 py-3 text-gray-900 relative">
                              {isEditable ? (
                                <OwnerDropdown
                                  selectedOwner={record.ownerName}
                                  onOwnerChange={(ownerName, ownerData) => handleOwnerChange(record.id, ownerName, ownerData)}
                                  placeholder="Type or search owner name..."
                                  required
                                />
                              ) : (
                                <div className="px-3 py-2 text-sm">
                                  {record.ownerName || '-'}
                                </div>
                              )}
                            </td>

                            {/* Pet's Name */}
                            <td className="px-4 py-3 text-gray-900 relative">
                              {isEditable ? (
                                <PetDropdown
                                  selectedPet={record.petName}
                                  onPetChange={(petName, petData) => {
                                    updatePetRecord(record.id, 'petName', petName);
                                    if (petData) {
                                      // Map species to match dropdown options
                                      let mappedSpecies = '';
                                      if (petData.species) {
                                        const speciesLower = petData.species.toLowerCase().trim();
                                        if (speciesLower === 'canine' || speciesLower === 'dog') {
                                          mappedSpecies = 'Canine';
                                        } else if (speciesLower === 'feline' || speciesLower === 'cat') {
                                          mappedSpecies = 'Feline';
                                        } else {
                                          mappedSpecies = 'Other';
                                        }
                                      }
                                      updatePetRecord(record.id, 'species', mappedSpecies);
                                      updatePetRecord(record.id, 'breed', petData.breed || '');
                                      updatePetRecord(record.id, 'color', petData.color || '');
                                      const gender = petData.gender ? petData.gender.charAt(0).toUpperCase() + petData.gender.slice(1).toLowerCase() : '';
                                      updatePetRecord(record.id, 'sex', gender);
                                      if (petData.date_of_birth) {
                                        const calculatedAge = calculateAge(petData.date_of_birth);
                                        updatePetRecord(record.id, 'age', calculatedAge);
                                      } else {
                                        updatePetRecord(record.id, 'age', '');
                                      }
                                      let reproductiveStatus = '';
                                      if (petData.reproductive_status) {
                                        const statusLower = petData.reproductive_status.toLowerCase().trim();
                                        if (statusLower === 'intact') {
                                          reproductiveStatus = 'Intact';
                                        } else if (statusLower === 'castrated') {
                                          reproductiveStatus = 'Castrated';
                                        } else if (statusLower === 'spayed') {
                                          reproductiveStatus = 'Spayed';
                                        } else if (statusLower) {
                                          reproductiveStatus = petData.reproductive_status.charAt(0).toUpperCase() + petData.reproductive_status.slice(1).toLowerCase();
                                        }
                                      }
                                      updatePetRecord(record.id, 'reproductiveStatus', reproductiveStatus);
                                      if (petData.owner_birthday) {
                                        const formattedBirthday = typeof petData.owner_birthday === 'string' 
                                          ? petData.owner_birthday.split('T')[0] 
                                          : petData.owner_birthday;
                                        updatePetRecord(record.id, 'ownerBirthday', formattedBirthday);
                                      }
                                    }
                                  }}
                                  ownerName={record.ownerName}
                                  placeholder="Type or search pet name..."
                                  required
                                  pets={pets}
                                />
                              ) : (
                                <div className="px-3 py-2 text-sm">
                                  {record.petName || '-'}
                                </div>
                              )}
                            </td>

                            {/* Species */}
                            <td className="px-4 py-3 text-gray-900">
                              {isEditable ? (
                                <select
                                  value={record.species}
                                  onChange={(e) => updatePetRecord(record.id, 'species', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                >
                                  <option value="">-</option>
                                  {speciesOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="px-3 py-2 text-sm">
                                  {record.species || '-'}
                                </div>
                              )}
                            </td>

                            {/* Breed */}
                            <td className="px-4 py-3 text-gray-900">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={record.breed}
                                  onChange={(e) => updatePetRecord(record.id, 'breed', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                  placeholder="Breed"
                                />
                              ) : (
                                <div className="px-3 py-2 text-sm">
                                  {record.breed || '-'}
                                </div>
                              )}
                            </td>

                            {/* Age */}
                            <td className="px-4 py-3 text-gray-900">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={record.age}
                                  onChange={(e) => updatePetRecord(record.id, 'age', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                  placeholder="Age"
                                />
                              ) : (
                                <div className="px-3 py-2 text-sm">
                                  {record.age || '-'}
                                </div>
                              )}
                            </td>

                            {/* Sex */}
                            <td className="px-4 py-3 text-gray-900">
                              {isEditable ? (
                                <select
                                  value={record.sex}
                                  onChange={(e) => updatePetRecord(record.id, 'sex', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                >
                                  <option value="">-</option>
                                  {sexOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="px-3 py-2 text-sm">
                                  {record.sex || '-'}
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {isEditable ? (
                                  <button 
                                    onClick={() => deletePetRecord(record.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete record"
                                  >
                                    <Trash2 size={18} className="text-red-600" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setIsEditMode(true)}
                                    className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                                    title="Edit mode"
                                  >
                                    <Edit size={18} className="text-green-600" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Details Row */}
                          {isExpanded && (
                            <tr className={`${globalIndex % 2 === 0 ? 'bg-green-50' : 'bg-gray-50'} border-b border-gray-200`}>
                              <td colSpan={9} className="px-4 py-4">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm border border-green-200">
                                  <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                                    <PawPrint size={16} className="mr-2 text-green-600" />
                                    Additional Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Owner's Birthday */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Owner's Birthday
                                      </label>
                                      {isEditable ? (
                                        <input
                                          type="date"
                                          value={record.ownerBirthday}
                                          onChange={(e) => updatePetRecord(record.id, 'ownerBirthday', e.target.value)}
                                          className="w-full px-3 py-2 text-sm bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                        />
                                      ) : (
                                        <div className="px-3 py-2 text-sm bg-white rounded-lg border border-green-200">
                                          {record.ownerBirthday || '-'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Contact Number
                                      </label>
                                      {isEditable ? (
                                        <input
                                          type="tel"
                                          value={record.ownerContact}
                                          onChange={(e) => updatePetRecord(record.id, 'ownerContact', e.target.value)}
                                          className="w-full px-3 py-2 text-sm bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                          placeholder="Contact (optional)"
                                        />
                                      ) : (
                                        <div className="px-3 py-2 text-sm bg-white rounded-lg border border-green-200">
                                          {record.ownerContact || '-'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Color */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Color
                                      </label>
                                      {isEditable ? (
                                        <input
                                          type="text"
                                          value={record.color}
                                          onChange={(e) => updatePetRecord(record.id, 'color', e.target.value)}
                                          className="w-full px-3 py-2 text-sm bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                          placeholder="Color"
                                        />
                                      ) : (
                                        <div className="px-3 py-2 text-sm bg-white rounded-lg border border-green-200">
                                          {record.color || '-'}
                                        </div>
                                      )}
                                    </div>

                                    {/* Reproductive Status */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Reproductive Status
                                      </label>
                                      {isEditable ? (
                                        <select
                                          value={record.reproductiveStatus}
                                          onChange={(e) => updatePetRecord(record.id, 'reproductiveStatus', e.target.value)}
                                          className="w-full px-3 py-2 text-sm bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                        >
                                          <option value="">-</option>
                                          {reproductiveStatusOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <div className="px-3 py-2 text-sm bg-white rounded-lg border border-green-200">
                                          {record.reproductiveStatus || '-'}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
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
        </div>

        {/* Summary and Save Section */}
        <div className="mt-6 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total Records: <span className="font-semibold text-gray-800">{petRecords.length}</span></span>
              <span>Completed: <span className="font-semibold text-green-600">{petRecords.filter(r => r.ownerName && r.petName).length}</span></span>
              <span>Incomplete: <span className="font-semibold text-yellow-600">{petRecords.filter(r => !r.ownerName || !r.petName).length}</span></span>
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
    </div>
  );
};

export default VaccinationDriveModal; 