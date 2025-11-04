/**
 * App renk sistemi - Sadece 3 ana renk kullanılır:
 * 1. #db0032 (Ana kırmızı)
 * 2. Black (#000000) 
 * 3. White (#ffffff)
 */

import { Platform } from 'react-native';
import { AppColors } from './colors';

// Eski Colors objesini yeni renk sistemiyle değiştir
export const Colors = {
  light: {
    text: AppColors.light.text,
    background: AppColors.light.background,
    tint: AppColors.light.primary,
    icon: AppColors.light.icon,
    tabIconDefault: AppColors.light.tabIconDefault,
    tabIconSelected: AppColors.light.tabIconSelected,
  },
  dark: {
    text: AppColors.dark.text,
    background: AppColors.dark.background,
    tint: AppColors.dark.primary,
    icon: AppColors.dark.icon,
    tabIconDefault: AppColors.dark.tabIconDefault,
    tabIconSelected: AppColors.dark.tabIconSelected,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
