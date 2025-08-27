import React, { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  FileBarChart2,
  FileText,
  CalendarCheck2,
  ActivitySquare,
} from 'lucide-react';

export const useSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();
  
  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebarExpanded');
      if (saved !== null) {
        setIsExpanded(saved === 'true');
      }
    } catch {}
  }, []);

  // Persist to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarExpanded', String(isExpanded));
    } catch {}
  }, [isExpanded]);
  
  // Get current location from router
  const currentLocation = router.state.location.pathname;
  
  // Determine active item based on current route
  const getActiveItem = (pathname: string): string => {
    // Handle nested routes for records
    if (pathname.startsWith('/records/')) {
      return '/records';
    }
    
    // Handle pet profile routes
    if (pathname.startsWith('/pets/') && pathname !== '/pets') {
      return '/pets';
    }
    
    // Return the exact path for other routes
    return pathname;
  };

  const activeItem = getActiveItem(currentLocation);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'User Management',
      path: '/users',
      icon: <Users size={20} />,
    },
    {
      label: 'Pets',
      path: '/pets',
      icon: <PawPrint size={20} />,
    },
    {
      label: 'Reports & Alerts',
      path: '/reports-alerts',
      icon: <FileBarChart2 size={20} />,
    },
    {
      label: 'Records',
      path: '/records',
      icon: <FileText size={20} />,
    },
    {
      label: 'Appointments',
      path: '/appointments',
      icon: <CalendarCheck2 size={20} />,
    },
    {
      label: 'Pain Assessment',
      path: '/pain-assessment',
      icon: <ActivitySquare size={20} />,
    },
  ];

  return {
    isExpanded,
    activeItem,
    navigationItems,
    toggleSidebar,
  };
}; 