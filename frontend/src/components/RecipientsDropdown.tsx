import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { userService, Recipient } from '../services/userService';

interface RecipientsDropdownProps {
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  placeholder?: string;
}

const RecipientsDropdown: React.FC<RecipientsDropdownProps> = ({
  selectedRecipients,
  onRecipientsChange,
  placeholder = "Select recipients..."
}) => {
  // Ensure selectedRecipients is always an array
  const safeSelectedRecipients = Array.isArray(selectedRecipients) ? selectedRecipients : [];
  const [isOpen, setIsOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const searchTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchRecipients = async (q: string) => {
      setLoading(true);
      try {
        const fetchedRecipients = await userService.getRecipients(q);
        setRecipients(fetchedRecipients);
      } catch (error) {
        console.error('Error fetching recipients:', error);
        setRecipients([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      // Debounce search
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
      // @ts-ignore - setTimeout returns number in browser
      searchTimeoutRef.current = window.setTimeout(() => {
        fetchRecipients(search.trim());
      }, 250);
    }

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isOpen, search]);

  const handleRecipientToggle = (email: string) => {
    const newRecipients = safeSelectedRecipients.includes(email)
      ? safeSelectedRecipients.filter(r => r !== email)
      : [...safeSelectedRecipients, email];
    onRecipientsChange(newRecipients);
  };

  const handleAllUsersToggle = () => {
    const isAllUsersSelected = safeSelectedRecipients.includes('ALL_USERS');
    if (isAllUsersSelected) {
      // Remove ALL_USERS from selection
      const newRecipients = safeSelectedRecipients.filter(r => r !== 'ALL_USERS');
      onRecipientsChange(newRecipients);
    } else {
      // Add ALL_USERS to selection
      const newRecipients = [...safeSelectedRecipients, 'ALL_USERS'];
      onRecipientsChange(newRecipients);
    }
  };

  const removeRecipient = (email: string) => {
    const newRecipients = safeSelectedRecipients.filter(r => r !== email);
    onRecipientsChange(newRecipients);
  };

  // recipients are already in the correct format from the API

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="recipients-dropdown-list"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 min-h-6">
              {safeSelectedRecipients.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                safeSelectedRecipients.map(email => {
                  if (email === 'ALL_USERS') {
                    return (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        <span>All Users</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecipient(email);
                          }}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  }
                  const recipient = recipients.find(r => r.email === email);
                  return (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      <span>{recipient?.name || email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecipient(email);
                        }}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div id="recipients-dropdown-list" className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {/* Search */}
            <div className="px-3 py-2 border-b border-gray-200 sticky top-0 bg-white">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search name or email..."
              />
            </div>
            {/* All Users option */}
            <div
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
              onClick={handleAllUsersToggle}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-600">All Users</div>
                  <div className="text-xs text-gray-500">Notify all users in the system</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                  Broadcast
                </span>
              </div>
              {safeSelectedRecipients.includes('ALL_USERS') && (
                <Check size={16} className="text-blue-600" />
              )}
            </div>

            {loading ? (
              <div className="px-3 py-2 text-gray-500 text-sm">Loading...</div>
            ) : recipients.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No users found</div>
            ) : (
              recipients.map((recipient) => (
                <div
                  key={recipient.email}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRecipientToggle(recipient.email)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{recipient.name}</div>
                      <div className="text-xs text-gray-500">{recipient.email}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {recipient.type}
                    </span>
                  </div>
                  {safeSelectedRecipients.includes(recipient.email) && (
                    <Check size={16} className="text-green-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientsDropdown; 