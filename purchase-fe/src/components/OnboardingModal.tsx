import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "AI Mülakat Pro'ya Hoş Geldiniz! 🎉",
    description: "Yapay zeka destekli mülakat sistemi ile işe alım süreçlerinizi dönüştürün.",
    image: "🤖",
    content: "Sistemimiz, geleneksel mülakat yöntemlerini yapay zeka ile birleştirerek daha objektif ve etkili değerlendirmeler yapmanızı sağlar."
  },
  {
    id: 2,
    title: "Pozisyon Oluşturun 📋",
    description: "İhtiyacınız olan pozisyonu tanımlayın ve AI sistemini yapılandırın.",
    image: "📝",
    content: "Pozisyon başlığı, gereksinimler ve soru setlerini belirleyin. Sistem otomatik olarak en uygun mülakat formatını önerir."
  },
  {
    id: 3,
    title: "AI Mülakatı Başlatın 🎯",
    description: "Aday ile yapay zeka destekli mülakatı gerçekleştirin.",
    image: "🎥",
    content: "Video mülakat sırasında AI, adayın teknik bilgilerini, duygusal durumunu ve dikkat seviyesini analiz eder."
  },
  {
    id: 4,
    title: "Detaylı Raporu Alın 📊",
    description: "Kapsamlı analiz raporu ile en uygun adayı seçin.",
    image: "📈",
    content: "Mülakat sonrası detaylı rapor, adayın güçlü yanlarını, gelişim alanlarını ve genel uygunluk skorunu gösterir."
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { currentStep, updateStep } = useOnboarding();

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      updateStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      updateStep(currentStep - 1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        handleNext();
        break;
      case 'Escape':
        handleSkip();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">Hoş Geldiniz!</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStepData.image}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              {currentStepData.description}
            </p>
            <p className="text-gray-500">
              {currentStepData.content}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Atlayın
            </button>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Geri
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Başlayın' : 'İleri'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Adım {currentStep + 1} / {onboardingSteps.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 