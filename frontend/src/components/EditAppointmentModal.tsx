import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  appointment: any;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  appointment 
}) => {
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    time: '',
    veterinarian: '',
    medicineUsed: '',
    notes: '',
    status: '',
  });

  useEffect(() => {
    if (appointment) {
      // Handle time formatting - it might come as "HH:MM:SS" or "HH:MM"
      let timeValue = appointment.time || '';
      if (timeValue && timeValue.length > 5) {
        // Trim seconds if present (e.g., "10:30:00" -> "10:30")
        timeValue = timeValue.substring(0, 5);
      }

      // Parse notes to extract Medicine Used and other data
      let extractedMedicineUsed = '';
      let extractedContactNumber = '';
      let extractedOwnerBirthday = '';
      let extractedMessageRemarks = '';
      
      if (appointment.notes) {
        const notesParts = appointment.notes.split(' | ');
        notesParts.forEach((part: string) => {
          if (part.startsWith('Medicine Used: ')) {
            extractedMedicineUsed = part.replace('Medicine Used: ', '');
          } else if (part.startsWith('Contact: ')) {
            extractedContactNumber = part.replace('Contact: ', '');
          } else if (part.startsWith('Owner Birthday: ')) {
            extractedOwnerBirthday = part.replace('Owner Birthday: ', '');
          } else if (!part.startsWith('Medicine Used: ') && !part.startsWith('Contact: ') && !part.startsWith('Owner Birthday: ')) {
            if (extractedMessageRemarks) {
              extractedMessageRemarks += ' | ' + part;
            } else {
              extractedMessageRemarks = part;
            }
          }
        });
        if (!extractedMedicineUsed && !extractedContactNumber && !extractedOwnerBirthday && appointment.notes) {
          extractedMessageRemarks = appointment.notes;
        }
      }

      setFormData({
        type: appointment.type || '',
        date: appointment.date || '',
        time: timeValue,
        veterinarian: appointment.veterinarian || 'Dr. Fe Templado',
        medicineUsed: extractedMedicineUsed,
        notes: extractedMessageRemarks,
        status: appointment.status || 'Pending',
      });
    }
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reconstruct notes with Medicine Used and other structured data
    const noteParts = [];
    if (formData.medicineUsed) {
      noteParts.push(`Medicine Used: ${formData.medicineUsed}`);
    }
    if (contactNumber) {
      noteParts.push(`Contact: ${contactNumber}`);
    }
    if (ownerBirthday) {
      noteParts.push(`Owner Birthday: ${ownerBirthday}`);
    }
    if (formData.notes) {
      noteParts.push(formData.notes);
    }
    
    const reconstructedNotes = noteParts.join(' | ');
    
    // Submit with reconstructed notes
    onSubmit({
      ...formData,
      notes: reconstructedNotes
    });
  };

  if (!isOpen) return null;

  // Parse notes to extract structured data
  const parseNotes = (notes: string) => {
    let medicineUsed = '';
    let contactNumber = '';
    let ownerBirthday = '';
    let messageRemarks = '';
    
    if (notes) {
      const notesParts = notes.split(' | ');
      notesParts.forEach(part => {
        if (part.startsWith('Medicine Used: ')) {
          medicineUsed = part.replace('Medicine Used: ', '');
        } else if (part.startsWith('Contact: ')) {
          contactNumber = part.replace('Contact: ', '');
        } else if (part.startsWith('Owner Birthday: ')) {
          ownerBirthday = part.replace('Owner Birthday: ', '');
        } else if (!part.startsWith('Medicine Used: ') && !part.startsWith('Contact: ') && !part.startsWith('Owner Birthday: ')) {
          if (messageRemarks) {
            messageRemarks += ' | ' + part;
          } else {
            messageRemarks = part;
          }
        }
      });
      if (!medicineUsed && !contactNumber && !ownerBirthday && notes) {
        messageRemarks = notes;
      }
    }
    
    return { medicineUsed, contactNumber, ownerBirthday, messageRemarks };
  };

  const { medicineUsed, contactNumber, ownerBirthday, messageRemarks } = parseNotes(appointment?.notes || '');
  
  // Get owner and pet information
  const ownerName = appointment?.owner_name || appointment?.client_name || appointment?.user?.name || appointment?.pet?.owner_name || '-';
  const petName = appointment?.pet_name || appointment?.pet?.name || '-';
  const petSpecies = appointment?.pet_species || appointment?.pet?.species || '-';
  const petBreed = appointment?.pet_breed || appointment?.pet?.breed || '-';
  const petAge = appointment?.pet_age || '-';
  const petGender = appointment?.pet_gender || appointment?.pet?.gender || '-';
  const petBirthday = appointment?.pet?.date_of_birth || '-';
  const reproductiveStatus = appointment?.pet?.reproductive_status || '-';

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '-') return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner and Pet Information - Read Only */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Owner & Pet Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Owner's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner's Name
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {ownerName}
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {contactNumber || appointment?.user?.phone_number || '-'}
                  </div>
                </div>

                {/* Owner's Birthday */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner's Birthday
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {ownerBirthday ? formatDate(ownerBirthday) : '-'}
                  </div>
                </div>

                {/* Pet's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet's Name
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {petName}
                  </div>
                </div>

                {/* Type of Species */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Species
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {petSpecies}
                  </div>
                </div>

                {/* Pet's Birthday */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet's Birthday
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {petBirthday !== '-' ? formatDate(petBirthday) : '-'}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {petAge}
                  </div>
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {petBreed}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {petGender}
                  </div>
                </div>

                {/* Reproductive Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reproductive Status
                  </label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {reproductiveStatus !== '-' ? reproductiveStatus : '-'}
                  </div>
                </div>
              </div>

            </div>

            {/* Editable Appointment Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment For *
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Checkup, Vaccination, Surgery"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      date: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      time: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Veterinarian
                  </label>
                  <input
                    type="text"
                    value={formData.veterinarian}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      veterinarian: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Dr. Ma Fe Templado"
                  />
                </div>
              </div>
            </div>

            {/* Medicine Used - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Used
              </label>
              <input
                type="text"
                value={formData.medicineUsed}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  medicineUsed: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter medicine or vaccine used"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Pending">Pending</option>
                <option value="Approve">Approve</option>
                <option value="Completed">Completed</option>
                <option value="Cancel">Cancel</option>
                <option value="Resched">Resched</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message/Remarks
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Additional notes about the appointment"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
              >
                Update Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;







































