import { AppColors, type ThemeColors } from '@/constants/colors';
import {
  FontSize,
  FontWeight,
  MinTouchTarget,
  Opacity,
  Radius,
  Shadow,
  Spacing,
  ZIndex,
} from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AppTheme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  shadow: typeof Shadow;
  opacity: typeof Opacity;
  zIndex: typeof ZIndex;
  minTouchTarget: number;
};

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme() ?? 'light';
  return {
    scheme,
    colors: AppColors[scheme],
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
    shadow: Shadow,
    opacity: Opacity,
    zIndex: ZIndex,
    minTouchTarget: MinTouchTarget,
  };
}
