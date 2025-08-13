import { ShippingPermitRecord } from './shippingPermitRecordService';

// PDF generation using jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  date?: string;
  status?: 'Active' | 'Expired' | 'Cancelled' | 'all';
}

export const shippingPermitExportService = {
  generateShippingPermitPDF(records: ShippingPermitRecord[], options: ExportOptions = {}) {
    const doc = new jsPDF();
    
    // Title
    const title = `Shipping Permit Records Report`;
    const subtitle = options.date ? `Date: ${new Date(options.date).toLocaleDateString()}` : 'All Records';
    const statusText = options.status && options.status !== 'all' 
      ? `Status: ${options.status}`
      : '';

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 105, 30, { align: 'center' });
    
    if (statusText) {
      doc.text(statusText, 105, 37, { align: 'center' });
    }

    // Generate date for filename
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Prepare table data
    const tableData = records.map(record => [
      record.owner_name,
      record.contact_number || '-',
      new Date(record.birthdate).toLocaleDateString(),
      record.pet_name,
      `${record.pet_age} years`,
      record.pet_species || '-',
      record.pet_breed || '-',
      record.destination || '-',
      record.purpose || '-',
      record.permit_number || '-',
      new Date(record.issue_date).toLocaleDateString(),
      new Date(record.expiry_date).toLocaleDateString(),
      record.status || 'Active',
      record.remarks || '-'
    ]);

    // Define table headers
    const headers = [
      'Owner Name',
      'Contact Number',
      'Birthdate',
      'Pet Name',
      'Pet Age',
      'Species',
      'Breed',
      'Destination',
      'Purpose',
      'Permit Number',
      'Issue Date',
      'Expiry Date',
      'Status',
      'Remarks'
    ];

    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [34, 139, 34], // Green color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 50 },
      columnStyles: {
        0: { cellWidth: 25 }, // Owner Name
        1: { cellWidth: 20 }, // Contact Number
        2: { cellWidth: 20 }, // Birthdate
        3: { cellWidth: 20 }, // Pet Name
        4: { cellWidth: 15 }, // Pet Age
        5: { cellWidth: 15 }, // Species
        6: { cellWidth: 15 }, // Breed
        7: { cellWidth: 20 }, // Destination
        8: { cellWidth: 20 }, // Purpose
        9: { cellWidth: 20 }, // Permit Number
        10: { cellWidth: 20 }, // Issue Date
        11: { cellWidth: 20 }, // Expiry Date
        12: { cellWidth: 15 }, // Status
        13: { cellWidth: 25 }, // Remarks
      }
    });

    // Add summary at the bottom
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(10);
    doc.text(`Total Records: ${records.length}`, 20, finalY + 20);
    doc.text(`Generated on: ${now.toLocaleString()}`, 20, finalY + 30);

    // Generate filename
    let filename = `shipping-permit-records-${dateStr}`;
    if (options.date) {
      filename += `-${options.date}`;
    }
    if (options.status && options.status !== 'all') {
      filename += `-${options.status.toLowerCase()}`;
    }
    filename += '.pdf';

    // Save the PDF
    doc.save(filename);
  },

  // Export filtered records based on date and status
  exportRecordsByDate(records: ShippingPermitRecord[], date: string, status: 'Active' | 'Expired' | 'Cancelled' | 'all' = 'all') {
    let filteredRecords = records;
    
    // Filter by date
    if (date) {
      filteredRecords = records.filter(record => record.issue_date === date);
    }
    
    // Filter by status
    if (status !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.status === status);
    }

    this.generateShippingPermitPDF(filteredRecords, { date, status });
  },

  // Export all records
  exportAllRecords(records: ShippingPermitRecord[]) {
    this.generateShippingPermitPDF(records, {});
  },

  // Export today's records
  exportTodayRecords(records: ShippingPermitRecord[], status: 'Active' | 'Expired' | 'Cancelled' | 'all' = 'all') {
    const today = new Date().toISOString().split('T')[0];
    this.exportRecordsByDate(records, today, status);
  },

  // Export current filtered records (based on search)
  exportCurrentRecords(records: ShippingPermitRecord[], search: string) {
    let filteredRecords = records.filter(record => {
      return search === '' || 
        record.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        record.pet_name.toLowerCase().includes(search.toLowerCase()) ||
        (record.permit_number && record.permit_number.toLowerCase().includes(search.toLowerCase())) ||
        (record.contact_number && record.contact_number.toLowerCase().includes(search.toLowerCase()));
    });

    this.generateShippingPermitPDF(filteredRecords, {});
  }
}; 