import { AnimalControlRecord } from './animalControlRecordService';

// PDF generation using jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  date?: string;
  recordType?: 'catch' | 'surrendered' | 'all';
}

export const pdfExportService = {
  // Fallback export function that works without PDF dependencies
  generateSimpleExport(records: AnimalControlRecord[], options: ExportOptions = {}) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    // Create text content
    let content = `ANIMAL CONTROL RECORDS REPORT\n`;
    content += `Generated on: ${now.toLocaleString()}\n`;
    content += `Total Records: ${records.length}\n\n`;
    
    if (options.date) {
      content += `Date: ${new Date(options.date).toLocaleDateString()}\n`;
    }
    if (options.recordType && options.recordType !== 'all') {
      content += `Type: ${options.recordType === 'catch' ? 'Catch Records' : 'Surrendered Records'}\n`;
    }
    content += `\n`;
    
    // Add headers based on record type
    if (options.recordType === 'surrendered') {
      content += `Owner Name | Contact Number | Address | Detail/Purpose | Date | Created\n`;
      content += `-`.repeat(120) + `\n`;
      
      // Add data rows for surrendered records
      records.forEach(record => {
        content += `${record.owner_name} | `;
        content += `${record.contact_number || '-'} | `;
        content += `${record.address || '-'} | `;
        content += `${record.detail || '-'} | `;
        content += `${new Date(record.date).toLocaleDateString()} | `;
        content += `${new Date(record.created_at).toLocaleDateString()}\n`;
      });
    } else {
      content += `Owner Name | Contact Number | Address | Date | Created\n`;
      content += `-`.repeat(100) + `\n`;
      
      // Add data rows for catch records
      records.forEach(record => {
        content += `${record.owner_name} | `;
        content += `${record.contact_number || '-'} | `;
        content += `${record.address || '-'} | `;
        content += `${new Date(record.date).toLocaleDateString()} | `;
        content += `${new Date(record.created_at).toLocaleDateString()}\n`;
      });
    }
    
    // Generate filename
    let filename = `animal-control-records-${dateStr}`;
    if (options.recordType && options.recordType !== 'all') {
      filename += `-${options.recordType}`;
    }
    if (options.date) {
      filename += `-${options.date}`;
    }
    filename += '.txt';
    
    // Download the file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  generateAnimalControlPDF(records: AnimalControlRecord[], options: ExportOptions = {}) {
    const doc = new jsPDF('landscape');
      
      // Title
      const title = `Animal Control Records Report`;
      const subtitle = options.date ? `Date: ${new Date(options.date).toLocaleDateString()}` : 'All Records';
      const recordTypeText = options.recordType && options.recordType !== 'all' 
        ? `Type: ${options.recordType === 'catch' ? 'Catch Records' : 'Surrendered Records'}`
        : '';

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 105, 30, { align: 'center' });
      
      if (recordTypeText) {
        doc.text(recordTypeText, 105, 37, { align: 'center' });
      }

      // Generate date for filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      // Prepare table data
      const tableData = records.map(record => [
        record.owner_name,
        record.contact_number || '-',
        record.address || '-',
        record.record_type === 'surrendered' ? (record.detail || '-') : '-',
        new Date(record.date).toLocaleDateString(),
        new Date(record.created_at).toLocaleDateString()
      ]);

      // Define table headers based on record type
      const headers = options.recordType === 'surrendered' 
        ? ['Owner Name', 'Contact Number', 'Address', 'Detail/Purpose', 'Date', 'Created']
        : ['Owner Name', 'Contact Number', 'Address', 'Date', 'Created'];

      // Add table to PDF
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 50,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak',
          cellWidth: 'wrap',
        },
        headStyles: {
          fillColor: [34, 139, 34], // Green color
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 50, left: 10, right: 10 },
        columnStyles: options.recordType === 'surrendered' ? {
          0: { cellWidth: 50 }, // Owner Name
          1: { cellWidth: 35 }, // Contact Number
          2: { cellWidth: 60 }, // Address
          3: { cellWidth: 50 }, // Detail/Purpose
          4: { cellWidth: 30 }, // Date
          5: { cellWidth: 30 }, // Created
        } : {
          0: { cellWidth: 50 }, // Owner Name
          1: { cellWidth: 35 }, // Contact Number
          2: { cellWidth: 70 }, // Address
          3: { cellWidth: 30 }, // Date
          4: { cellWidth: 30 }, // Created
        },
        didDrawPage: function (data) {
          // Add page numbers
          const pageNumber = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFontSize(8);
          doc.text(`Page ${data.pageNumber} of ${pageNumber}`, pageSize.width - 30, pageHeight - 10);
        }
      });

      // Add summary at the bottom
      const finalY = (doc as any).lastAutoTable?.finalY || 50;
      doc.setFontSize(10);
      doc.text(`Total Records: ${records.length}`, 20, finalY + 20);
      doc.text(`Generated on: ${now.toLocaleString()}`, 20, finalY + 30);

      // Generate filename
      let filename = `animal-control-records-${dateStr}`;
      if (options.recordType && options.recordType !== 'all') {
        filename += `-${options.recordType}`;
      }
      if (options.date) {
        filename += `-${options.date}`;
      }
      filename += '.pdf';

      // Save the PDF
      doc.save(filename);
  },

  // Export filtered records based on date and type
  exportRecordsByDate(records: AnimalControlRecord[], date: string, recordType: 'catch' | 'surrendered' | 'all' = 'all') {
    let filteredRecords = records;
    
    // Filter by date
    if (date) {
      filteredRecords = records.filter(record => record.date === date);
    }
    
    // Filter by record type
    if (recordType !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.record_type === recordType);
    }

    this.generateAnimalControlPDF(filteredRecords, { date, recordType });
  },

  // Export all records
  exportAllRecords(records: AnimalControlRecord[]) {
    this.generateAnimalControlPDF(records, {});
  },

  // Export today's records
  exportTodayRecords(records: AnimalControlRecord[], recordType: 'catch' | 'surrendered' | 'all' = 'all') {
    const today = new Date().toISOString().split('T')[0];
    this.exportRecordsByDate(records, today, recordType);
  },

  // Export current filtered records (based on active tab and search)
  exportCurrentRecords(records: AnimalControlRecord[], activeTab: 'catch' | 'surrendered', search: string) {
    let filteredRecords = records.filter(record => {
      const matchesTab = record.record_type === activeTab;
      const matchesSearch = search === '' || 
        record.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        (record.contact_number && record.contact_number.toLowerCase().includes(search.toLowerCase())) ||
        (record.address && record.address.toLowerCase().includes(search.toLowerCase()));
      
      return matchesTab && matchesSearch;
    });

    this.generateAnimalControlPDF(filteredRecords, { recordType: activeTab });
  }
}; 