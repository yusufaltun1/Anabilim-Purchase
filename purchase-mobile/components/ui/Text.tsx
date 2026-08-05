import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
  type StyleProp,
} from 'react-native';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'helper'
  | 'error';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Text({
  variant = 'body',
  color,
  muted,
  center,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors, fontSize, fontWeight } = useAppTheme();

  const variantStyle: TextStyle = (() => {
    switch (variant) {
      case 'h1':
        return { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, lineHeight: 36 };
      case 'h2':
        return { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, lineHeight: 30 };
      case 'h3':
        return { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, lineHeight: 26 };
      case 'subtitle':
        return { fontSize: fontSize.lg, fontWeight: fontWeight.medium, lineHeight: 24 };
      case 'bodyStrong':
        return { fontSize: fontSize.md, fontWeight: fontWeight.semibold, lineHeight: 22 };
      case 'caption':
        return { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: 16 };
      case 'label':
        return { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 };
      case 'helper':
        return { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: 18 };
      case 'error':
        return { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 };
      case 'body':
      default:
        return { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: 22 };
    }
  })();

  const resolvedColor =
    color ??
    (variant === 'error'
      ? colors.error
      : variant === 'helper' || variant === 'caption' || muted
        ? colors.textMuted
        : variant === 'label'
          ? colors.textSecondary
          : colors.text);

  return (
    <RNText
      style={[
        variantStyle,
        { color: resolvedColor },
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
