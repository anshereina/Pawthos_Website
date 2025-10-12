// src/components/PageHeader.tsx
import React from 'react';
import { Calendar, UserCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';

interface PageHeaderProps {
  title: string;
  showDatePicker?: boolean;
  selectedDate?: string;
  onDateChange?: (value: string) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showDatePicker = false, selectedDate, onDateChange }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

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

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 px-6 py-5 flex justify-between items-center backdrop-blur-sm">
      <div className="flex items-center space-x-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{title}</h1>
        {showDatePicker && (
          <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
            <Calendar size={18} className="text-green-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              className="border-0 text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
            />
          </div>
        )}
      </div>
      <div className="relative flex items-center space-x-4 user-info-area">
        <div
          className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-full px-4 py-2 hover:shadow-md hover:border-green-300 transition-all duration-300"
          onClick={toggleDropdown}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <UserCircle size={24} className="text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-gray-800 font-semibold text-sm">{user?.name || ''}</span>
            <span className="text-green-600 text-xs font-medium">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
          </div>
          <ChevronDown size={18} className="text-gray-400" />
        </div>
        {isDropdownOpen && (
          <div className="user-dropdown-menu absolute right-0 mt-3 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-20 top-full backdrop-blur-sm">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{user?.name || ''}</p>
              <p className="text-xs text-green-600">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</p>
            </div>
            <button
              className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200"
              onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <User size={16} className="text-green-600" />
              </div>
              <span className="font-medium">Profile</span>
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
              onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Settings size={16} className="text-blue-600" />
              </div>
              <span className="font-medium">Account Settings</span>
            </button>
            <div className="border-t border-gray-100 my-2"></div>
            <button
              className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200"
              onClick={() => { logout(); setIsDropdownOpen(false); }}
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <LogOut size={16} className="text-red-600" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;


