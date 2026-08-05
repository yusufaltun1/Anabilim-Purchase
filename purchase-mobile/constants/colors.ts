/**
 * Marka paleti: primary #db0032 + nötr slate.
 * Semantic renkler (success/warning/info) badge ve feedback için ayrı tutulur.
 */

export const AppColors = {
  PRIMARY: '#db0032',
  BLACK: '#000000',
  WHITE: '#ffffff',

  light: {
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',

    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundMuted: '#f1f5f9',
    backgroundElevated: '#ffffff',

    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1',
    borderFocus: '#db0032',

    primary: '#db0032',
    primaryLight: '#ff4d6d',
    primaryDark: '#b8002a',
    primaryMuted: '#ffe6ea',

    success: '#15803d',
    successMuted: '#dcfce7',
    warning: '#d97706',
    warningMuted: '#fef3c7',
    error: '#db0032',
    errorMuted: '#ffe6ea',
    info: '#475569',
    infoMuted: '#e2e8f0',

    tabIconDefault: '#94a3b8',
    tabIconSelected: '#db0032',
    icon: '#64748b',

    overlay: 'rgba(15, 23, 42, 0.5)',
    overlayLight: 'rgba(15, 23, 42, 0.08)',

    WHITE: '#ffffff',
  },

  dark: {
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',

    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundMuted: '#334155',
    backgroundElevated: '#1e293b',

    border: '#334155',
    borderLight: '#1e293b',
    borderDark: '#64748b',
    borderFocus: '#ff4d6d',

    primary: '#db0032',
    primaryLight: '#ff4d6d',
    primaryDark: '#b8002a',
    primaryMuted: '#4d1a1a',

    success: '#4ade80',
    successMuted: '#14532d',
    warning: '#fbbf24',
    warningMuted: '#78350f',
    error: '#fb7185',
    errorMuted: '#4d1a1a',
    info: '#94a3b8',
    infoMuted: '#334155',

    tabIconDefault: '#94a3b8',
    tabIconSelected: '#db0032',
    icon: '#cbd5e1',

    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',

    WHITE: '#ffffff',
  },
} as const;

export const ColorUtils = {
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace('#', '');
    if (hex.length !== 6) return color;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
};

export type ColorScheme = 'light' | 'dark';
/** Light/dark ortak anahtar seti — literal hex union yerine string */
export type ThemeColors = {
  [K in keyof typeof AppColors.light]: string;
};
export type AppColorKey = keyof ThemeColors;
