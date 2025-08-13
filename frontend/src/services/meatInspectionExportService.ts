import { MeatInspectionRecord } from './meatInspectionRecordService';

// PDF generation using jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  date?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'all';
}

export const meatInspectionExportService = {
  // Fallback export function that works without PDF dependencies
  generateSimpleExport(records: MeatInspectionRecord[], options: ExportOptions = {}) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    // Create text content
    let content = `MEAT INSPECTION RECORDS REPORT\n`;
    content += `Generated on: ${now.toLocaleString()}\n`;
    content += `Total Records: ${records.length}\n\n`;
    
    if (options.date) {
      content += `Date: ${new Date(options.date).toLocaleDateString()}\n`;
    }
    if (options.status && options.status !== 'all') {
      content += `Status: ${options.status}\n`;
    }
    content += `\n`;
    
    // Add headers
    content += `Date of Inspection | Time | Dealer Name | Kilos | Date of Slaughter | Certificate | Status | Inspector | Created\n`;
    content += `-`.repeat(120) + `\n`;
    
    // Add data rows
    records.forEach(record => {
      content += `${new Date(record.date_of_inspection).toLocaleDateString()} | `;
      content += `${record.time} | `;
      content += `${record.dealer_name} | `;
      content += `${record.kilos} kg | `;
      content += `${new Date(record.date_of_slaughter).toLocaleDateString()} | `;
      content += `${record.certificate_issued ? 'Yes' : 'No'} | `;
      content += `${record.status} | `;
      content += `${record.inspector_name || '-'} | `;
      content += `${new Date(record.created_at).toLocaleDateString()}\n`;
    });
    
    // Generate filename
    let filename = `meat-inspection-records-${dateStr}`;
    if (options.date) {
      filename += `-${options.date}`;
    }
    if (options.status && options.status !== 'all') {
      filename += `-${options.status.toLowerCase()}`;
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

  generateMeatInspectionPDF(records: MeatInspectionRecord[], options: ExportOptions = {}) {
    const doc = new jsPDF();
      
      // Title
      const title = `Meat Inspection Records Report`;
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
        new Date(record.date_of_inspection).toLocaleDateString(),
        record.time,
        record.dealer_name,
        `${record.kilos} kg`,
        new Date(record.date_of_slaughter).toLocaleDateString(),
        record.certificate_issued ? 'Yes' : 'No',
        record.status,
        record.inspector_name || '-',
        new Date(record.created_at).toLocaleDateString()
      ]);

      // Define table headers
      const headers = [
        'Date of Inspection',
        'Time',
        'Dealer Name',
        'Kilos',
        'Date of Slaughter',
        'Certificate',
        'Status',
        'Inspector',
        'Created'
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
          0: { cellWidth: 25 }, // Date of Inspection
          1: { cellWidth: 15 }, // Time
          2: { cellWidth: 35 }, // Dealer Name
          3: { cellWidth: 15 }, // Kilos
          4: { cellWidth: 25 }, // Date of Slaughter
          5: { cellWidth: 15 }, // Certificate
          6: { cellWidth: 20 }, // Status
          7: { cellWidth: 25 }, // Inspector
          8: { cellWidth: 20 }, // Created
        }
      });

      // Add summary at the bottom
      const finalY = (doc as any).lastAutoTable?.finalY || 50;
      doc.setFontSize(10);
      doc.text(`Total Records: ${records.length}`, 20, finalY + 20);
      doc.text(`Generated on: ${now.toLocaleString()}`, 20, finalY + 30);

      // Generate filename
      let filename = `meat-inspection-records-${dateStr}`;
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
  exportRecordsByDate(records: MeatInspectionRecord[], date: string, status: 'Pending' | 'Approved' | 'Rejected' | 'all' = 'all') {
    let filteredRecords = records;
    
    // Filter by date
    if (date) {
      filteredRecords = records.filter(record => record.date_of_inspection === date);
    }
    
    // Filter by status
    if (status !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.status === status);
    }

    this.generateMeatInspectionPDF(filteredRecords, { date, status });
  },

  // Export all records
  exportAllRecords(records: MeatInspectionRecord[]) {
    this.generateMeatInspectionPDF(records, {});
  },

  // Export today's records
  exportTodayRecords(records: MeatInspectionRecord[], status: 'Pending' | 'Approved' | 'Rejected' | 'all' = 'all') {
    const today = new Date().toISOString().split('T')[0];
    this.exportRecordsByDate(records, today, status);
  },

  // Export current filtered records (based on search)
  exportCurrentRecords(records: MeatInspectionRecord[], search: string) {
    let filteredRecords = records.filter(record => {
      return search === '' || 
        record.dealer_name.toLowerCase().includes(search.toLowerCase()) ||
        record.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
        record.remarks?.toLowerCase().includes(search.toLowerCase());
    });

    this.generateMeatInspectionPDF(filteredRecords, {});
  }
}; 