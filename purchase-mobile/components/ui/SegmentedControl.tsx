import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type SegmentOption = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl({ options, value, onChange, style }: SegmentedControlProps) {
  const { colors, spacing, radius, minTouchTarget, opacity } = useAppTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.backgroundMuted,
          borderRadius: radius.md,
          padding: spacing.xs,
          gap: spacing.xs,
        },
        style,
      ]}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: minTouchTarget - 4,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: spacing.xs,
              paddingHorizontal: spacing.sm,
              backgroundColor: selected ? colors.backgroundElevated : 'transparent',
              opacity: pressed ? opacity.pressed : 1,
              ...(selected
                ? {
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 1,
                  }
                : null),
            })}
          >
            {option.icon ? (
              <Ionicons
                name={option.icon}
                size={16}
                color={selected ? colors.primary : colors.textMuted}
              />
            ) : null}
            <Text
              variant="label"
              color={selected ? colors.text : colors.textMuted}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
