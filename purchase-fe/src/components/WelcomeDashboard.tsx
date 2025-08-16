import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomeDashboardProps {
  onCompleteOnboarding: () => void;
}

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ onCompleteOnboarding }) => {
  const navigate = useNavigate();
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);

  const quickActions = [
    {
      title: "İlk Pozisyonunuzu Oluşturun",
      description: "Yeni bir iş pozisyonu tanımlayın ve AI mülakat sistemini yapılandırın",
      icon: "📝",
      action: () => navigate('/positions/create'),
      primary: true,
      tooltip: "Bu adım ile başlayın! Pozisyon oluşturarak ilk mülakatınızı hazırlayın."
    },
    {
      title: "Demo Mülakatı İzleyin",
      description: "Sistemin nasıl çalıştığını görmek için örnek mülakatı inceleyin",
      icon: "🎥",
      action: () => window.open('#', '_blank'),
      primary: false,
      tooltip: "Sistemin nasıl çalıştığını anlamak için demo mülakatı izleyin."
    },
    {
      title: "Rehberi Görüntüleyin",
      description: "Detaylı kullanım kılavuzu ve video eğitimler",
      icon: "📚",
      action: () => window.open('#', '_blank'),
      primary: false,
      tooltip: "Detaylı kullanım kılavuzu ve video eğitimlerle sistemi öğrenin."
    }
  ];

  const features = [
    {
      icon: "🤖",
      title: "AI Destekli Analiz",
      description: "Yapay zeka ile aday değerlendirmesi"
    },
    {
      icon: "📊",
      title: "Detaylı Raporlar",
      description: "Kapsamlı mülakat analizleri"
    },
    {
      icon: "⚡",
      title: "Hızlı Süreç",
      description: "3x daha hızlı işe alım"
    },
    {
      icon: "🎯",
      title: "Objektif Değerlendirme",
      description: "Tarafsız aday karşılaştırması"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Mülakat Pro</h1>
                <p className="text-gray-600">Hoş geldiniz! İlk adımlarınızı atalım</p>
              </div>
            </div>
            <button
              onClick={onCompleteOnboarding}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Onboarding'i Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI Mülakat Pro'ya Hoş Geldiniz!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Yapay zeka destekli mülakat sistemi ile işe alım süreçlerinizi dönüştürün. 
            İlk pozisyonunuzu oluşturarak başlayın.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Hızlı Başlangıç
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${
                  action.primary 
                    ? 'border-blue-500 hover:border-blue-600' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={action.action}
                onMouseEnter={() => setHoveredAction(index)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <div className="text-4xl mb-4">{action.icon}</div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  action.primary ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {action.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
                {action.primary && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Önerilen
                    </span>
                  </div>
                )}
                {hoveredAction === index && (
                  <div className="mt-2 text-sm text-gray-500">
                    {action.tooltip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Neler Sunuyoruz?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl p-8 shadow-sm border">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sistem İstatistikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600 text-sm">Doğruluk Oranı</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">3x</div>
              <div className="text-gray-600 text-sm">Daha Hızlı</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 text-sm">Kullanılabilirlik</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100+</div>
              <div className="text-gray-600 text-sm">Başarılı Mülakat</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Yardıma mı ihtiyacınız var?
          </p>
          <div className="flex justify-center space-x-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Canlı Destek
            </button>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Video Eğitimler
            </button>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              SSS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 