import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateAlertData } from '../services/alertService';
import RecipientsDropdown from './RecipientsDropdown';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlertData) => Promise<any>;
  userEmail: string;
  userName: string;
}

const AddAlertModal: React.FC<AddAlertModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userEmail,
  userName,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'Medium',
  });
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      return;
    }

    setLoading(true);
    try {
      const recipientsData = selectedRecipients.length > 0 ? JSON.stringify(selectedRecipients) : undefined;
      console.log('Sending alert with recipients:', recipientsData);
      await onSubmit({
        ...formData,
        submitted_by: userName,
        submitted_by_email: userEmail,
        recipients: recipientsData,
      });
      setFormData({ title: '', message: '', priority: 'Medium' });
      setSelectedRecipients([]);
      onClose();
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Send New Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter alert title"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter alert message"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <RecipientsDropdown
              selectedRecipients={selectedRecipients}
              onRecipientsChange={setSelectedRecipients}
              placeholder="Select recipients for this alert..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.message.trim()}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlertModal; 