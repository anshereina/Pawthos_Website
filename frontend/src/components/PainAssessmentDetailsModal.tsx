import React from 'react';
import { X, PawPrint, Activity, FileText } from 'lucide-react';
import { PainAssessment } from '../services/painAssessmentService';
import { API_BASE_URL } from '../config';

interface PainAssessmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: PainAssessment | null;
}

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

const PainAssessmentDetailsModal: React.FC<PainAssessmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assessment
}) => {
  if (!isOpen || !assessment) return null;

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

          {/* Assessment Image */}
          {assessment.image_url && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PawPrint className="mr-2" size={20} />
                Assessment Photo
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <img
                  src={assessment.image_url.startsWith('http') ? assessment.image_url : `${API_BASE_URL}${assessment.image_url}`}
                  alt="Pain assessment"
                  className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

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
                    const parsed = JSON.parse(assessment.assessment_answers);
                    const isCanine = (assessment.pet_type || '').toLowerCase().includes('dog') || 
                                    (assessment.pet_type || '').toLowerCase().includes('canine');
                    
                    // Check if it's BEAAP format for dogs
                    if (isCanine && parsed.beaap_answers && parsed.assessment_type === 'BEAAP') {
                      const beaapAnswers = parsed.beaap_answers;
                      
                      return beaapCategories.map((category, categoryIndex) => {
                        const selectedIndices = beaapAnswers[categoryIndex] || [];
                        
                        return (
                          <div key={categoryIndex} className="border-b border-gray-200 pb-3 last:border-b-0">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">{category}</h4>
                            {selectedIndices.length > 0 ? (
                              selectedIndices.map((imageIndex: number, idx: number) => (
                                <div key={idx} className="ml-4 mb-2">
                                  <div className="flex items-start space-x-2">
                                    <div className="flex-shrink-0 mt-1">
                                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                      {beaapCategoryDescriptions[categoryIndex]?.[imageIndex] || `Image ${imageIndex + 1}`}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm ml-4 italic">No selections made</p>
                            )}
                          </div>
                        );
                      });
                    }
                    
                    // For cats or non-BEAAP format, show cat questions
                    const answers = Array.isArray(parsed) ? parsed : (parsed.beaap_answers ? null : parsed);
                    if (!answers) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-500 text-sm">No assessment data available</p>
                        </div>
                      );
                    }
                    
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
