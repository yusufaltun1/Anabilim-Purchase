# Shared UI Kit

Tüm mobil ekranlar bu kit’i kullanmalı. Ham `TextInput` / `TouchableOpacity` ile ad-hoc stil yazmayın.

## Import

```tsx
import {
  Screen,
  Button,
  Input,
  Select,
  useToast,
} from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
```

## Theme / tokens

- Renkler: `constants/colors.ts` (`AppColors`)
- Spacing, radius, tipografi, shadow: `constants/tokens.ts`
- Hook: `useAppTheme()` → `colors`, `spacing`, `radius`, `fontSize`, …

Token değişince tüm kit bileşenleri güncellenir.

## Bileşenler

| Bileşen | Ne için |
|---|---|
| `Text` | h1–h3, body, label, helper, error |
| `Button` | primary / secondary / outline / destructive / ghost; loading |
| `IconButton` | toolbar aksiyonları |
| `Input` | label, helper, error, required, şifre toggle |
| `TextArea` | çok satır |
| `NumberInput` | miktar / fiyat |
| `Select` | aranabilir tek seçim |
| `MultiSelect` | çoklu seçim |
| `Checkbox` / `Switch` | boolean alanlar |
| `DateTimeField` | tarih / saat |
| `FilePickerField` / `ImagePickerField` | belge / fotoğraf |
| `Screen` / `ScreenHeader` | sayfa iskeleti |
| `Card` / `Section` / `ListItem` | layout |
| `EmptyState` / `Loading` / `ErrorBanner` | feedback |
| `Badge` / `Chip` | durum etiketleri |
| `Modal` / `BottomSheet` | overlay |
| `SegmentedControl` | sekme benzeri seçim |
| `ConfirmDialog` | onay (Alert yerine) |
| `ToastProvider` + `useToast` | snackbar |
| `LocationHierarchyPickers` | 3 seviyeli konum |
| `UserSearchSelect` | kişi seçimi |

## Demo

Uygulamada `/ui-kit` rotası (geliştirme kataloğu).

## Kurallar

1. Renk / padding / font hardcode etme — token kullan.
2. Public prop’larda açık TypeScript tipleri.
3. `accessibilityLabel` + min ~44pt touch target.
4. Yeni ekran PR’larında kit dışı stil review blocker.
