import React from 'react';
import {
  RouterProvider,
  createRouter,
  Route,
  RootRoute,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { AuthProvider } from './features/auth/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import RecordsPage from './pages/RecordsPage';
import PetRecordsPage from './pages/PetRecordsPage';

import VaccinationRecordsPage from './pages/VaccinationRecordsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import MeatInspectionRecordsPage from './pages/MeatInspectionRecordsPage';
import AnimalControlRecordsPage from './pages/AnimalControlRecordsPage';
import ShippingPermitRecordsPage from './pages/ShippingPermitRecordsPage';
import ReproductiveRecordsPage from './pages/ReproductiveRecordsPage';
import ReportsAlertsPage from './pages/ReportsAlertsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PainAssessmentPage from './pages/PainAssessmentPage';
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Component to redirect to dashboard
const RedirectToDashboard: React.FC = () => {
  const router = useRouter();
  
  React.useEffect(() => {
    router.navigate({ to: '/dashboard' });
  }, [router]);
  
  return <div>Redirecting to dashboard...</div>;
};

const rootRoute = new RootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />    
    </AuthProvider>
  ),
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RedirectToDashboard,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const forgotPasswordRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
});

const resetPasswordRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
});





const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const userManagementRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UserManagementPage,
});

const recordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records',
  component: RecordsPage,
});

const vaccinationRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records/vaccination',
  component: VaccinationRecordsPage,
});

const medicalRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records/medical',
  component: MedicalRecordsPage,
});

const meatInspectionRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records/meat-inspection',
  component: MeatInspectionRecordsPage,
});

const animalControlRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records/animal-control',
  component: AnimalControlRecordsPage,
});

const shippingPermitRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records/shipping-permit',
  component: ShippingPermitRecordsPage,
});

const reproductiveRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/records/reproductive',
  component: ReproductiveRecordsPage,
});

const petRecordsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pets',
  component: PetRecordsPage,
});








const reportsAlertsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/reports-alerts',
  component: ReportsAlertsPage,
});

const appointmentsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/appointments',
  component: AppointmentsPage,
});

const painAssessmentRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pain-assessment',
  component: PainAssessmentPage,
});

const profileRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const accountSettingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/account-settings',
  component: AccountSettingsPage,
});

rootRoute.children = [
  indexRoute,
  loginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  dashboardRoute,
  userManagementRoute,
  recordsRoute,
  vaccinationRecordsRoute,
  medicalRecordsRoute,
  meatInspectionRecordsRoute,
  animalControlRecordsRoute,
  shippingPermitRecordsRoute,
  reproductiveRecordsRoute,
  petRecordsRoute,
  reportsAlertsRoute,
  appointmentsRoute,
  painAssessmentRoute,
  profileRoute,
  accountSettingsRoute,
];

const router = createRouter({ routeTree: rootRoute });

export default function AppRouterProvider() {
  return <RouterProvider router={router} />;
} 