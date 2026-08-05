## Özet
Sistemdeki tüm rolleri kart grid görünümünde listeler; arama ve filtreleme sunar. Rol oluşturma, düzenleme ve (sistem rolü olmayanlar için) silme işlemlerine giriş noktasıdır.

## Route & Security
- **Route:** `/roles`
- **Koruma:** `PrivateRoute` — yalnızca giriş yapmış kullanıcılar erişir (MSAL veya geleneksel auth)
- **Navigasyon görünürlüğü:** `Navigation` → Sistem menüsü → **Roller**; menü `authService.hasCapability('SYSTEM_MANAGE')` ile gösterilir
- **Route seviyesinde ek yetki kontrolü yok** — sayfa doğrudan URL ile açılabilir

## Sayfa Tipi
Liste sayfası (kart grid; tablo değil)

## Amaç
Rol envanterini görüntülemek, durum/tip bazlı filtrelemek, yeni rol oluşturmaya ve mevcut rolleri düzenlemeye/silmeye yönlendirmek.

## Form Alanları
Bu sayfada form yok. Yalnızca filtre/arama alanları:

| Alan | Tip | Validasyon | Davranış |
|------|-----|------------|----------|
| `search` (Arama) | text | Yok | `name`, `displayName`, `description` üzerinde client-side case-insensitive filtre |
| `filter` (Filtre) | select | Yok | `all` \| `active` \| `system` \| `custom` |

## Tablo Sütunları
Tablo yok. Her kart şu bilgileri gösterir:
- **displayName** (başlık)
- **Durum rozeti:** Pasif / Sistem / Aktif
- **Rol Adı** (`name`, mono font)
- **Tip:** Sistem Rolü / Özel Rol
- **Durum:** Aktif / Pasif
- **İzinler:** sayı (`permissionNames` veya `permissions` uzunluğu)
- **description** (2 satır `line-clamp`)

## Filtreler
1. **Arama:** metin kutusu — ad, görünen ad, açıklama
2. **Filtre select:**
   - `Tümü` → `roleService.getAllRoles()`
   - `Aktif` → `roleService.getActiveRoles()` + client-side `isActive`
   - `Sistem Rolleri` → `roleService.getSystemRoles()` + client-side `isSystemRole`
   - `Özel Roller` → `getAllRoles()` + client-side `!isSystemRole`

## Butonlar
| Buton | Konum | Aksiyon |
|-------|-------|---------|
| **Yeni Rol** | Header | `navigate('/roles/create')` |
| **İlk Rolü Oluştur** | Boş durum | `navigate('/roles/create')` |
| **Düzenle** | Kart altı | `navigate('/roles/edit/:id')` |
| **Sil** | Kart altı (yalnızca `!isSystemRole`) | `window.confirm` → `roleService.deleteRole(id)` |
| Başarı mesajı kapat (×) | Banner | `setSuccessMessage(null)` |

## Modallar
Resmi modal yok. **Silme onayı:** native `window.confirm('Bu rolü silmek istediğinizden emin misiniz?')`

## API'ler (`role.service`)
| Metod | Endpoint | Kullanım |
|-------|----------|----------|
| `getAllRoles()` | `GET /api/roles` | Filtre: Tümü, Özel |
| `getActiveRoles()` | `GET /api/roles/active` | Filtre: Aktif |
| `getSystemRoles()` | `GET /api/roles/system` | Filtre: Sistem |
| `deleteRole(id)` | `DELETE /api/roles/{id}` | Sil |

## Navigasyon
- **Giriş:** Sistem menüsü → Roller; create/edit sonrası `state.message` ile geri dönüş
- **Çıkış:** `/roles/create`, `/roles/edit/:id`
- **Başarı mesajı:** `location.state.message` — 5 sn sonra otomatik gizlenir, `replace: true` ile state temizlenir

## Edge Case'ler
- Sistem rolleri silinemez (Sil butonu render edilmez)
- Silme başarılı olunca liste local state'ten filtrelenir (yeniden fetch yok)
- `filter === 'custom'` API çağrısı değiştirmez; yalnızca client-side `!isSystemRole`
- `filter === 'active'` hem API hem client-side `isActive` uygular
- Navigasyon state mesajı refresh'te tekrar gösterilmez
- API hata mesajları genel Türkçe string; backend detayı kullanıcıya yansımaz

## Mobil Notlar
- Header'da başlık + **Yeni Rol** yan yana; dar ekranda sıkışabilir — mobilde dikey stack veya FAB önerilir
- Filtre kartı `grid-cols-1 md:grid-cols-2` — mobilde tek sütun
- Rol kartları `grid-cols-1` — mobilde tek sütun, uygun
- Kart içi key-value satırları (`flex justify-between`) dar ekranda okunabilir
- Sil/Düzenle metin butonları küçük dokunma alanı — min 44px hedef önerilir
- `window.confirm` mobil tarayıcıda native dialog; React Native'de custom bottom sheet tercih edilmeli

---