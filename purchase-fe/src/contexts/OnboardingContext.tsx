import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingContextType {
  isFirstTimeUser: boolean;
  showOnboarding: boolean;
  showWelcomeDashboard: boolean;
  currentStep: number;
  completeOnboarding: () => void;
  closeWelcomeDashboard: () => void;
  updateStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeDashboard, setShowWelcomeDashboard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      // Check if user is newly registered (check from login state or localStorage)
      const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
      const isNewlyRegistered = localStorage.getItem('isNewlyRegistered') === 'true';
      const savedStep = localStorage.getItem('onboardingStep');
      
      console.log('OnboardingContext Debug:', {
        hasCompletedOnboarding,
        isNewlyRegistered,
        savedStep
      });
      
      // Debug: Reset onboarding for testing (remove this in production)
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('onboardingStep');
      
      if (isNewlyRegistered && !hasCompletedOnboarding) {
        console.log('Showing onboarding for new user');
        setIsFirstTimeUser(true);
        setShowOnboarding(true);
        // Resume from saved step or start from beginning
        setCurrentStep(savedStep ? parseInt(savedStep) : 0);
        // Clear the flag after showing onboarding
        localStorage.removeItem('isNewlyRegistered');
      } else {
        console.log('Not showing onboarding:', { isNewlyRegistered, hasCompletedOnboarding });
      }
      
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const updateStep = (step: number) => {
    setCurrentStep(step);
    localStorage.setItem('onboardingStep', step.toString());
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setShowWelcomeDashboard(true);
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.removeItem('onboardingStep'); // Clear saved step
  };

  const closeWelcomeDashboard = () => {
    setShowWelcomeDashboard(false);
    setIsFirstTimeUser(false);
  };

  const value: OnboardingContextType = {
    isFirstTimeUser,
    showOnboarding,
    showWelcomeDashboard,
    currentStep,
    completeOnboarding,
    closeWelcomeDashboard,
    updateStep,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}; 