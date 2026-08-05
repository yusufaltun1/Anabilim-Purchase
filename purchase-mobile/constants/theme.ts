/**
 * App renk sistemi — AppColors + design tokens.
 */

import { Platform } from 'react-native';
import { AppColors } from './colors';

export { Spacing, Radius, FontSize, FontWeight, Shadow, Opacity, MinTouchTarget, ZIndex } from './tokens';
export { AppColors, ColorUtils } from './colors';

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
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
