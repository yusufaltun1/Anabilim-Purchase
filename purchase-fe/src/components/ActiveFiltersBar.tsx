export interface FilterChip {
  key: string;
  label: string;
}

interface ActiveFiltersBarProps {
  chips: FilterChip[];
  search: string;
  onSearchChange: (value: string) => void;
  onRemoveChip: (key: string) => void;
  onClearAll: () => void;
}

export const ActiveFiltersBar = ({
  chips,
  search,
  onSearchChange,
  onRemoveChip,
  onClearAll,
}: ActiveFiltersBarProps) => {
  if (chips.length === 0 && !search) return null;

  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase">Aktif filtreler</span>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onRemoveChip(chip.key)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs"
          >
            {chip.label}
            <span aria-hidden>×</span>
          </button>
        ))}
        {(chips.length > 0 || search) && (
          <button type="button" onClick={onClearAll} className="text-xs text-red-600 hover:underline">
            Tümünü temizle
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Filtrelenmiş sonuçlarda ara..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  );
};
