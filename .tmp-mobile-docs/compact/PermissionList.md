**Route:** `/permissions`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Permission tanımlarını inline form ile oluşturma ve tablo halinde listeleme/silme sayfası.

## Route & Security
- **Route:** `/permissions`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem menüsü → Permissionlar; `SYSTEM_MANAGE`

## Sayfa Tipi
Liste + inline oluşturma formu (CRUD-lite; düzenleme yok)

## Amaç
Yeni permission kaydı eklemek; mevcut permission'ları görüntülemek ve silmek. Oluşturulan kayıtlar RoleCreate/RoleEdit kataloglarında görünür.

## Form Alanları (Oluşturma)
| Alan | placeholder | Tip | Zorunlu | Validasyon / Dönüşüm |
|------|-------------|-----|---------|---------------------|
| `name` | NAME | text | HTML `required` | `onChange` → `toUpperCase()` |
| `displayName` | Görünen Ad | text | `required` | — |
| `resource` | Resource | text | `required` | `toUpperCase()` |
| `action` | Action | text | `required` | `toUpperCase()` |
| `description` | Açıklama | text | `required` | — |
| `isActive` | — | boolean (state) | — | Varsayılan `true`; **formda görünmez**, create payload'a dahil |

Client-side trim/boş kontrolü yok (yalnızca HTML required).

## Tablo Sütunları
| Sütun | Veri |
|-------|------|
| Name | `p.name` (mono) |
| Görünen Ad | `p.displayName` |
| Resource | `p.resource` |
| Action | `p.action` |
| Açıklama | `p.description` |
| İşlem | Sil butonu |

`isActive`, `id`, tarih alanları tabloda gösterilmez.

## Filtreler
Yok (arama/sayfalama yok)

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| **Ekle** | Form submit → create → form reset → reload |
| **Sil** | Satır bazlı → confirm → delete → reload |

## Modallar
Yok. Silme: `window.confirm('Permission silinsin mi?')`

## API'ler (`permission.service`)
| Metod | Endpoint | Kullanım |
|-------|----------|----------|
| `getAllPermissions()` | `GET /api/permissions` | Liste |
| `createPermission(formData)` | `POST /api/permissions` | Ekle |
| `deletePermission(id)` | `DELETE /api/permissions/{id}` | Sil |

## Navigasyon
- Sistem menüsünden doğrudan erişim
- Başka sayfaya yönlendirme yok

## Edge Case'ler
- Düzenleme (update) UI yok
- Create/delete hataları genel mesaj: "Permission oluşturulamadı" / "Permission silinemedi"
- Form 6 sütunlu grid — mobilde taşma riski
- `id` undefined ise Sil çağrılmaz (`if (!id) return`)
- Silinen permission rol formlarında "orphan" olarak görünebilir

## Mobil Notlar
- Inline form `md:grid-cols-6` — mobilde tek sütun stack zorunlu
- Tablo yatay scroll gerektirir — mobilde kart listeye dönüştürülmeli
- 5 alan + Ekle tek satırda sığmaz
- Sil metin linki küçük dokunma alanı

---