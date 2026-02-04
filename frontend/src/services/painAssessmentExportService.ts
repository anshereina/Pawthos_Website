import { PainAssessment } from './painAssessmentService';

export const painAssessmentExportService = {
  // Export selected assessments to CSV
  exportToCSV(assessments: PainAssessment[]) {
    if (assessments.length === 0) {
      alert('No assessments selected for export.');
      return;
    }

    // CSV Headers
    const headers = [
      'Assessment ID',
      'Pet Name',
      'Pet Type',
      'Pain Level',
      'Assessment Date',
      'Recommendations',
      'Has Image',
      'Created At'
    ];

    // Convert assessments to CSV rows
    const csvRows = assessments.map(assessment => {
      const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return dateString;
          return date.toLocaleString();
        } catch {
          return dateString;
        }
      };

      return [
        assessment.id.toString(),
        assessment.pet_name || '-',
        assessment.pet_type || '-',
        assessment.pain_level || '-',
        formatDate(assessment.assessment_date),
        assessment.recommendations || '-',
        assessment.image_url ? 'Yes' : 'No',
        formatDate(assessment.created_at)
      ];
    });

    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Build CSV content
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...csvRows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `pain-assessments-${dateStr}-${now.getTime()}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

