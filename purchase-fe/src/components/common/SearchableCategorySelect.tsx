import { Fragment, useMemo, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Category, CATEGORY_PRODUCT_TYPE_OPTIONS } from '../../types/category';

interface SearchableCategorySelectProps {
  categories: Category[];
  value: number | null;
  onChange: (category: Category | null) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
}

const typeLabel = (productType?: string) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === productType)?.label ?? productType ?? '';

export const SearchableCategorySelect = ({
  categories,
  value,
  onChange,
  required,
  disabled,
  placeholder = 'Kategori ara...',
  allowClear = false,
}: SearchableCategorySelectProps) => {
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => categories.find((c) => c.id === value) ?? null,
    [categories, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.code?.toLowerCase().includes(q) ?? false) ||
        typeLabel(c.productType).toLowerCase().includes(q)
    );
  }, [categories, query]);

  return (
    <Combobox
      value={selected}
      onChange={(cat: Category | null) => {
        onChange(cat);
        setQuery('');
      }}
      disabled={disabled}
    >
      <div className="relative w-full flex gap-1">
        <div className="relative flex-1 min-w-0">
          <div className="cursor-default overflow-hidden rounded-md bg-white text-left border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0"
              displayValue={(cat: Category | null) =>
                cat ? `${cat.name}${cat.code ? ` (${cat.code})` : ''}` : ''
              }
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              required={required && !value}
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
              filtered.map((cat) => (
                <Combobox.Option
                  key={cat.id}
                  value={cat}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected: isSelected, active }) => (
                    <>
                      <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                        {cat.name}
                        {cat.code ? ` · ${cat.code}` : ''}
                      </span>
                      {cat.productType && (
                        <span className={`block truncate text-xs ${active ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {typeLabel(cat.productType)}
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
        {allowClear && value != null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 rounded-md border border-gray-300 px-2 text-sm text-gray-600 hover:bg-gray-50"
            title="Temizle"
          >
            ×
          </button>
        )}
      </div>
    </Combobox>
  );
};
