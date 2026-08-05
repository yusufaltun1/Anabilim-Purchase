import React, { useMemo } from 'react';
import { Select, type SelectOption, type SelectProps } from './Select';

export type UserOption = {
  id: string | number;
  fullName: string;
  email?: string;
  department?: string;
};

export type UserSearchSelectProps = Omit<
  SelectProps<string>,
  'options' | 'value' | 'onChange' | 'searchable'
> & {
  users: UserOption[];
  value: string | number | null | undefined;
  onChange: (userId: string | null) => void;
  /** Client-side arama; büyük listelerde parent filtreleyebilir */
  localSearch?: boolean;
};

/**
 * Kişi zimmeti vb. için kullanıcı seçici.
 * Select + searchable üzerine kurulu; API araması için users prop'unu dışarıdan filtreleyin.
 */
export function UserSearchSelect({
  users,
  value,
  onChange,
  localSearch = true,
  placeholder = 'Kullanıcı seçiniz',
  ...rest
}: UserSearchSelectProps) {
  const options: SelectOption<string>[] = useMemo(
    () =>
      users.map((u) => ({
        value: String(u.id),
        label: u.email ? `${u.fullName} (${u.email})` : u.fullName,
      })),
    [users]
  );

  return (
    <Select
      {...rest}
      placeholder={placeholder}
      options={options}
      value={value === null || value === undefined ? null : String(value)}
      onChange={onChange}
      searchable={localSearch}
    />
  );
}
