import { useCallback, useMemo, useState } from 'react';
import Select from 'react-select';
import { userService } from '../../services/user.service';
import { User } from '../../types/user';

interface UserOption {
  value: number;
  label: string;
}

interface AssignmentUserSelectProps {
  value: string;
  onChange: (userId: string, user: User | null) => void;
  disabled?: boolean;
  hasError?: boolean;
}

const MAX_VISIBLE_OPTIONS = 80;

export const AssignmentUserSelect = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
}: AssignmentUserSelectProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const loadUsers = useCallback(async () => {
    if (loaded || loading) return;

    setLoading(true);
    setLoadError(null);
    try {
      const list = await userService.getActiveUsersList();
      setUsers(list);
      setLoaded(true);
    } catch (error) {
      setUsers([]);
      setLoadError(
        error instanceof Error ? error.message : 'Kullanıcı listesi yüklenemedi'
      );
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const allOptions = useMemo<UserOption[]>(
    () =>
      users
        .filter((user) => user.id != null)
        .map((user) => ({
          value: user.id!,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        })),
    [users]
  );

  const menuOptions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    const filtered = query
      ? allOptions.filter((option) => option.label.toLowerCase().includes(query))
      : allOptions;
    return filtered.slice(0, MAX_VISIBLE_OPTIONS);
  }, [allOptions, inputValue]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return null;
    return allOptions.find((option) => option.value === numericValue) ?? null;
  }, [allOptions, value]);

  const handleMenuOpen = () => {
    void loadUsers();
  };

  const handleRetry = () => {
    userService.invalidateActiveUsersListCache();
    setLoaded(false);
    setUsers([]);
    void loadUsers();
  };

  return (
    <div>
      <Select<UserOption, false>
        instanceId="assignment-user-select"
        options={menuOptions}
        value={selectedOption}
        inputValue={inputValue}
        onInputChange={(nextValue, meta) => {
          if (meta.action === 'input-change') {
            setInputValue(nextValue);
          }
          if (meta.action === 'menu-close' || meta.action === 'set-value') {
            setInputValue('');
          }
          return nextValue;
        }}
        onChange={(option) => {
          const user =
            option != null ? users.find((item) => item.id === option.value) ?? null : null;
          onChange(option != null ? String(option.value) : '', user);
          setInputValue('');
        }}
        onMenuOpen={handleMenuOpen}
        filterOption={() => true}
        isLoading={loading}
        isDisabled={disabled}
        isClearable
        isSearchable
        placeholder="Ad, soyad veya e-posta ile ara…"
        noOptionsMessage={() =>
          loadError ? 'Liste yüklenemedi' : loading ? 'Yükleniyor…' : 'Kullanıcı bulunamadı'
        }
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPlacement="auto"
        maxMenuHeight={240}
        menuShouldScrollIntoView={false}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: 38,
            fontSize: '0.875rem',
            borderColor: hasError || loadError ? '#ef4444' : state.isFocused ? '#6366f1' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
            '&:hover': {
              borderColor: hasError || loadError ? '#ef4444' : '#6366f1',
            },
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          option: (base) => ({
            ...base,
            fontSize: '0.875rem',
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: '0.875rem',
          }),
          singleValue: (base) => ({
            ...base,
            fontSize: '0.875rem',
          }),
        }}
      />

      {!loading && loaded && allOptions.length > MAX_VISIBLE_OPTIONS && !inputValue.trim() && (
        <p className="mt-1 text-xs text-gray-500">
          İlk {MAX_VISIBLE_OPTIONS} kullanıcı gösteriliyor — arama yaparak daraltın.
        </p>
      )}

      {loadError && (
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-red-600">{loadError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Tekrar dene
          </button>
        </div>
      )}

      {!loading && loaded && !loadError && allOptions.length === 0 && (
        <p className="mt-1 text-xs text-amber-600">Sistemde aktif kullanıcı bulunamadı.</p>
      )}
    </div>
  );
};
