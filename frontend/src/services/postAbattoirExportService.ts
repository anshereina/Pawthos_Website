// Minimal PDF export for Post Abattoir records using jsPDF & autotable if available
// Falls back to simple text if libs are absent
import { PostAbattoirRecord } from './postAbattoirRecordService';

type ExportOptions = { date?: string; };

export const postAbattoirExportService = {
  generatePDF(records: PostAbattoirRecord[], _options: ExportOptions = {}) {
    // Try dynamic import of jsPDF
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF('landscape');
      
      // Add logos to header
      try {
        // Add CityVet logo on the left
        const cityVetLogo = '/images/logos/CityVet.jpg';
        doc.addImage(cityVetLogo, 'JPEG', 10, 5, 20, 20);
        
        // Add SanPedro logo on the right
        const sanPedroLogo = '/images/logos/SanPedro.png';
        doc.addImage(sanPedroLogo, 'PNG', 267, 5, 20, 20);
      } catch (error) {
        console.warn('Failed to load logos:', error);
      }
      
      // Header
      doc.setFontSize(14);
      doc.text('Post Abattoir Inspection Records', 148.5, 16, { align: 'center' });

      const body = records.map(r => [
        new Date(r.date).toLocaleDateString(),
        r.time,
        r.barangay,
        r.establishment,
      ]);

      const head = [['Date', 'Time', 'Barangay', 'Establishment']];

      // Try autotable
      const autoTable = (doc as any).autoTable;
      if (autoTable) {
        autoTable.call(doc, { head, body, startY: 28, styles: { fontSize: 8 } });
      } else {
        // Simple manual table
        let y = 26;
        doc.setFontSize(10);
        doc.text(head[0].join(' | '), 14, 22);
        body.forEach(row => {
          doc.text(row.join(' | '), 14, y);
          y += 6;
        });
      }

      doc.save('post_abattoir_records.pdf');
    } catch (e) {
      // Fallback: open simple printable window
      const content = [
        'Post Abattoir Inspection Records',
        '',
        ['Date', 'Time', 'Barangay', 'Establishment'].join('\t'),
        ...records.map(r => [new Date(r.date).toLocaleDateString(), r.time, r.barangay, r.establishment].join('\t')),
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'post_abattoir_records.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  },
};


