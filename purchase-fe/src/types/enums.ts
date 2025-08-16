export const UnitOfMeasure = {
  PIECE: 'PIECE',
  BOX: 'BOX',
  PACKAGE: 'PACKAGE',
  KILOGRAM: 'KILOGRAM',
  LITER: 'LITER',
  METER: 'METER',
  SET: 'SET',
  PAIR: 'PAIR',
  ROLL: 'ROLL',
  BOTTLE: 'BOTTLE'
} as const;

export type UnitOfMeasureType = typeof UnitOfMeasure[keyof typeof UnitOfMeasure];

export const UnitOfMeasureLabels: Record<UnitOfMeasureType, string> = {
  PIECE: 'Adet',
  BOX: 'Kutu',
  PACKAGE: 'Paket',
  KILOGRAM: 'Kilogram',
  LITER: 'Litre',
  METER: 'Metre',
  SET: 'Takım',
  PAIR: 'Çift',
  ROLL: 'Rulo',
  BOTTLE: 'Şişe'
};

// Label'dan enum değerine dönüştürme
export const getLabelToUnit = (label: string): UnitOfMeasureType => {
  const entry = Object.entries(UnitOfMeasureLabels).find(([_, value]) => value === label);
  return entry ? (entry[0] as UnitOfMeasureType) : 'PIECE';
};

// Enum değerinden label'a dönüştürme
export const getUnitToLabel = (unit: string): string => {
  const normalizedUnit = unit.toUpperCase().trim() as UnitOfMeasureType;
  return UnitOfMeasureLabels[normalizedUnit] || UnitOfMeasureLabels.PIECE;
}; 