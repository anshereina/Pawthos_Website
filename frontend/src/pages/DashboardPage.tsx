// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { Cat, Dog, LineChart, Bell, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { useVaccinationStatistics, useYearlyVaccinationStatistics } from '../hooks/useVaccinationStatistics';
import { vaccinationEventService } from '../services/vaccinationEventService';
import { useAnimalControlStatistics } from '../hooks/useAnimalControlStatistics';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// --- Card Components ---
interface DonutChartProps {
  maleCount: number;
  femaleCount: number;
  total: number;
  maleColor: string;
  femaleColor: string;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  maleCount, 
  femaleCount, 
  total, 
  maleColor, 
  femaleColor, 
  size = 60 
}) => {
  if (total === 0) {
    // Show empty donut chart when no data
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <text x="30" y="35" textAnchor="middle" fontSize="8" fill="#9ca3af">
          No Data
        </text>
      </svg>
    );
  }

  const radius = 25;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentages
  const malePercentage = maleCount / total;
  const femalePercentage = femaleCount / total;
  
  // Calculate stroke dasharray values
  const maleDasharray = malePercentage * circumference;
  const femaleDasharray = femalePercentage * circumference;
  
  // Calculate stroke dashoffset for positioning
  const maleDashoffset = 0;
  const femaleDashoffset = -maleDasharray;

  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Background circle */}
      <circle
        cx="30"
        cy="30"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      
      {/* Male segment */}
      {maleCount > 0 && (
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke={maleColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${maleDasharray} ${circumference}`}
          strokeDashoffset={maleDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
      )}
      
      {/* Female segment */}
      {femaleCount > 0 && (
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke={femaleColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${femaleDasharray} ${circumference}`}
          strokeDashoffset={femaleDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
      )}
      
      {/* No center text - pure color donut chart */}
    </svg>
  );
};

interface FelineVaccinationCardProps {
  statistics: {
    male: number;
    female: number;
    total: number;
  };
  selectedDate: string;
  barangayLabel?: string;
}

const FelineVaccinationCard: React.FC<FelineVaccinationCardProps> = ({ statistics, selectedDate, barangayLabel }) => {
  const malePercentage = statistics.total > 0 ? Math.round((statistics.male / statistics.total) * 100) : 0;
  const femalePercentage = statistics.total > 0 ? Math.round((statistics.female / statistics.total) * 100) : 0;
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="border border-gray-200 rounded-xl p-6 flex flex-col w-full h-full bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-200">
      <div className="font-bold text-lg mb-1 text-green-700 flex items-center">
        <Cat size={20} className="mr-2" />
        Feline
      </div>
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
        <DonutChart maleCount={statistics.male} femaleCount={statistics.female} total={statistics.total} maleColor="#7ed957" femaleColor="#388e3c" />
        {/* KPI */}
        <div className="flex flex-col items-start ml-4 min-w-0">
          <span className="text-3xl font-bold text-green-700">{statistics.total.toString().padStart(2, '0')}</span>
          <span className="text-[11px] text-gray-600 leading-snug break-words whitespace-normal max-w-[180px]">
            Total Vaccine on {displayDate} — Barangay: {barangayLabel || 'N/A'}
          </span>
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
  barangayLabel?: string;
}

const CanineVaccinationCard: React.FC<CanineVaccinationCardProps> = ({ statistics, selectedDate, barangayLabel }) => {
  const malePercentage = statistics.total > 0 ? Math.round((statistics.male / statistics.total) * 100) : 0;
  const femalePercentage = statistics.total > 0 ? Math.round((statistics.female / statistics.total) * 100) : 0;
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="border border-gray-200 rounded-xl p-6 flex flex-col w-full h-full bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200">
      <div className="font-bold text-lg mb-1 text-blue-700 flex items-center">
        <Dog size={20} className="mr-2" />
        Canine
      </div>
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
        <DonutChart maleCount={statistics.male} femaleCount={statistics.female} total={statistics.total} maleColor="#7ed957" femaleColor="#388e3c" />
        {/* KPI */}
        <div className="flex flex-col items-start ml-4 min-w-0">
          <span className="text-3xl font-bold text-green-700">{statistics.total.toString().padStart(2, '0')}</span>
          <span className="text-[11px] text-gray-600 leading-snug break-words whitespace-normal max-w-[180px]">
            Total Vaccine on {displayDate} — Barangay: {barangayLabel || 'N/A'}
          </span>
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
  const malePercentage = statistics.canine.total > 0 ? Math.round((statistics.canine.male / statistics.canine.total) * 100) : 0;
  const femalePercentage = statistics.canine.total > 0 ? Math.round((statistics.canine.female / statistics.canine.total) * 100) : 0;
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="border border-gray-200 rounded-xl p-6 flex flex-col w-full h-full bg-gradient-to-br from-white to-orange-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-200">
      <div className="font-bold text-lg mb-3 text-orange-700 flex items-center">
        <AlertTriangle size={20} className="mr-2" />
        Total Catch
      </div>
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
        <DonutChart 
          maleCount={statistics.canine.male} 
          femaleCount={statistics.canine.female} 
          total={statistics.canine.total} 
          maleColor="#7ed957" 
          femaleColor="#388e3c" 
        />
        {/* KPI */}
        <div className="flex flex-col items-center ml-4">
          <span className="text-3xl font-bold">{statistics.canine.total.toString().padStart(2, '0')}</span>
          <span className="text-xs text-gray-600">Total Catch on {displayDate}</span>
        </div>
      </div>
    </div>
  );
};

const YearlyVaccinationReportCard = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const { statistics: yearlyStats, loading, error } = useYearlyVaccinationStatistics(selectedYear);

  // Generate year options (current year and 4 years back)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-800 mt-2 pt-2 border-t border-gray-200">
            Total: {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 w-full h-full flex flex-col bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-200">
        <div className="font-bold mb-3 flex items-center gap-2 text-green-700">
          <LineChart size={20} className="text-green-600" /> 
          Yearly Vaccination Report
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ml-auto text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 w-full h-full flex flex-col bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-200">
        <div className="font-bold mb-3 flex items-center gap-2 text-green-700">
          <LineChart size={20} className="text-green-600" /> 
          Yearly Vaccination Report
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ml-auto text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
          Error loading yearly statistics
        </div>
      </div>
    );
  }

  // Use real data if available, otherwise use empty data
  const monthlyData = yearlyStats?.monthly_data || Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    canineMale: 0,
    canineFemale: 0,
    felineMale: 0,
    felineFemale: 0
  }));

  const totalVaccinations = monthlyData.reduce((sum, data) => 
    sum + data.canineMale + data.canineFemale + data.felineMale + data.felineFemale, 0
  );

  return (
    <div className="border border-gray-200 rounded-xl p-6 w-full h-full flex flex-col bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-200">
      <div className="font-bold mb-3 flex items-center gap-2 text-green-700">
        <LineChart size={20} className="text-green-600" /> 
        Yearly Vaccination Report
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="ml-auto text-sm border border-gray-300 rounded px-2 py-1 bg-white hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full" style={{ minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={monthlyData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="canineMale" 
              stroke="#1e7e34" 
              strokeWidth={2.5}
              name="Canine Male"
              dot={{ fill: '#1e7e34', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="canineFemale" 
              stroke="#7ed957" 
              strokeWidth={2.5}
              name="Canine Female"
              dot={{ fill: '#7ed957', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="felineMale" 
              stroke="#0891b2" 
              strokeWidth={2.5}
              name="Feline Male"
              dot={{ fill: '#0891b2', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="felineFemale" 
              stroke="#67e8f9" 
              strokeWidth={2.5}
              name="Feline Female"
              dot={{ fill: '#67e8f9', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-3 pt-3 border-t border-green-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <span className="text-gray-600">Peak Month:</span>
            <span className="ml-1 font-semibold text-green-700">
              {yearlyStats?.summary?.peak_month || 'N/A'}
            </span>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <span className="text-gray-600">Total:</span>
            <span className="ml-1 font-semibold text-green-700">
              {totalVaccinations.toLocaleString()}
            </span>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <span className="text-gray-600">Canine:</span>
            <span className="ml-1 font-semibold text-blue-700">
              {yearlyStats?.summary?.total_canine?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-2">
            <span className="text-gray-600">Feline:</span>
            <span className="ml-1 font-semibold text-cyan-700">
              {yearlyStats?.summary?.total_feline?.toLocaleString() || '0'}
            </span>
          </div>
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
      <div className="border border-gray-200 rounded-xl p-6 w-full h-full flex flex-col bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
        <div className="font-bold mb-3 flex items-center gap-2 text-purple-700"><Bell size={20} className="text-purple-600" /> Notifications Center</div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 w-full h-full flex flex-col bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
        <div className="font-bold mb-3 flex items-center gap-2 text-purple-700"><Bell size={20} className="text-purple-600" /> Notifications Center</div>
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
          Error loading notifications
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 w-full h-full flex flex-col bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
      <div className="font-bold mb-3 flex items-center gap-2 text-purple-700">
        <Bell size={20} className="text-purple-600" /> 
        Notifications Center
        {notifications.length > 0 && (
            <span className="ml-auto bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full px-2 py-1 shadow-sm">
            {notifications.filter(n => !n.isRead).length}
          </span>
        )}
      </div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={markAllAsRead}
          disabled={notifications.length === 0}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
            notifications.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md'
          }`}
        >
          Mark All as Read
        </button>
        <button
          onClick={clearNotifications}
          disabled={notifications.length === 0}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
            notifications.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
          }`}
        >
          Clear All
        </button>
        <button
          onClick={resetClearedNotifications}
          className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md"
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

const DashboardSummaryRow: React.FC<DashboardSummaryRowProps & { barangayLabel?: string }> = ({ vaccinationStats, catchStats, selectedDate, barangayLabel }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
    <div className="h-32">
      <FelineVaccinationCard statistics={vaccinationStats.feline} selectedDate={selectedDate} barangayLabel={barangayLabel} />
    </div>
    <div className="h-32">
      <CanineVaccinationCard statistics={vaccinationStats.canine} selectedDate={selectedDate} barangayLabel={barangayLabel} />
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
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  
  // Date state management
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [barangayLabel, setBarangayLabel] = React.useState<string | undefined>(undefined);
  
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
    let isActive = true;
    const loadBarangay = async () => {
      try {
        const events = await vaccinationEventService.getVaccinationEventsByDate(selectedDate);
        if (!isActive) return;
        if (events && events.length > 0) {
          // If multiple events, join barangay names uniquely
          const uniqueBarangays = Array.from(new Set(events.map(e => e.barangay).filter(Boolean)));
          setBarangayLabel(uniqueBarangays.join(', '));
        } else {
          setBarangayLabel(undefined);
        }
      } catch (e) {
        setBarangayLabel(undefined);
      }
    };
    loadBarangay();
    return () => { isActive = false; };
  }, [selectedDate]);

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
  

  // Show loading spinner for authentication only (redirect will happen via useEffect)
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if user is not authenticated
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
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
        <PageHeader 
          title="Dashboard"
          showDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {(vaccinationLoading || catchLoading) ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
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
                barangayLabel={barangayLabel}
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
