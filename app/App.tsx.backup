import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Try to import ErrorBoundary with fallback
let ErrorBoundary: React.ComponentType<{ children: React.ReactNode }>;
try {
  const ErrorBoundaryModule = require('./app/components/ErrorBoundary');
  ErrorBoundary = ErrorBoundaryModule.ErrorBoundary || ErrorBoundaryModule.default || (({ children }) => <>{children}</>);
} catch (error) {
  console.warn('ErrorBoundary not available, using fallback:', error);
  ErrorBoundary = ({ children }) => <>{children}</>;
}

// Import your components with error handling
let WelcomePage: any;
let LoginPage: any;
let SignupPage: any;
let VerifyOTPPage: any;
let MainApp: any;

try {
  WelcomePage = require('./app/index').default;
} catch (error) {
  console.error('Failed to load WelcomePage:', error);
  WelcomePage = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Welcome Page Error</Text></View>;
}

try {
  LoginPage = require('./app/login').default;
} catch (error) {
  console.error('Failed to load LoginPage:', error);
  LoginPage = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Login Page Error</Text></View>;
}

try {
  SignupPage = require('./app/signup').default;
} catch (error) {
  console.error('Failed to load SignupPage:', error);
  SignupPage = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Signup Page Error</Text></View>;
}

try {
  VerifyOTPPage = require('./app/verifyotp').default;
} catch (error) {
  console.error('Failed to load VerifyOTPPage:', error);
  VerifyOTPPage = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>VerifyOTP Page Error</Text></View>;
}

try {
  MainApp = require('./app/main').default;
} catch (error) {
  console.error('Failed to load MainApp:', error);
  MainApp = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Main App Error</Text></View>;
}

// Keep the splash screen visible while we fetch resources
try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Ignore errors during splash screen setup
  });
} catch (error) {
  console.warn('SplashScreen setup error:', error);
}

// Global error handler for unhandled errors
try {
  if (typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('Global error caught:', error, 'Fatal:', isFatal);
      // Call original handler to maintain default behavior
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
} catch (error) {
  console.warn('Error setting global error handler:', error);
}

// TypeScript types
type ScreenName = 'Welcome' | 'Login' | 'Signup' | 'VerifyOTP' | 'Main';

interface NavigationProps {
  navigate: (screenName: ScreenName) => void;
}

export default function App(): JSX.Element | null {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Welcome');
  const [appReady, setAppReady] = useState(false);

  // Simplified initialization - no font loading blocking
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      setAppReady(true);
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Error hiding splash screen:', error);
      });
    }, 500); // Very short delay to ensure everything is loaded

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen briefly
  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D37F52" />
      </View>
    );
  }

  // Simple navigation prop
  const navigation: NavigationProps = {
    navigate: (screenName: ScreenName) => setCurrentScreen(screenName)
  };

  // Render current screen
  const renderScreen = (): JSX.Element => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomePage navigation={navigation} />;
      case 'Login':
        return <LoginPage navigation={navigation} />;
      case 'Signup':
        return <SignupPage navigation={navigation} />;
      case 'VerifyOTP':
        return <VerifyOTPPage navigation={navigation} />;
      case 'Main':
        return <MainApp navigation={navigation} />;
      default:
        return <WelcomePage navigation={navigation} />;
    }
  };

  return (
    <ErrorBoundary>
      {renderScreen()}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});