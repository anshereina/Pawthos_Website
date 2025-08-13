// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { UserCircle, ChevronDown, User, Settings, LogOut, Cat, Dog, PieChart, LineChart, Bell, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';
import { useVaccinationStatistics } from '../hooks/useVaccinationStatistics';
import { useAnimalControlStatistics } from '../hooks/useAnimalControlStatistics';
import { useNotifications, Notification } from '../hooks/useNotifications';

// --- Card Components ---
const DonutChart = ({ maleColor, femaleColor }: { maleColor: string; femaleColor: string }) => (
  <PieChart size={60} strokeWidth={1.5} className="text-green-700" />
);

interface FelineVaccinationCardProps {
  statistics: {
    male: number;
    female: number;
    total: number;
  };
  selectedDate: string;
}

const FelineVaccinationCard: React.FC<FelineVaccinationCardProps> = ({ statistics, selectedDate }) => {
  const malePercentage = statistics.total > 0 ? Math.round((statistics.male / statistics.total) * 100) : 0;
  const femalePercentage = statistics.total > 0 ? Math.round((statistics.female / statistics.total) * 100) : 0;
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="border border-black rounded-lg p-4 flex flex-col w-full h-full" style={{ backgroundColor: '#A8F6B5' }}>
      <div className="font-bold text-lg mb-2">Feline</div>
      <div className="flex items-center flex-1">
        {/* Legend */}
        <div className="flex flex-col items-start mr-4">
          <div className="flex items-center mb-1">
            <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#7ed957' }}></span>
            <span className="text-xs">{malePercentage}% Male</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#388e3c' }}></span>
            <span className="text-xs">{femalePercentage}% Female</span>
          </div>
        </div>
        {/* Donut Chart */}
        <DonutChart maleColor="#7ed957" femaleColor="#388e3c" />
        {/* KPI */}
        <div className="flex flex-col items-center ml-4">
          <span className="text-3xl font-bold">{statistics.total.toString().padStart(2, '0')}</span>
          <span className="text-xs text-gray-600">Total Vaccine on {displayDate}</span>
        </div>
      </div>
    </div>
  );
};

interface CanineVaccinationCardProps {
  statistics: {
    male: number;
    female: number;
    total: number;
  };
  selectedDate: string;
}

const CanineVaccinationCard: React.FC<CanineVaccinationCardProps> = ({ statistics, selectedDate }) => {
  const malePercentage = statistics.total > 0 ? Math.round((statistics.male / statistics.total) * 100) : 0;
  const femalePercentage = statistics.total > 0 ? Math.round((statistics.female / statistics.total) * 100) : 0;
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="border border-black rounded-lg p-4 flex flex-col w-full h-full" style={{ backgroundColor: '#A8F6B5' }}>
      <div className="font-bold text-lg mb-2">Canine</div>
      <div className="flex items-center flex-1">
        {/* Legend */}
        <div className="flex flex-col items-start mr-4">
          <div className="flex items-center mb-1">
            <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#7ed957' }}></span>
            <span className="text-xs">{malePercentage}% Male</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#388e3c' }}></span>
            <span className="text-xs">{femalePercentage}% Female</span>
          </div>
        </div>
        {/* Donut Chart */}
        <DonutChart maleColor="#7ed957" femaleColor="#388e3c" />
        {/* KPI */}
        <div className="flex flex-col items-center ml-4">
          <span className="text-3xl font-bold">{statistics.total.toString().padStart(2, '0')}</span>
          <span className="text-xs text-gray-600">Total Vaccine on {displayDate}</span>
        </div>
      </div>
    </div>
  );
};

interface TotalCatchCardProps {
  statistics: {
    canine: { male: number; female: number; total: number };
  };
  selectedDate: string;
}

const TotalCatchCard: React.FC<TotalCatchCardProps> = ({ statistics, selectedDate }) => {
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="border border-black rounded-lg p-4 flex flex-col w-full h-full" style={{ backgroundColor: '#A8F6B5' }}>
      <div className="font-bold text-center mb-2">Total Catch on {displayDate}</div>
      <div className="divide-y divide-black flex-1 flex items-center">
        {/* Canine Section Only */}
        <div className="flex items-center w-full">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-2xl font-bold">{statistics.canine.total.toString().padStart(2, '0')}</span>
            <span className="text-xs">Canine</span>
          </div>
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs">Male: {statistics.canine.male.toString().padStart(2, '0')}</span>
            <span className="text-xs">Female: {statistics.canine.female.toString().padStart(2, '0')}</span>
          </div>
          <span className="ml-2">
            <Dog size={28} className="text-black" />
          </span>
        </div>
      </div>
    </div>
  );
};

const YearlyVaccinationReportCard = () => {
  // Sample data based on the description
  const monthlyData = [
    { month: 'Jan', canineMale: 12, canineFemale: 10, felineMale: 8, felineFemale: 7 },
    { month: 'Feb', canineMale: 15, canineFemale: 13, felineMale: 9, felineFemale: 8 },
    { month: 'Mar', canineMale: 18, canineFemale: 16, felineMale: 11, felineFemale: 10 },
    { month: 'Apr', canineMale: 22, canineFemale: 20, felineMale: 13, felineFemale: 12 },
    { month: 'May', canineMale: 28, canineFemale: 26, felineMale: 16, felineFemale: 15 },
    { month: 'Jun', canineMale: 35, canineFemale: 33, felineMale: 19, felineFemale: 18 },
    { month: 'Jul', canineMale: 38, canineFemale: 36, felineMale: 22, felineFemale: 21 },
    { month: 'Aug', canineMale: 42, canineFemale: 39, felineMale: 24, felineFemale: 22 },
    { month: 'Sep', canineMale: 36, canineFemale: 34, felineMale: 20, felineFemale: 19 },
    { month: 'Oct', canineMale: 30, canineFemale: 28, felineMale: 17, felineFemale: 16 },
    { month: 'Nov', canineMale: 24, canineFemale: 22, felineMale: 14, felineFemale: 13 },
    { month: 'Dec', canineMale: 18, canineFemale: 16, felineMale: 11, felineFemale: 10 }
  ];

  const maxValue = Math.max(...monthlyData.flatMap(d => [d.canineMale, d.canineFemale, d.felineMale, d.felineFemale]));
  const padding = 40;
  const availableWidth = 100 - (padding * 2 / 100);
  const availableHeight = 100 - (padding * 2 / 100);

  const getY = (value: number) => {
    const percentage = (value / maxValue) * 60; // Use 60% of available height
    return 20 + (60 - percentage); // Start at 20%, max at 80%
  };

  const getX = (index: number) => {
    const percentage = (index / (monthlyData.length - 1)) * 70; // Use 70% of available width
    return 15 + percentage; // Start at 15%, max at 85%
  };

  const createPath = (dataKey: keyof typeof monthlyData[0]) => {
    const points = monthlyData.map((data, index) => {
      const x = getX(index);
      const y = getY(data[dataKey] as number);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return points.join(' ');
  };

  return (
    <div className="border border-black rounded-lg p-4 w-full h-full flex flex-col" style={{ backgroundColor: '#A8F6B5' }}>
      <div className="font-bold mb-2 flex items-center gap-2"><LineChart size={20} /> Yearly Vaccination Report</div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ background: '#388e3c' }}></span>
          <span>Canine - Male</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ background: '#7ed957' }}></span>
          <span>Canine - Female</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ background: '#4fd1c5' }}></span>
          <span>Feline - Male</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-sm mr-1" style={{ background: '#b2f5ea' }}></span>
          <span>Feline - Female</span>
        </div>
      </div>

      {/* Chart Container - Full Card */}
      <div className="flex-1 w-full h-full">
        <svg width="100%" height="100%" className="w-full h-full">
          {/* Y-axis labels */}
          <text x="5%" y="20%" className="text-xs fill-gray-600">40</text>
          <text x="5%" y="35%" className="text-xs fill-gray-600">30</text>
          <text x="5%" y="50%" className="text-xs fill-gray-600">20</text>
          <text x="5%" y="65%" className="text-xs fill-gray-600">10</text>
          <text x="5%" y="80%" className="text-xs fill-gray-600">0</text>

          {/* Y-axis line */}
          <line x1="15%" y1="20%" x2="15%" y2="80%" stroke="#e5e7eb" strokeWidth="1" />

          {/* X-axis labels */}
          {monthlyData.map((data, index) => (
            <text 
              key={data.month}
              x={`${getX(index)}%`} 
              y="95%" 
              className="text-xs fill-gray-600"
              textAnchor="middle"
            >
              {data.month}
            </text>
          ))}

          {/* X-axis line */}
          <line x1="15%" y1="80%" x2="85%" y2="80%" stroke="#e5e7eb" strokeWidth="1" />

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line 
              key={index}
              x1="15%" 
              y1={`${20 + (60 * ratio)}%`} 
              x2="85%" 
              y2={`${20 + (60 * ratio)}%`} 
              stroke="#f3f4f6" 
              strokeWidth="1"
            />
          ))}

          {/* Data lines */}
          <path 
            d={createPath('canineMale')} 
            stroke="#388e3c" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d={createPath('canineFemale')} 
            stroke="#7ed957" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d={createPath('felineMale')} 
            stroke="#4fd1c5" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d={createPath('felineFemale')} 
            stroke="#b2f5ea" 
            strokeWidth="2" 
            fill="none"
          />

          {/* Data points */}
          {monthlyData.map((data, index) => (
            <g key={index}>
              <circle cx={`${getX(index)}%`} cy={`${getY(data.canineMale)}%`} r="3" fill="#388e3c" />
              <circle cx={`${getX(index)}%`} cy={`${getY(data.canineFemale)}%`} r="3" fill="#7ed957" />
              <circle cx={`${getX(index)}%`} cy={`${getY(data.felineMale)}%`} r="3" fill="#4fd1c5" />
              <circle cx={`${getX(index)}%`} cy={`${getY(data.felineFemale)}%`} r="3" fill="#b2f5ea" />
            </g>
          ))}
        </svg>
      </div>

      {/* Summary Stats */}
      <div className="mt-3 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Peak Month: August</span>
          <span>Total: {monthlyData.reduce((sum, data) => sum + data.canineMale + data.canineFemale + data.felineMale + data.felineFemale, 0)}</span>
        </div>
      </div>
    </div>
  );
};

interface NotificationsCenterCardProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  resetClearedNotifications: () => void;
}

const NotificationsCenterCard: React.FC<NotificationsCenterCardProps> = ({ 
  notifications, 
  loading, 
  error,
  markAllAsRead,
  clearNotifications,
  markAsRead,
  resetClearedNotifications
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: 'alert' | 'report') => {
    return type === 'alert' ? <AlertTriangle size={16} className="text-red-500" /> : <FileText size={16} className="text-blue-500" />;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="border border-black rounded-lg p-4 w-full h-full flex flex-col" style={{ backgroundColor: '#A8F6B5' }}>
        <div className="font-bold mb-2 flex items-center gap-2"><Bell size={20} /> Notifications Center</div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-black rounded-lg p-4 w-full h-full flex flex-col" style={{ backgroundColor: '#A8F6B5' }}>
        <div className="font-bold mb-2 flex items-center gap-2"><Bell size={20} /> Notifications Center</div>
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
          Error loading notifications
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black rounded-lg p-4 w-full h-full flex flex-col" style={{ backgroundColor: '#A8F6B5' }}>
      <div className="font-bold mb-2 flex items-center gap-2">
        <Bell size={20} /> 
        Notifications Center
        {notifications.length > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {notifications.filter(n => !n.isRead).length}
          </span>
        )}
      </div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={markAllAsRead}
          disabled={notifications.length === 0}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            notifications.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Mark All as Read
        </button>
        <button
          onClick={clearNotifications}
          disabled={notifications.length === 0}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            notifications.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-300 text-green-800 hover:bg-green-400'
          }`}
        >
          Clear All
        </button>
        <button
          onClick={resetClearedNotifications}
          className="text-xs px-2 py-1 rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
        >
          Reset Cleared
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-400">
            <Bell size={32} className="mb-2 opacity-50" />
            <span className="text-sm">No notifications</span>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className={`border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  notification.isRead ? 'opacity-60' : 'bg-blue-50'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium text-sm truncate ${notification.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                    </div>
                    <p className={`text-xs line-clamp-2 mb-1 ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">From: {notification.sender}</span>
                      {notification.priority && (
                        <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      )}
                      {notification.status && (
                        <span className="text-xs text-gray-500 capitalize">
                          {notification.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-auto"></div>
                )}
              </div>
            ))}
            {notifications.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  +{notifications.length - 5} more notifications
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Layout Components ---
interface DashboardSummaryRowProps {
  vaccinationStats: {
    feline: { male: number; female: number; total: number };
    canine: { male: number; female: number; total: number };
  };
  catchStats: {
    canine: { male: number; female: number; total: number };
  };
  selectedDate: string;
}

const DashboardSummaryRow: React.FC<DashboardSummaryRowProps> = ({ vaccinationStats, catchStats, selectedDate }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
    <div className="h-32">
      <FelineVaccinationCard statistics={vaccinationStats.feline} selectedDate={selectedDate} />
    </div>
    <div className="h-32">
      <CanineVaccinationCard statistics={vaccinationStats.canine} selectedDate={selectedDate} />
    </div>
    <div className="h-32">
      <TotalCatchCard statistics={catchStats} selectedDate={selectedDate} />
    </div>
  </div>
);

interface DashboardDetailRowProps {
  notifications: Notification[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  resetClearedNotifications: () => void;
}

const DashboardDetailRow: React.FC<DashboardDetailRowProps> = ({ 
  notifications, 
  notificationsLoading, 
  notificationsError,
  markAllAsRead,
  clearNotifications,
  markAsRead,
  resetClearedNotifications
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <div className="h-96">
      <YearlyVaccinationReportCard />
    </div>
    <div className="h-96">
              <NotificationsCenterCard 
          notifications={notifications}
          loading={notificationsLoading}
          error={notificationsError}
          markAllAsRead={markAllAsRead}
          clearNotifications={clearNotifications}
          markAsRead={markAsRead}
          resetClearedNotifications={resetClearedNotifications}
        />
    </div>
  </div>
);

// --- Main Dashboard Page ---
const DashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  
  // Date state management
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  
  const { statistics: vaccinationStats, loading: vaccinationLoading, error: vaccinationError, refreshStatistics: refreshVaccinationStats } = useVaccinationStatistics(selectedDate);
  const { statistics: catchStats, loading: catchLoading, error: catchError, refreshStatistics: refreshCatchStats } = useAnimalControlStatistics(selectedDate);
  const { 
    notifications, 
    loading: notificationsLoading, 
    error: notificationsError, 
    fetchNotifications,
    markAllAsRead,
    clearNotifications,
    markAsRead,
    resetClearedNotifications
  } = useNotifications();

  React.useEffect(() => {
    if (!isLoading && user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router, isLoading]);

  // Refresh statistics when page becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing statistics...');
        refreshVaccinationStats();
        refreshCatchStats();
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshVaccinationStats, refreshCatchStats, fetchNotifications]);

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

  // Show loading state while restoring session or loading statistics
  if (isLoading || vaccinationLoading || catchLoading || notificationsLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if user is not authenticated
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Use default values if statistics are not available
  const defaultVaccinationStats = {
    feline: { male: 0, female: 0, total: 0 },
    canine: { male: 0, female: 0, total: 0 }
  };

  const defaultCatchStats = {
    canine: { male: 0, female: 0, total: 0 }
  };

  const currentVaccinationStats = vaccinationStats || defaultVaccinationStats;
  const currentCatchStats = catchStats ? { canine: catchStats.canine } : defaultCatchStats;

  // Debug logging
  console.log('Dashboard - Vaccination Stats:', vaccinationStats);
  console.log('Dashboard - Catch Stats:', catchStats);
  console.log('Dashboard - Current Vaccination Stats:', currentVaccinationStats);
  console.log('Dashboard - Current Catch Stats:', currentCatchStats);
  console.log('Dashboard - Notifications:', notifications);

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
        {/* Top Header/Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            {/* Date Picker */}
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}
                >
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}
                >
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => { logout(); setIsDropdownOpen(false); }}
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>
        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {(vaccinationError || catchError || notificationsError) && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {vaccinationError && <div>Error loading vaccination statistics: {vaccinationError}</div>}
              {catchError && <div>Error loading catch statistics: {catchError}</div>}
              {notificationsError && <div>Error loading notifications: {notificationsError}</div>}
            </div>
          )}
          <DashboardSummaryRow 
            vaccinationStats={currentVaccinationStats} 
            catchStats={currentCatchStats} 
            selectedDate={selectedDate}
          />
          <DashboardDetailRow 
            notifications={notifications}
            notificationsLoading={notificationsLoading}
            notificationsError={notificationsError}
            markAllAsRead={markAllAsRead}
            clearNotifications={clearNotifications}
            markAsRead={markAsRead}
            resetClearedNotifications={resetClearedNotifications}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
