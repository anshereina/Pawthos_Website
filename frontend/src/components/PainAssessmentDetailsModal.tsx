import React from 'react';
import { X, Calendar, User, PawPrint, Activity, FileText } from 'lucide-react';
import { PainAssessment } from '../services/painAssessmentService';
import { API_BASE_URL } from '../config';

interface PainAssessmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: PainAssessment | null;
}

const PainAssessmentDetailsModal: React.FC<PainAssessmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assessment
}) => {
  if (!isOpen || !assessment) return null;

  const formatDate = (dateString: string) => {
    try {
      // Handle date strings that might be in local time without timezone info
      let date: Date;
      
      if (dateString.includes(' ')) {
        // Parse as local time
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hours, minutes, seconds || 0);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      // Handle date strings that might be in local time without timezone info
      let date: Date;
      
      if (dateString.includes(' ')) {
        // Parse as local time
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hours, minutes, seconds || 0);
      } else {
        date = new Date(dateString);
      }
      
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

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Pain Assessment Details</h2>
            <p className="text-gray-500 text-sm mt-1">Assessment ID: {assessment.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PawPrint className="mr-2" size={20} />
              Pet Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name
                </label>
                <p className="text-gray-900 font-medium">{assessment.pet_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Type
                </label>
                <p className="text-gray-900 font-medium">{assessment.pet_type}</p>
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="mr-2" size={20} />
              Assessment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Date
                </label>
                <p className="text-gray-900 font-medium">{formatDateTime(assessment.assessment_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pain Level
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assessment.pain_level === 'High' || assessment.pain_level === 'Critical'
                    ? 'bg-red-100 text-red-800'
                    : assessment.pain_level === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {assessment.pain_level}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assessment.questions_completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {assessment.questions_completed ? 'Completed' : 'Pending Review'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-gray-900 font-medium">
                  {assessment.created_at ? formatDateTime(assessment.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {assessment.recommendations && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Recommendations
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-gray-900 whitespace-pre-wrap">{assessment.recommendations}</p>
              </div>
            </div>
          )}

          {/* Assessment Questions and Answers */}
          {assessment.assessment_answers && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Pain Assessment Questions & Answers
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-4">
                {(() => {
                  try {
                    const answers = JSON.parse(assessment.assessment_answers);
                    const questions = [
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

                    return questions.map((question, index) => {
                      const answer = answers[index] || answers[question] || 'Not answered';
                      const isYes = answer === 'Yes' || answer === true || answer === 'yes';
                      
                      return (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${
                                isYes ? 'bg-red-400' : 'bg-green-400'
                              }`}></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 text-sm mb-1">{question}</p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isYes 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isYes ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  } catch (error) {
                    // If parsing fails, show as raw text
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">{assessment.assessment_answers}</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Pain Assessment Questions from basic_answers (fallback) */}
          {assessment.basic_answers && !assessment.assessment_answers && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Pain Assessment Questions & Answers
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-4">
                {(() => {
                  try {
                    const answers = JSON.parse(assessment.basic_answers);
                    const questions = [
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

                    return questions.map((question, index) => {
                      const answer = answers[index] || answers[question] || 'Not answered';
                      const isYes = answer === 'Yes' || answer === true || answer === 'yes';
                      
                      return (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${
                                isYes ? 'bg-red-400' : 'bg-green-400'
                              }`}></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 text-sm mb-1">{question}</p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isYes 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isYes ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  } catch (error) {
                    // If parsing fails, show as raw text
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">{assessment.basic_answers}</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Basic Questions and Answers - Show only if neither assessment_answers nor basic_answers contain pain assessment questions */}
          {assessment.basic_answers && assessment.assessment_answers && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Basic Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-4">
                {(() => {
                  try {
                    const basicAnswers = JSON.parse(assessment.basic_answers);
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

                    return basicQuestions.map((question, index) => {
                      const answer = basicAnswers[index] || basicAnswers[question] || 'Not answered';
                      const isYes = answer === 'Yes' || answer === true || answer === 'yes';
                      const isNo = answer === 'No' || answer === false || answer === 'no';
                      
                      return (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${
                                isYes ? 'bg-green-400' : isNo ? 'bg-red-400' : 'bg-gray-400'
                              }`}></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 text-sm mb-1">{question}</p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isYes 
                                  ? 'bg-green-100 text-green-800' 
                                  : isNo
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isYes ? 'Yes' : isNo ? 'No' : answer}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  } catch (error) {
                    // If parsing fails, show as raw text
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">{assessment.basic_answers}</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Image display removed as requested */}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainAssessmentDetailsModal;
