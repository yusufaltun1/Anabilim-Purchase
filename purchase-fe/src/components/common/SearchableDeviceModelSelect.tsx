import { Fragment, useMemo, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { DeviceModel } from '../../services/inventory.service';
import { formatDeviceModelLabel } from '../../utils/deviceModel';

interface SearchableDeviceModelSelectProps {
  models: DeviceModel[];
  value: number | null;
  onChange: (model: DeviceModel | null) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
}

export const SearchableDeviceModelSelect = ({
  models,
  value,
  onChange,
  disabled,
  placeholder = 'Marka veya model ara...',
  hasError,
}: SearchableDeviceModelSelectProps) => {
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => models.find((m) => m.id === value) ?? null,
    [models, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) => {
      const label = formatDeviceModelLabel(m).toLowerCase();
      const brand = m.brand?.toLowerCase() ?? '';
      const name = m.name.toLowerCase();
      return label.includes(q) || brand.includes(q) || name.includes(q);
    });
  }, [models, query]);

  const borderClass = hasError
    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
    : 'border-gray-300 focus-within:border-indigo-500 focus-within:ring-indigo-500';

  return (
    <Combobox
      immediate
      value={selected}
      onChange={(model: DeviceModel | null) => {
        onChange(model);
        setQuery('');
      }}
      disabled={disabled}
    >
      <div className="relative w-full">
        <div
          className={`cursor-default overflow-hidden rounded-md bg-white text-left border shadow-sm focus-within:ring-1 ${borderClass}`}
        >
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0"
            displayValue={(m: DeviceModel | null) => (m ? formatDeviceModelLabel(m) : '')}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filtered.length === 0 ? (
              <div className="py-2 px-4 text-gray-500 text-sm">Sonuç bulunamadı.</div>
            ) : (
              filtered.map((m) => (
                <Combobox.Option
                  key={m.id}
                  value={m}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected: isSelected, active }) => (
                    <>
                      <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                        {formatDeviceModelLabel(m)}
                      </span>
                      {m.brand && m.name && (
                        <span className={`block truncate text-xs ${active ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {m.brand} · {m.name}
                        </span>
                      )}
                      {isSelected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-indigo-600'
                          }`}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};
