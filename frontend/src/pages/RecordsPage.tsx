import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { Syringe, Clipboard, Dog, Building, Truck } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';

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
    className="relative overflow-hidden rounded-xl border border-gray-200 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group bg-white shadow-sm hover:border-green-300"
    onClick={onClick}
  >
    {/* Background Image with Light Green Overlay */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(to bottom right, rgba(34, 197, 94, 0.3), rgba(21, 128, 61, 0.3)), url(${backgroundImage})` 
      }}
    />
    
    {/* Content */}
    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
      {/* Icon */}
      <div className="flex justify-end">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white border-opacity-30">
          {icon}
        </div>
      </div>
      
      {/* Text Content */}
      <div className="text-white">
        <h3 className="text-2xl font-bold mb-3 drop-shadow-sm">{title}</h3>
        <p className="text-sm leading-relaxed opacity-95 drop-shadow-sm">{description}</p>
      </div>
    </div>
  </div>
);

// Main Records Page
const RecordsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);


  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
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
    } else if (recordType === 'reproductive') {
      router.navigate({ to: '/records/reproductive' });
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
      title: "Vet Health Certificate",
      description: "Records the issuance of permits required for transporting live animals or meat products, including details on origin, destination, and compliance.",
      backgroundImage: "/images/pictures/shippingpermit.png",
      icon: <Truck size={24} className="text-white" />,
      type: "shipping-permit"
    },
    {
      title: "Pet Sterilization Records",
      description: "Manages breeding histories, estrus cycles, pregnancies, and whelping/kidding/farrowing details for animals.",
      backgroundImage: "/images/pictures/kapon.png",
      icon: <Clipboard size={24} className="text-white" />,
      type: "reproductive"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans w-full">
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
        <PageHeader title="Records Management" />
        {/* Main Content */}
        <main className="flex-1 p-6 pb-4">
          <div className="max-w-7xl mx-auto">
            {/* Page Description */}
            <div className="mb-4 bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-gray-700 text-lg font-medium">
                Access and manage all veterinary office records. Click on any card below to view and manage specific record types.
              </p>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Top Row - 3 cards */}
              {recordCards.slice(0, 3).map((card, index) => (
                <div key={index} className="h-60">
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

            {/* Bottom Row - 3 larger cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              {recordCards.slice(3, 6).map((card, index) => (
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