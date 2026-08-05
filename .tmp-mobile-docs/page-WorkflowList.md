## Özet
Onay süreçlerini (approval workflow) kart grid'de listeler; arama, durum filtresi, oluşturma/düzenleme/silme.

## Route & Security
- **Route:** `/workflows`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem → İş Akışları; `SYSTEM_MANAGE`

## Sayfa Tipi
Liste (kart grid)

## Amaç
Tutar aralığı ve kategoriye göre tanımlı onay süreçlerini yönetmek.

## Form Alanları
Yalnızca filtre:

| Alan | Tip | Seçenekler |
|------|-----|------------|
| Arama | text | name, description, category |
| Durum Filtresi | select | Tümü / Aktif / Pasif |

## Tablo Sütunları
Tablo yok. Kart alanları:
- **name** (başlık)
- Aktif rozeti (`isActive`)
- **description** (2 satır)
- **Kategori**
- **Min Tutar** (TRY, `Intl.NumberFormat tr-TR`)
- **Max Tutar** (TRY)
- **Adım Sayısı** (`steps.length`)

## Filtreler
- **API:** `active` → `getActiveWorkflows()`; diğerleri → `getAllWorkflows()`
- **Client:** `inactive` → `!isActive`; arama metni

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| **Yeni Workflow** | `/workflows/create` |
| **İlk Workflow'u Oluştur** | Boş durum |
| **Düzenle** | `/workflows/edit/:id` |
| **Sil** | confirm → `deleteWorkflow` |
| Başarı × | Banner kapat |

## Modallar
Silme: `window.confirm('Bu workflow\'u silmek istediğinizden emin misiniz?')`

## API'ler (`workflow.service`)
| Metod | Endpoint | Kullanım |
|-------|----------|----------|
| `getAllWorkflows()` | `GET /api/approval-workflows` | Tümü, Pasif client filtresi |
| `getActiveWorkflows()` | `GET /api/approval-workflows/active` | Aktif filtresi |
| `deleteWorkflow(id)` | `DELETE /api/approval-workflows/{id}` | Sil |

## Navigasyon
- Create/Edit sonrası `state.message` ile geri dönüş (5 sn auto-hide)

## Edge Case'ler
- Pasif filtre API'de `getInActiveWorkflows()` kullanılmaz; tüm liste client-side filtrelenir
- Pasif workflow'larda kart üzerinde rozet gösterilmez (yalnızca aktiflerde yeşil "Aktif")
- Silme sonrası local state güncellenir, refetch yok

## Mobil Notlar
- RoleList ile aynı grid/header pattern
- Tutar formatı mobilde okunaklı
- Sil her workflow için görünür (sistem rolü kısıtı yok)

---