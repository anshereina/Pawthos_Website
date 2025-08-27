import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Syringe, Hash, User, Phone, PawPrint, Plus, Edit, Trash2, Save, HelpCircle, FileText, Search, ChevronDown } from 'lucide-react';
import { vaccinationDriveService, VaccinationDriveData } from '../services/vaccinationDriveService';
import { petService, Pet } from '../services/petService';
import { userService, User as UserType } from '../services/userService';

interface VaccinationEvent {
  id: number;
  event_date: string;
  barangay: string;
  service_coordinator: string;
  status: string;
  event_title: string;
}

interface PetVaccinationRecord {
  id: number;
  ownerName: string;
  petName: string;
  ownerContact: string;
  species: string;
  breed: string;
  color: string;
  age: string;
  sex: string;
  otherServices: string[];
}

interface VaccinationDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: VaccinationEvent | null;
}

const VaccinationDriveModal: React.FC<VaccinationDriveModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    barangay: '',
    vaccineUsed: '',
    batchNoLotNo: '',
  });

  const [petRecords, setPetRecords] = useState<PetVaccinationRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<PetVaccinationRecord | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Data for dropdowns
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Dropdown visibility states - track which record is showing dropdown
  const [activeOwnerDropdown, setActiveOwnerDropdown] = useState<number | null>(null);
  const [activePetDropdown, setActivePetDropdown] = useState<number | null>(null);

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        date: event.event_date || '',
        barangay: event.barangay || '',
        vaccineUsed: '',
        batchNoLotNo: '',
      });
    }
  }, [event]);

  // Fetch pets and users data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPets();
      fetchUsers();
    }
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setActiveOwnerDropdown(null);
        setActivePetDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const petsData = await petService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Helper functions for dropdowns
  const getFilteredOwners = (searchTerm: string) => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredPets = (searchTerm: string, ownerName?: string) => {
    let filteredPets = pets;
    
    // If owner is selected, filter pets by that owner
    if (ownerName) {
      filteredPets = pets.filter(pet => pet.owner_name === ownerName);
    }
    
    // Then filter by search term
    return filteredPets.filter(pet => 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const barangayOptions = [
    'Barangay San Antonio',
    'Barangay San Pedro',
    'Barangay San Jose',
    'Barangay San Miguel',
    'Barangay San Isidro',
    'Barangay San Nicolas',
    'Barangay San Vicente',
    'Barangay San Lorenzo',
  ];

  const vaccineOptions = [
    'Nobivac Rabies',
    'Defensor 3',
    'Rabisin',
    'Rabvac 3',
    'Imrab 3',
    'Rabies Vaccine (Generic)',
  ];

  const speciesOptions = ['Dog', 'Cat', 'Other'];
  const sexOptions = ['Male', 'Female'];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addPetRecord = () => {
    const newRecord: PetVaccinationRecord = {
      id: Date.now(),
      ownerName: '',
      petName: '',
      ownerContact: '',
      species: '',
      breed: '',
      color: '',
      age: '',
      sex: '',
      otherServices: [],
    };
    setPetRecords(prev => [...prev, newRecord]);
  };

  const addMultiplePetRecords = (count: number) => {
    const newRecords: PetVaccinationRecord[] = Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      ownerName: '',
      petName: '',
      ownerContact: '',
      species: '',
      breed: '',
      color: '',
      age: '',
      sex: '',
      otherServices: [],
    }));
    setPetRecords(prev => [...prev, ...newRecords]);
  };

  const updatePetRecord = (id: number, field: keyof PetVaccinationRecord, value: string | string[]) => {
    setPetRecords(prev => prev.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
  };

  const deletePetRecord = (id: number) => {
    setPetRecords(prev => prev.filter(record => record.id !== id));
  };

  const addOtherService = (recordId: number, service: string) => {
    if (service.trim()) {
      updatePetRecord(recordId, 'otherServices', [...petRecords.find(r => r.id === recordId)?.otherServices || [], service.trim()]);
    }
  };

  const removeOtherService = (recordId: number, serviceIndex: number) => {
    const record = petRecords.find(r => r.id === recordId);
    if (record) {
      const updatedServices = record.otherServices.filter((_, index) => index !== serviceIndex);
      updatePetRecord(recordId, 'otherServices', updatedServices);
    }
  };

  const handleSave = async () => {
    if (!event) return;

    // Validate required fields
    if (!formData.vaccineUsed || !formData.batchNoLotNo) {
      alert('Please fill in the vaccine used and batch/lot number.');
      return;
    }

    // Validate pet records
    const incompleteRecords = petRecords.filter(r => !r.ownerName || !r.petName || !r.ownerContact);
    if (incompleteRecords.length > 0) {
      alert(`Please complete ${incompleteRecords.length} record(s) before saving.`);
      return;
    }

    setSaving(true);
    try {
      const driveData: VaccinationDriveData = {
        event_id: event.id,
        vaccine_used: formData.vaccineUsed,
        batch_no_lot_no: formData.batchNoLotNo,
        pet_records: petRecords.map(record => ({
          owner_name: record.ownerName,
          pet_name: record.petName,
          owner_contact: record.ownerContact,
          species: record.species,
          breed: record.breed,
          color: record.color,
          age: record.age,
          sex: record.sex,
          other_services: record.otherServices,
          vaccine_used: formData.vaccineUsed,
          batch_no_lot_no: formData.batchNoLotNo,
          vaccination_date: event.event_date,
        })),
      };

      await vaccinationDriveService.saveVaccinationDrive(driveData);
      alert('Vaccination drive data saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save vaccination drive:', error);
      alert('Failed to save vaccination drive data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, recordId: number, field: keyof PetVaccinationRecord) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const currentIndex = petRecords.findIndex(r => r.id === recordId);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < petRecords.length) {
        // Focus next row, first field
        const nextInput = document.querySelector(`input[data-record-id="${petRecords[nextIndex].id}"][data-field="ownerName"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      } else if (e.key === 'Enter') {
        // Add new row if pressing Enter on last row
        addPetRecord();
      }
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-green-800 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X size={24} />
            </button>
            <h1 className="text-2xl font-bold">Vaccination Drive</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-green-200 hover:text-white transition-colors flex items-center space-x-2">
              <HelpCircle size={20} />
              <span>Help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Event Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <div className="relative">
                <FileText size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={event.event_title || ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Event title from vaccination event"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barangay
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.barangay}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Barangay from vaccination event"
                />
              </div>
            </div>

            {/* Service Coordinator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Coordinator
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={event.service_coordinator || ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="Service coordinator from vaccination event"
                />
              </div>
            </div>
          </div>

          {/* Vaccine Information Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vaccine Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vaccine Used */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaccine Used
                </label>
                <div className="relative">
                  <Syringe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="vaccineUsed"
                    value={formData.vaccineUsed}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select Vaccine</option>
                    {vaccineOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch No./Lot No. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch No./Lot No.
                </label>
                <div className="relative">
                  <Hash size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="batchNoLotNo"
                    value={formData.batchNoLotNo}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter batch/lot number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Individual Pet Vaccination Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Individual Pet Vaccination Records</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Add rows:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    defaultValue="5"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    id="rowCount"
                  />
                  <button
                    onClick={() => {
                      const count = parseInt((document.getElementById('rowCount') as HTMLInputElement)?.value || '5');
                      addMultiplePetRecords(count);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    <span>Add Multiple</span>
                  </button>
                </div>
                <button
                  onClick={addPetRecord}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
                >
                  <Plus size={20} />
                  <span>Add Single</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Records: {petRecords.length}</span>
              <span>Filled Records: {petRecords.filter(r => r.ownerName && r.petName).length}</span>
            </div>
          </div>

          {petRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <PawPrint size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No pet records added yet</p>
              <p className="text-sm">Click "Add Single" or "Add Multiple" to start logging vaccinations</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-green-800 text-white sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">#</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Owner's Name</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Pet's Name</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Contact No.</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Species</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Breed</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Color</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Age</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Sex</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Other Service</th>
                    <th className="px-3 py-2 text-left font-medium text-xs border border-green-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {petRecords.map((record, index) => (
                    <tr key={record.id} className={`${index % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-green-100 transition-colors`}>
                      <td className="px-3 py-2 text-center text-xs font-medium border border-gray-200 bg-gray-50">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1 border border-gray-200 relative">
                        <div className="dropdown-container">
                          <input
                            type="text"
                            value={record.ownerName}
                            onChange={(e) => updatePetRecord(record.id, 'ownerName', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, record.id, 'ownerName')}
                            onFocus={() => {
                              setActiveOwnerDropdown(record.id);
                            }}
                            className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                            placeholder="Owner name"
                            data-record-id={record.id}
                            data-field="ownerName"
                          />
                                                    {activeOwnerDropdown === record.id && (
                            <div className="absolute z-50 w-80 mt-1 bg-white border-2 border-green-500 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              <div className="p-2 text-xs bg-gray-100 border-b">DEBUG: Found {getFilteredOwners(record.ownerName).length} users</div>
                              {getFilteredOwners(record.ownerName).length > 0 ? (
                                getFilteredOwners(record.ownerName).map((user) => (
                                  <div
                                    key={user.id}
                                    className="px-3 py-2 hover:bg-green-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                    onClick={() => {
                                      updatePetRecord(record.id, 'ownerName', user.name);
                                      updatePetRecord(record.id, 'ownerContact', user.phone_number || '');
                                      // Clear pet name when owner changes
                                      updatePetRecord(record.id, 'petName', '');
                                      updatePetRecord(record.id, 'species', '');
                                      updatePetRecord(record.id, 'breed', '');
                                      updatePetRecord(record.id, 'color', '');
                                      updatePetRecord(record.id, 'sex', '');
                                      setActiveOwnerDropdown(null);
                                    }}
                                  >
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-gray-500">{user.email}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-gray-500">
                                  No users found. Total users in database: {users.length}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 border border-gray-200 relative">
                        <div className="dropdown-container">
                          <input
                            type="text"
                            value={record.petName}
                            onChange={(e) => updatePetRecord(record.id, 'petName', e.target.value)}
                            onFocus={() => {
                              setActivePetDropdown(record.id);
                            }}
                            className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                            placeholder="Pet name"
                          />
                          {activePetDropdown === record.id && (
                            <div className="absolute z-50 w-80 mt-1 bg-white border-2 border-green-500 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              {getFilteredPets(record.petName, record.ownerName).map((pet) => (
                                <div
                                  key={pet.id}
                                  className="px-3 py-2 hover:bg-green-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    updatePetRecord(record.id, 'petName', pet.name);
                                    updatePetRecord(record.id, 'species', pet.species);
                                    updatePetRecord(record.id, 'breed', pet.breed || '');
                                    updatePetRecord(record.id, 'color', pet.color || '');
                                    updatePetRecord(record.id, 'sex', pet.gender || '');
                                    setActivePetDropdown(null);
                                  }}
                                >
                                  <div className="font-medium">{pet.name}</div>
                                  <div className="text-gray-500">
                                    {pet.species} • {pet.breed || 'Unknown breed'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <input
                          type="tel"
                          value={record.ownerContact}
                          onChange={(e) => updatePetRecord(record.id, 'ownerContact', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                          placeholder="Contact"
                        />
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <select
                          value={record.species}
                          onChange={(e) => updatePetRecord(record.id, 'species', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        >
                          <option value="">-</option>
                          {speciesOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <input
                          type="text"
                          value={record.breed}
                          onChange={(e) => updatePetRecord(record.id, 'breed', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                          placeholder="Breed"
                        />
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <input
                          type="text"
                          value={record.color}
                          onChange={(e) => updatePetRecord(record.id, 'color', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                          placeholder="Color"
                        />
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <input
                          type="text"
                          value={record.age}
                          onChange={(e) => updatePetRecord(record.id, 'age', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                          placeholder="Age"
                        />
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <select
                          value={record.sex}
                          onChange={(e) => updatePetRecord(record.id, 'sex', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-green-500 bg-transparent"
                        >
                          <option value="">-</option>
                          {sexOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {record.otherServices.map((service, serviceIndex) => (
                            <span key={serviceIndex} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                              {service}
                            </span>
                          ))}
                          <button
                            onClick={() => {
                              const service = prompt('Enter other service:');
                              if (service) addOtherService(record.id, service);
                            }}
                            className="text-xs text-green-600 hover:text-green-800"
                            title="Add service"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <div className="flex items-center justify-center space-x-1">
                          <button 
                            onClick={() => deletePetRecord(record.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Delete row"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary and Save Section */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total Records: <span className="font-semibold text-gray-800">{petRecords.length}</span></span>
              <span>Completed: <span className="font-semibold text-green-600">{petRecords.filter(r => r.ownerName && r.petName && r.ownerContact).length}</span></span>
              <span>Incomplete: <span className="font-semibold text-yellow-600">{petRecords.filter(r => !r.ownerName || !r.petName || !r.ownerContact).length}</span></span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationDriveModal; 