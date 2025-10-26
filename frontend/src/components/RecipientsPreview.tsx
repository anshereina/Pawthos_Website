import React, { useState } from 'react';
import { Eye, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface RecipientsPreviewProps {
  recipients: string[];
  maxVisible?: number;
  className?: string;
}

const RecipientsPreview: React.FC<RecipientsPreviewProps> = ({
  recipients,
  maxVisible = 3,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);

  if (!recipients || recipients.length === 0) {
    return (
      <span className="text-gray-500 text-sm">No recipients</span>
    );
  }

  // If there are many recipients, just show "All Users"
  if (recipients.length > 5) {
    return (
      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
        All Users ({recipients.length})
      </span>
    );
  }

  const visibleRecipients = isExpanded ? recipients : recipients.slice(0, maxVisible);
  const hasMore = recipients.length > maxVisible;

  const handleViewAll = () => {
    setShowAllModal(true);
  };

  return (
    <>
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {visibleRecipients.map((recipient, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {recipient}
          </span>
        ))}
        
        {hasMore && !isExpanded && (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{recipients.length - maxVisible} more
            </span>
            <button
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
              title="Show more recipients"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        )}
        
        {hasMore && isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
            title="Show less"
          >
            <ChevronUp size={12} />
          </button>
        )}
        
        {recipients.length > 5 && (
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
            title="View all recipients"
          >
            <Eye size={12} />
            View All
          </button>
        )}
      </div>

      {/* Modal to show all recipients */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users size={20} />
                All Recipients ({recipients.length})
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-800">{recipient}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAllModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipientsPreview;
