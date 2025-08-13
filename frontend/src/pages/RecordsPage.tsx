import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { UserCircle, ChevronDown, User, Settings, LogOut, Syringe, Clipboard, Dog, Building, Truck } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';

// Record Card Component
interface RecordCardProps {
  title: string;
  description: string;
  backgroundImage: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ 
  title, 
  description, 
  backgroundImage, 
  icon, 
  onClick 
}) => (
  <div 
    className="relative overflow-hidden rounded-lg border border-gray-200 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
    onClick={onClick}
  >
    {/* Background Image with Green Overlay */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    />
    <div className="absolute inset-0 bg-green-600 bg-opacity-70 group-hover:bg-opacity-60 transition-all duration-300" />
    
    {/* Content */}
    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
      {/* Icon */}
      <div className="flex justify-end">
        <div className="bg-gray-800 bg-opacity-80 rounded-full p-3">
          {icon}
        </div>
      </div>
      
      {/* Text Content */}
      <div className="text-white">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm leading-relaxed opacity-90">{description}</p>
      </div>
    </div>
  </div>
);

// Main Records Page
const RecordsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        target.closest('.user-info-area') === null &&
        target.closest('.user-dropdown-menu') === null
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleCardClick = (recordType: string) => {
    if (recordType === 'vaccination') {
      router.navigate({ to: '/records/vaccination' });
    } else if (recordType === 'medical') {
      router.navigate({ to: '/records/medical' });
    } else if (recordType === 'meat-inspection') {
      router.navigate({ to: '/records/meat-inspection' });
    } else if (recordType === 'animal-control') {
      router.navigate({ to: '/records/animal-control' });
    } else if (recordType === 'shipping-permit') {
      router.navigate({ to: '/records/shipping-permit' });
    } else {
      // You can add navigation for other record types here
      console.log(`Navigating to ${recordType} records`);
    }
  };

  const recordCards = [
    {
      title: "Vaccination Records",
      description: "Tracks all vaccinations administered to animals, including date, type of vaccine, animal owner, and attending veterinarian.",
      backgroundImage: "/images/pictures/vaccination.png",
      icon: <Syringe size={24} className="text-white" />,
      type: "vaccination"
    },
    {
      title: "Medical Records",
      description: "Contains comprehensive health information of animals, such as diagnoses, treatments, medications, and clinical notes from veterinary check-ups.",
      backgroundImage: "/images/pictures/medical.png",
      icon: <Clipboard size={24} className="text-white" />,
      type: "medical"
    },
    {
      title: "Animal Control Records",
      description: "Logs the activity and details of animal seizures, including dates, locations, species captured, and purpose of capture (e.g., rabies suspect).",
      backgroundImage: "/images/pictures/animalcontrol.png",
      icon: <Dog size={24} className="text-white" />,
      type: "animal-control"
    },
    {
      title: "Meat Inspection Records",
      description: "Documents the inspection results of meat products, ensuring they meet safety and quality standards before distribution or sale.",
      backgroundImage: "/images/pictures/meatinspection.png",
      icon: <Building size={24} className="text-white" />,
      type: "meat-inspection"
    },
    {
      title: "Shipping Permit Records",
      description: "Records the issuance of permits required for transporting live animals or meat products, including details on origin, destination, and compliance.",
      backgroundImage: "/images/pictures/shippingpermit.png",
      icon: <Truck size={24} className="text-white" />,
      type: "shipping-permit"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-inter w-full">
      <Sidebar
        items={navigationItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        isExpanded={isExpanded}
        onToggleExpand={toggleSidebar}
      />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Records Management</h1>
          <div className="relative flex items-center space-x-4 user-info-area">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              <UserCircle size={28} className="text-gray-600" />
              <div className="flex flex-col items-start">
                <span className="text-gray-800 font-medium">{user?.name || ''}</span>
                <span className="text-gray-500 text-sm">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
              </div>
              <ChevronDown size={20} className="text-gray-500" />
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 top-full">
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}>
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}>
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { logout(); setIsDropdownOpen(false); }}>
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Description */}
            <div className="mb-8">
              <p className="text-gray-600 text-lg">
                Access and manage all veterinary office records. Click on any card below to view and manage specific record types.
              </p>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Top Row - 3 cards */}
              {recordCards.slice(0, 3).map((card, index) => (
                <div key={index} className="h-64">
                  <RecordCard
                    title={card.title}
                    description={card.description}
                    backgroundImage={card.backgroundImage}
                    icon={card.icon}
                    onClick={() => handleCardClick(card.type)}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Row - 2 larger cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recordCards.slice(3, 5).map((card, index) => (
                <div key={index + 3} className="h-80">
                  <RecordCard
                    title={card.title}
                    description={card.description}
                    backgroundImage={card.backgroundImage}
                    icon={card.icon}
                    onClick={() => handleCardClick(card.type)}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecordsPage; 