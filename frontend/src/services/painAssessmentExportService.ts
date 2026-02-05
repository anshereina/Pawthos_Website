import { PainAssessment } from './painAssessmentService';
import jsPDF from 'jspdf';
import { API_BASE_URL } from '../config';

// BEAAP categories for canine assessments
const beaapCategories = [
  'Breathing',
  'Eyes', 
  'Ambulation',
  'Activity',
  'Appetite',
  'Attitude',
  'Posture'
];

const beaapCategoryDescriptions: { [key: number]: string[] } = {
  0: [ // Breathing
    'Breathing calmly at rest',
    'Breathing normally during activity',
    'May sometimes have trouble catching their breath',
    'Often breathes heavily and may need extra effort to breathe',
    'Breathing is fast and often looks harder than normal, with frequent panting',
    'Panting with faster and more difficult breathing'
  ],
  1: [ // Eyes
    'Eyes bright and alert',
    'Eyes bright and alert',
    'Eyes slightly more dull in appearance; can have a slightly furrowed brow',
    'Dull eyes; worried look',
    'Dull eyes; seems distant or unfocused',
    'Dull eyes; have a pained look'
  ],
  2: [ // Ambulation
    'Moves normally on all four legs with no difficulty or discomfort',
    'Walks normally; may show slight discomfort',
    'Noticeably slower to lie down or rise up; may exhibit "lameness" when walking',
    'Very slow to rise up and lie down; hesitation with movement; difficulty on stairs; reluctant to turn corners; stiff to start out; may be limping',
    'Obvious difficulty rising up or lying down; will not bear weight on affected leg; avoids stairs; obvious lameness',
    'May refuse to get up; may not be able to or willing to take more than a few steps; will not bear weight on affected limb'
  ],
  3: [ // Activity
    'Engages in play and all normal activities',
    'May be slightly slower to lie down or get up',
    'May be a bit restless, having trouble getting comfortable and shifting weight',
    'Do not want to interact but may be in a room with a family member; obvious lameness when walking; may lick painful area',
    'Avoids interaction with family or environment; unwilling to get up or move; may frequently lick a painful area',
    'Difficulty in being distracted from pain, even with gentle touch or something familiar'
  ],
  4: [ // Appetite
    'Eating and drinking normally',
    'Eating and drinking normally',
    'Picky eater; may only want treats or human food',
    'Frequently not interested in eating',
    'Loss of appetite; may not want to drink',
    'No interest in food or water'
  ],
  5: [ // Attitude
    'Happy; interested in surroundings and playing; seeks attention',
    'Happy and alert, though sometimes a bit quiet; overall behaves normally',
    'Less lively; doesn\'t initiate play',
    'Feels unsettled and can\'t sleep well',
    'Scared, anxious, and may act aggressive',
    'Extremely low energy; lying motionless and clearly in pain'
  ],
  6: [ // Posture
    'Comfortable at rest and during play; ears up and wagging tail',
    'May show occasional shifting of position; tail may be down just a little more; ears slightly flatter',
    'May shift weight or favor one leg; tail may be down more often',
    'Obvious weight shifting; tail down; ears back; may be hunched',
    'Hunched posture; tail tucked; ears pinned back; obvious discomfort',
    'Extremely hunched or rigid posture; tail completely tucked; ears flat; clearly in severe pain'
  ]
};

const catQuestions = [
  "Reluctance to jump onto counters or furniture (does it less)",
  "Difficulty jumping up or down from counters or furniture (falls or seems clumsy)",
  "Difficulty or avoids going up or down stairs",
  "Less playful",
  "Restlessness or difficulty finding a comfortable position",
  "Vocalizing (purring, or hissing) when touched or moving",
  "Decreased appetite",
  "Less desire to interact with people or animals (hiding, resisting being pet, brushed, held, or picked up)",
  "Excessive licking, biting or scratching a body part",
  "Sleeping in an unusual position or unusual location",
  "Unusual aggression when approached or touched (biting, hissing, ears pinned back)",
  "Changes in eye expression (staring, enlarged pupils, vacant look, or squinting)",
  "Stopped using or has difficulty getting in or out of litter box",
  "Stopped grooming completely or certain areas"
];

const basicQuestions = [
  "Is your pet eating normally?",
  "Is your pet drinking normally?",
  "Is your pet urinating normally?",
  "Is your pet defecating normally?",
  "Is your pet sleeping normally?",
  "Is your pet active and playful?",
  "Is your pet vocalizing more than usual?",
  "Is your pet hiding or avoiding interaction?",
  "Is your pet limping or having difficulty moving?",
  "Is your pet showing signs of pain when touched?"
];

// Helper function to format date
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    let date: Date;
    if (dateString.includes(' ')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      date = new Date(year, month - 1, day, hours, minutes, seconds || 0);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// Helper function to load image as base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const painAssessmentExportService = {
  // Export selected assessments to PDF
  async exportToPDF(assessments: PainAssessment[]) {
    if (assessments.length === 0) {
      alert('No assessments selected for export.');
      return;
    }

    // Load logos
    let unaLogoBase64: string | null = null;
    let cityVetLogoBase64: string | null = null;

    try {
      unaLogoBase64 = await loadImageAsBase64('/images/logos/una_sa_laguna.png');
    } catch (error) {
      console.warn('Could not load una_sa_laguna.png logo:', error);
    }

    try {
      cityVetLogoBase64 = await loadImageAsBase64('/images/logos/CityVet.jpg');
    } catch (error) {
      console.warn('Could not load CityVet.jpg logo:', error);
    }

    // Export each assessment as a separate PDF
    for (const assessment of assessments) {
      await this.generatePDFForAssessment(assessment, unaLogoBase64, cityVetLogoBase64);
    }
  },

  async generatePDFForAssessment(
    assessment: PainAssessment,
    unaLogoBase64: string | null,
    cityVetLogoBase64: string | null
  ) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Header with logos
    const logoHeight = 25;
    
    if (unaLogoBase64) {
      try {
        doc.addImage(unaLogoBase64, 'PNG', margin, yPos, 40, logoHeight);
      } catch (error) {
        console.warn('Could not add una logo:', error);
      }
    }
    
    if (cityVetLogoBase64) {
      try {
        doc.addImage(cityVetLogoBase64, 'JPG', pageWidth - margin - 40, yPos, 40, logoHeight);
      } catch (error) {
        console.warn('Could not add city vet logo:', error);
      }
    }

    yPos += logoHeight + 15;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pain Assessment Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Assessment ID
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assessment ID: ${assessment.id}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Pet Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pet Information', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pet Name: ${assessment.pet_name || 'N/A'}`, margin, yPos);
    yPos += 7;
    doc.text(`Pet Type: ${assessment.pet_type || 'N/A'}`, margin, yPos);
    yPos += 10;

    // Assessment Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Details', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assessment Date: ${formatDateTime(assessment.assessment_date)}`, margin, yPos);
    yPos += 7;
    doc.text(`Pain Level: ${assessment.pain_level || 'N/A'}`, margin, yPos);
    yPos += 7;
    if (assessment.created_at) {
      doc.text(`Created At: ${formatDateTime(assessment.created_at)}`, margin, yPos);
      yPos += 7;
    }
    yPos += 5;

    // Assessment Image
    if (assessment.image_url) {
      const imageUrl = assessment.image_url.startsWith('http') 
        ? assessment.image_url 
        : assessment.image_url.startsWith('/')
        ? `${API_BASE_URL}${assessment.image_url}`
        : `${API_BASE_URL}/${assessment.image_url}`;
      
      try {
        const imageBase64 = await loadImageAsBase64(imageUrl);
        const imgWidth = 80;
        const imgHeight = 60;
        
        // Check if we need a new page
        if (yPos + imgHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Assessment Photo', margin, yPos);
        yPos += 8;
        
        doc.addImage(imageBase64, 'JPEG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      } catch (error) {
        console.warn('Could not load assessment image:', error);
      }
    }

    // Recommendations
    if (assessment.recommendations) {
      // Check if we need a new page
      if (yPos + 30 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const recommendationsLines = doc.splitTextToSize(assessment.recommendations, pageWidth - 2 * margin);
      doc.text(recommendationsLines, margin, yPos);
      yPos += recommendationsLines.length * 5 + 10;
    }

    // Assessment Questions and Answers
    if (assessment.assessment_answers) {
      try {
        const parsed = JSON.parse(assessment.assessment_answers);
        const isCanine = (assessment.pet_type || '').toLowerCase().includes('dog') || 
                        (assessment.pet_type || '').toLowerCase().includes('canine');
        
        // Check if we need a new page
        if (yPos + 30 > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Pain Assessment Questions & Answers', margin, yPos);
        yPos += 10;

        // BEAAP format for dogs
        if (isCanine && parsed.beaap_answers && parsed.assessment_type === 'BEAAP') {
          const beaapAnswers = parsed.beaap_answers;
          
          beaapCategories.forEach((category, categoryIndex) => {
            const selectedIndices = beaapAnswers[categoryIndex] || [];
            
            // Check if we need a new page
            if (yPos + 20 > pageHeight - margin) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${category}:`, margin, yPos);
            yPos += 7;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            if (selectedIndices.length > 0) {
              selectedIndices.forEach((imageIndex: number) => {
                const description = beaapCategoryDescriptions[categoryIndex]?.[imageIndex] || `Image ${imageIndex + 1}`;
                const lines = doc.splitTextToSize(`• ${description}`, pageWidth - 2 * margin - 10);
                doc.text(lines, margin + 5, yPos);
                yPos += lines.length * 5;
              });
            } else {
              doc.text('No selections made', margin + 5, yPos);
              yPos += 5;
            }
            yPos += 5;
          });
        } else {
          // Cat questions format
          const answers = Array.isArray(parsed) ? parsed : (parsed.beaap_answers ? null : parsed);
          
          if (answers) {
            catQuestions.forEach((question, index) => {
              const answer = answers[index] || answers[question] || 'Not answered';
              const isYes = answer === 'Yes' || answer === true || answer === 'yes';
              
              // Check if we need a new page
              if (yPos + 15 > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
              }

              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              const questionLines = doc.splitTextToSize(question, pageWidth - 2 * margin - 20);
              doc.text(questionLines, margin + 5, yPos);
              yPos += questionLines.length * 5;
              
              doc.setFont('helvetica', 'bold');
              doc.text(`Answer: ${isYes ? 'Yes' : 'No'}`, margin + 5, yPos);
              yPos += 8;
            });
          }
        }
      } catch (error) {
        // If parsing fails, show as raw text
        if (yPos + 30 > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Assessment Answers', margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const answerLines = doc.splitTextToSize(assessment.assessment_answers, pageWidth - 2 * margin);
        doc.text(answerLines, margin, yPos);
        yPos += answerLines.length * 5 + 10;
      }
    }

    // Basic Questions (if available and not already shown)
    if (assessment.basic_answers && !assessment.assessment_answers) {
      try {
        const basicAnswers = JSON.parse(assessment.basic_answers);
        
        // Check if we need a new page
        if (yPos + 30 > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Basic Information', margin, yPos);
        yPos += 10;

        basicQuestions.forEach((question, index) => {
          const answer = basicAnswers[index] || basicAnswers[question] || 'Not answered';
          const isYes = answer === 'Yes' || answer === true || answer === 'yes';
          const isNo = answer === 'No' || answer === false || answer === 'no';
          
          // Check if we need a new page
          if (yPos + 15 > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const questionLines = doc.splitTextToSize(question, pageWidth - 2 * margin - 20);
          doc.text(questionLines, margin + 5, yPos);
          yPos += questionLines.length * 5;
          
          doc.setFont('helvetica', 'bold');
          doc.text(`Answer: ${isYes ? 'Yes' : isNo ? 'No' : answer}`, margin + 5, yPos);
          yPos += 8;
        });
      } catch (error) {
        console.warn('Could not parse basic answers:', error);
      }
    }

    // Save PDF
    const petName = (assessment.pet_name || 'Unknown').replace(/[^a-z0-9]/gi, '_');
    const filename = `PainAssessment-${petName}.pdf`;
    doc.save(filename);
  }
};

