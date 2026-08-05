## Özet
Sistem kullanıcılarının listelendiği, filtrelendiği, sıralandığı ve sayfalandığı yönetim sayfası. Düzenleme ve silme aksiyonları satır bazında sunulur. Navigation menüsünde **Sistem → Kullanıcılar** (`SYSTEM_MANAGE` capability gerekir).

## Route & Security
| Özellik | Değer |
|---------|-------|
| Path | `/users` |
| Koruma | `PrivateRoute` |
| CapabilityRoute | **Yok** (route seviyesinde) |
| UI erişim | Navigation'da `canSystemManage` (`BILGI_ISLEM_DEPARTMANI`, `SYSTEM_ADMIN`) |
| Not | URL doğrudan yazılırsa PrivateRoute geçer; backend yetki kontrolü ayrı |

## Sayfa tipi
**Liste + filtre + tablo + pagination sayfası**

## Amaç / özellikler
- Tüm kullanıcıları listeleme
- Client-side arama, durum/departman/rol filtresi
- Kolon sıralama (tıklanabilir header)
- Sayfalama (10 kayıt/sayfa)
- Yeni kullanıcı oluşturma navigasyonu
- Kullanıcı düzenleme / silme
- Route state ile başarı mesajı gösterimi (create/edit sonrası)

## Form alanları

### searchTerm (Arama)
| Özellik | Değer |
|---------|-------|
| Ad | `searchTerm` (state) |
| Tip | text input |
| Label | Arama |
| Placeholder | Ad, e-posta, pozisyon... |
| Required | Hayır |
| Validation | Trim + lowercase karşılaştırma |
| Aranan alanlar | email, firstName, lastName, department, position |
| Disabled | — |
| Side effect | Değişince `currentPage = 1` |

### filter (Durum)
| Özellik | Değer |
|---------|-------|
| Ad | `filter` |
| Tip | select |
| Label | Durum |
| Required | Hayır |
| Options | `all` → Tümü, `active` → Aktif |
| Validation | `active` seçilince `user.isActive === true` |
| Disabled | — |
| Side effect | `currentPage = 1` |

### departmentFilter
| Özellik | Değer |
|---------|-------|
| Ad | `departmentFilter` |
| Tip | select |
| Label | Departman |
| Required | Hayır |
| Options | Dinamik: mevcut kullanıcı listesinden unique `department` + "Tümü" (`""`) |
| Validation | Tam eşleşme (`user.department === departmentFilter`) |
| Disabled | — |

### roleFilter
| Özellik | Değer |
|---------|-------|
| Ad | `roleFilter` |
| Tip | select |
| Label | Rol |
| Required | Hayır |
| Options | Dinamik: tüm kullanıcıların unique rolleri + "Tümü" |
| Validation | `(user.roles ?? []).includes(roleFilter)` |
| Disabled | — |

## Tablo kolonları

| Kolon | Sortable | Render | Boş değer |
|-------|----------|--------|-----------|
| Ad Soyad | `firstName` ↑↓ | `{firstName} {lastName}` | — |
| E-posta | `email` | `user.email` | — |
| Departman | `department` | text | `—` |
| Pozisyon | `position` | text | `—` |
| Roller | `roles` (join karşılaştırma) | chip listesi (indigo badge) | boş array → chips yok |
| Durum | Hayır | Aktif (yeşil) / Pasif (kırmızı) badge | — |
| İşlemler | Hayır | Düzenle + Sil butonları | — |

**Pagination:** 10/sayfa; sayfa numaraları ellipsis ile (7+ sayfa).

## Filtreler / arama
- **Arama:** çok alanlı substring (case-insensitive)
- **Durum:** all / active
- **Departman:** dropdown unique values
- **Rol:** dropdown unique role names
- **Aktif filtre göstergesi:** `hasActiveFilters` → sonuç sayısı + "Filtreleri temizle"
- **clearFilters:** tüm filtreleri sıfırlar, page=1

## Butonlar & aksiyonlar

| Buton | Aksiyon |
|-------|---------|
| Yeni Kullanıcı | `navigate('/users/create')` |
| Ad Soyad / E-posta / Departman / Pozisyon / Roller header | `handleSort(field)` — asc↔desc toggle |
| Düzenle | `navigate('/users/edit/${id}')` |
| Sil | `window.confirm` → `userService.deleteUser(id)` → listeden çıkar + success toast |
| Filtreleri temizle | `clearFilters()` |
| ← Önceki / Sonraki → | pagination |
| Sayfa numaraları | `setCurrentPage(n)` |

## Modallar
Yok — silme `window.confirm` native dialog.

## API'ler

| Servis method | HTTP | Tetikleyici |
|---------------|------|-------------|
| `userService.getAllUsers()` | GET `/api/users` | Mount (`loadUsers`) |
| `userService.deleteUser(id)` | DELETE `/api/users/${id}` | Sil onayı sonrası |

**Response:** `getAllUsers` → `UserResponse.data` array; değilse hata "Beklenmeyen veri formatı".

## Navigasyon
| Kaynak | Hedef | State |
|--------|-------|-------|
| Yeni Kullanıcı | `/users/create` | — |
| Düzenle | `/users/edit/:id` | — |
| Create/Edit success | `/users` | `{ message: '...' }` → 5 sn success banner |

## Edge cases / koşullu UI
- **Loading:** spinner (tablo yerine)
- **Error:** kırmızı banner — yükleme veya silme hatası
- **Empty filtered:** "Arama kriterlerine uygun kullanıcı bulunamadı" + filtre temizle
- **Empty no users:** "Henüz kullanıcı eklenmemiş"
- **Success message:** `location.state.message` → replace navigation ile state temizlenir, 5 sn timeout
- **Header aktif sayısı:** pasif kullanıcı varsa yeşil "(X aktif)" gösterilir
- **Sort roles:** string join localeCompare
- **Pagination gizli:** `totalPages <= 1`
- **Tablo yatay scroll:** `overflow-x-auto` wrapper

## Mobil notlar
- 4 kolonlu filtre grid → mobilde 1 kolon stack
- Tablo mobilde yatay scroll — kart/liste layout alternatifi önerilir (swipe actions: düzenle/sil)
- `window.confirm` → native Alert (`Alert.alert`) veya bottom sheet onay
- 10/sayfa pagination mobilde infinite scroll'a çevrilebilir
- Rol chip'leri wrap — OK
- Silme destructive action — confirmation + undo snackbar düşünülebilir
- `SYSTEM_MANAGE` olmayan kullanıcıya menü gizli; deep link guard capability check eklenmeli
- Başarı mesajı → toast/snackbar pattern (Expo)

---