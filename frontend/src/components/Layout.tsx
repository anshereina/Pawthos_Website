import React from 'react';
import { useRouter } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import { useSidebar } from './useSidebar';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          items={navigationItems}
          activeItem={activeItem}
          onItemClick={handleItemClick}
          isExpanded={isExpanded}
          onToggleExpand={toggleSidebar}
        />
        
        {/* Main Content Area */}
        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isExpanded ? 'ml-64' : 'ml-16'
          }`}
        >
          <main className="h-full overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout; 