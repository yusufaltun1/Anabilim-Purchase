/**
 * Ana renk paleti - Sadece belirtilen 3 renk kullanılacak
 * 1. #db0032 (Ana kırmızı)
 * 2. Black (#000000)
 * 3. White (#ffffff)
 */

export const AppColors = {
  // Ana renkler
  PRIMARY: '#db0032',
  BLACK: '#000000',
  WHITE: '#ffffff',
  
  // Light tema renkleri
  light: {
    // Metin renkleri
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    
    // Arka plan renkleri
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundMuted: '#f0f0f0',
    
    // Border renkleri
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    borderDark: '#cccccc',
    
    // Ana renk varyasyonları
    primary: '#db0032',
    primaryLight: '#ff4d6d',
    primaryDark: '#b8002a',
    primaryMuted: '#ffe6ea',
    
    // Durum renkleri (sadece ana renklerle)
    success: '#db0032', // Primary ile aynı
    error: '#db0032',   // Primary ile aynı
    warning: '#db0032', // Primary ile aynı
    info: '#db0032',    // Primary ile aynı
    
    // Tab ve icon renkleri
    tabIconDefault: '#999999',
    tabIconSelected: '#db0032',
    icon: '#666666',
    
    // Overlay renkleri
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Dark tema renkleri
  dark: {
    // Metin renkleri
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    
    // Arka plan renkleri
    background: '#000000',
    backgroundSecondary: '#1a1a1a',
    backgroundMuted: '#333333',
    
    // Border renkleri
    border: '#333333',
    borderLight: '#1a1a1a',
    borderDark: '#666666',
    
    // Ana renk varyasyonları
    primary: '#db0032',
    primaryLight: '#ff4d6d',
    primaryDark: '#b8002a',
    primaryMuted: '#4d1a1a',
    
    // Durum renkleri (sadece ana renklerle)
    success: '#db0032', // Primary ile aynı
    error: '#db0032',   // Primary ile aynı
    warning: '#db0032', // Primary ile aynı
    info: '#db0032',    // Primary ile aynı
    
    // Tab ve icon renkleri
    tabIconDefault: '#999999',
    tabIconSelected: '#db0032',
    icon: '#cccccc',
    
    // Overlay renkleri
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

// Renk yardımcı fonksiyonları
export const ColorUtils = {
  // Opacity ekleme
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  // Renk karıştırma (sadece ana renklerle)
  mix: (color1: string, color2: string, ratio: number = 0.5): string => {
    // Sadece ana renklerle karışım yapılabilir
    const validColors = [AppColors.PRIMARY, AppColors.BLACK, AppColors.WHITE];
    if (!validColors.includes(color1) || !validColors.includes(color2)) {
      return color1;
    }
    
    // Basit karışım hesaplama
    if (color1 === AppColors.WHITE && color2 === AppColors.BLACK) {
      return ratio < 0.5 ? AppColors.WHITE : AppColors.BLACK;
    }
    if (color1 === AppColors.BLACK && color2 === AppColors.WHITE) {
      return ratio < 0.5 ? AppColors.BLACK : AppColors.WHITE;
    }
    
    return color1;
  },
};

// Tema tipi
export type ColorScheme = 'light' | 'dark';
export type AppColorKey = keyof typeof AppColors.light;
