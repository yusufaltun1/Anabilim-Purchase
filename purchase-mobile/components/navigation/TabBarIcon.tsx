// components/navigation/TabBarIcon.tsx
import React from 'react';
import { type ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export function TabBarIcon({ style, ...rest }: ComponentProps<typeof Ionicons>) {
  return <Ionicons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}
