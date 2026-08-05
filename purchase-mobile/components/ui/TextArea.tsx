import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { Input, type InputProps } from './Input';

export type TextAreaProps = Omit<InputProps, 'multiline' | 'numberOfLines'> & {
  numberOfLines?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextArea({ numberOfLines = 4, style, ...props }: TextAreaProps) {
  return (
    <Input
      {...props}
      multiline
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      style={[{ minHeight: numberOfLines * 22 + 24 }, style]}
    />
  );
}
