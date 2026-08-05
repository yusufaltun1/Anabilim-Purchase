import React from 'react';
import { Input, type InputProps } from './Input';

export type NumberInputProps = Omit<InputProps, 'keyboardType' | 'value' | 'onChangeText'> & {
  value: number | null | undefined;
  onChangeValue: (value: number | null) => void;
  min?: number;
  max?: number;
  decimal?: boolean;
};

export function NumberInput({
  value,
  onChangeValue,
  min,
  max,
  decimal = false,
  ...props
}: NumberInputProps) {
  const display = value === null || value === undefined || Number.isNaN(value) ? '' : String(value);

  const handleChange = (text: string) => {
    const normalized = text.replace(',', '.');
    if (normalized === '' || normalized === '-') {
      onChangeValue(null);
      return;
    }
    const pattern = decimal ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    if (!pattern.test(normalized)) return;
    if (normalized.endsWith('.') && decimal) {
      // typing intermediate state — keep as-is via partial parse
      return;
    }
    const parsed = decimal ? parseFloat(normalized) : parseInt(normalized, 10);
    if (Number.isNaN(parsed)) {
      onChangeValue(null);
      return;
    }
    let next = parsed;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChangeValue(next);
  };

  return (
    <Input
      {...props}
      value={display}
      onChangeText={handleChange}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
    />
  );
}
