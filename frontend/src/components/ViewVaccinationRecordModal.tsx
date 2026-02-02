import React from 'react';
import { Download } from 'lucide-react';
import { VaccinationRecordWithPet } from '../services/vaccinationRecordService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ViewVaccinationRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VaccinationRecordWithPet | null;
}

const ViewVaccinationRecordModal: React.FC<ViewVaccinationRecordModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
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

  // Get date values (handle both field name variants)
  const vaccinationDate = record.date_given || record.vaccination_date;
  const nextDueDate = record.next_due_date || record.expiration_date;

  // Calculate age in years and months
  const calculateAge = (dateOfBirth?: string | null): { years: number; months: number } => {
    if (!dateOfBirth) return { years: 0, months: 0 };
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      return { years, months };
    } catch {
      return { years: 0, months: 0 };
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Header Section - matching the form
    doc.setFontSize(10);
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
    
    // Barangay (we don't have this in the record, so leave blank or use placeholder)
    doc.text('Barangay: ___________________________', 20, yPos);
    
    // Date
    const dateStr = formatDateForPDF(vaccinationDate);
    doc.text(`Date: ${dateStr || '___________________________'}`, 20, yPos + 5);
    
    // Vaccine Used
    doc.text(`Vaccine Used: ${record.vaccine_name || '___________________________'}`, 20, yPos + 10);
    
    // Batch/Lot Number
    doc.text(`Batch/Lot Number: ${record.batch_lot_no || '___________________________'}`, 20, yPos + 15);
    
    // Table Header
    yPos = yPos + 25;
    const tableStartY = yPos;
    
    // Prepare table data - single row for this record
    // Calculate pet age (not owner age)
    const petAge = calculateAge(record.pet_date_of_birth);
    
    // Format species
    const species = record.pet_species 
      ? (record.pet_species.toLowerCase() === 'canine' ? 'Canine' : 
         record.pet_species.toLowerCase() === 'feline' ? 'Feline' : 
         record.pet_species.charAt(0).toUpperCase() + record.pet_species.slice(1).toLowerCase())
      : '';
    
    // Format sex
    const sex = record.pet_gender 
      ? (record.pet_gender.toLowerCase() === 'male' ? 'MALE' : 'FEMALE')
      : '';
    
    // Format reproductive status
    const reproductiveStatus = record.pet_reproductive_status
      ? (record.pet_reproductive_status.toLowerCase() === 'castrated' ? 'CASTRATED' :
         record.pet_reproductive_status.toLowerCase() === 'spayed' ? 'SPAYED' :
         record.pet_reproductive_status.toLowerCase() === 'intact' ? 'INTACT' :
         record.pet_reproductive_status.toUpperCase())
      : '';
    
    // Determine sex and reproductive status checkboxes
    const isMale = record.pet_gender?.toLowerCase() === 'male';
    const isFemale = record.pet_gender?.toLowerCase() === 'female';
    const isCastrated = record.pet_reproductive_status?.toLowerCase() === 'castrated';
    const isSpayed = record.pet_reproductive_status?.toLowerCase() === 'spayed';
    const isIntact = record.pet_reproductive_status?.toLowerCase() === 'intact';
    
    // Create table data
    const tableData = [[
      record.pet_owner_name || '',
      record.pet_name || '',
      formatDateForPDF(record.pet_owner_birthday) || '',
      record.pet_owner_contact || '',
      species,
      '', // Origin - not in our data
      record.pet_breed || '',
      record.pet_color || '',
      petAge.years > 0 ? petAge.years.toString() : '', // Age in years
      petAge.months > 0 ? petAge.months.toString() : '', // Age in months
      isMale ? '✓' : '', // Male checkbox
      isFemale ? '✓' : '', // Female checkbox
      isCastrated ? '✓' : '', // Castrated checkbox
      isIntact && isMale ? '✓' : '', // Male Intact checkbox
      isSpayed ? '✓' : '', // Spayed checkbox
      isIntact && isFemale ? '✓' : '', // Female Intact checkbox
      '' // Signature - empty
    ]];
    
    // Create table - matching the form structure
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
    
    // Footer section
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    doc.setFontSize(10);
    doc.text('Noted by:', 20, finalY + 15);
    doc.text('DR. MA. FE V. TEMPLADO', 20, finalY + 20);
    doc.text('Head, CVO', 20, finalY + 25);
    doc.text('SLH-007-0', 20, finalY + 30);
    
    doc.text('Brgy. Chairman/HOA President', 150, finalY + 30);
    
    // Save the PDF
    const fileName = `Dog-Registry-${record.pet_name || 'Record'}-${formatDateForPDF(vaccinationDate) || 'Unknown'}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vaccination Record Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.pet_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg capitalize">{record.pet_species || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.vaccine_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Date:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{formatDate(vaccinationDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Vaccination Date:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{formatDate(nextDueDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.veterinarian || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch/Lot No.:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.batch_lot_no || '-'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewVaccinationRecordModal;

