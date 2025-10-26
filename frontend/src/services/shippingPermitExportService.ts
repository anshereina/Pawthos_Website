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
    const doc = new jsPDF('landscape');
    
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

    // Prepare table data - combine some fields to reduce columns
    const tableData = records.map(record => [
      record.owner_name,
      record.contact_number || '-',
      record.pet_name,
      `${record.pet_species || '-'} - ${record.pet_breed || '-'}`,
      record.destination || '-',
      record.purpose || '-',
      record.permit_number || '-',
      `${new Date(record.issue_date).toLocaleDateString()} to ${new Date(record.expiry_date).toLocaleDateString()}`,
      record.status || 'Active',
      record.remarks || '-'
    ]);

    // Define table headers - reduced from 14 to 10 columns
    const headers = [
      'Owner Name',
      'Contact',
      'Pet Name',
      'Species/Breed',
      'Destination',
      'Purpose',
      'Permit No.',
      'Validity Period',
      'Status',
      'Remarks'
    ];

    // Add table to PDF with better handling for large datasets
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        halign: 'left',
        valign: 'top',
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [34, 139, 34], // Green color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
        lineWidth: 0.1,
      },
      margin: { top: 50, left: 3, right: 3 },
      columnStyles: {
        0: { cellWidth: 55 }, // Owner Name
        1: { cellWidth: 40 }, // Contact
        2: { cellWidth: 45 }, // Pet Name
        3: { cellWidth: 50 }, // Species/Breed
        4: { cellWidth: 55 }, // Destination
        5: { cellWidth: 55 }, // Purpose
        6: { cellWidth: 45 }, // Permit No.
        7: { cellWidth: 65 }, // Validity Period
        8: { cellWidth: 35 }, // Status
        9: { cellWidth: 55 }, // Remarks
      },
      didDrawPage: function (data) {
        // Add page numbers
        const pageNumber = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        doc.setFontSize(7);
        doc.text(`Page ${data.pageNumber} of ${pageNumber}`, pageSize.width - 25, pageHeight - 8);
      },
      // Ensure all content fits by allowing multiple pages
      pageBreak: 'auto',
      showHead: 'everyPage',
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