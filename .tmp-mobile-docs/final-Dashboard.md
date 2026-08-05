## Özet
Giriş yapmış kullanıcının ana özeti. İstatistik kartları, işlemdeki talepler, onay bekleyen talepler ve (satın alma personeli için) üst onaycıdan iletilen talepler listelenir. `Navigation` bileşeni her zaman görünür.

## Route & Security
| Özellik | Değer |
|---------|-------|
| Path | `/dashboard` |
| Koruma | `PrivateRoute` — token veya MSAL account gerekli |
| CapabilityRoute | **Yok** — tüm authenticated kullanıcılar erişebilir |
| Menü | Navigation → Dashboard (her zaman görünür) |

## Sayfa tipi
**Dashboard / özet liste sayfası** — read-only kartlar + tıklanabilir liste satırları, form yok.

## Amaç / özellikler
- Kullanıcıya kişiselleştirilmiş hoş geldin mesajı
- 4 özet metrik kartı (bu ay, bugün, onay bekleyen, işlemde)
- Satın alma personeline özel "Onaylananlar" (senior-forwarded) bölümü
- İşlemde olan talepler listesi (max 5 + "tümünü gör")
- Onay bekleyen talepler listesi (max 5 + "tümünü gör")
- Görüldü/görülmedi vurgusu (`localStorage` tabanlı)
- Talep detayına deep link

## Form alanları
Yok (salt okunur dashboard).

## Tablo kolonları
Klasik tablo yok; **liste kartları** kullanılır.

### İstatistik kartları (4 adet)
| Kart | Veri kaynağı | Hesaplama |
|------|--------------|-----------|
| Bu Ay Talepler | `purchaseRequests` | `createdAt` bu ay içinde olanlar |
| Bugün Talepler | `purchaseRequests` | `createdAt` bugün 00:00–24:00 arası |
| Onay Bekleyen | `pendingApprovalsDisplay` | Filtrelenmiş pending count |
| İşlemde | `purchaseRequests` | status ∈ `IN_PROGRESS`, `APPROVED`, `PARTIAL_APPROVAL` |

### "Onaylananlar" listesi (satın alma personeli, max 8)
| Görünen alan | Kaynak |
|--------------|--------|
| Rozet | "Üst onaydan iletildi" |
| Başlık | `request.title` veya `Talep #${id}` |
| Talep eden | `requester.firstName lastName` |
| Ürün sayısı | `items.length` |
| Tarih | `createdAt` → `tr-TR` locale |
| Görüntülendi | `seenPendingIds` içindeyse "• Görüntülendi" |
| Detay butonu | → `/purchase-requests/:id` |

### "İşlemde Olan Talepler" listesi (max 5)
| Görünen alan | Kaynak |
|--------------|--------|
| Rozet | "İşlemde" (yeşil) |
| Başlık | `title` veya fallback id |
| Talep eden, ürün sayısı, tarih | aynı pattern |
| Detay | → `/purchase-requests/:id` |

**Filtre:** status ∈ `IN_PROGRESS`, `APPROVED`, `PARTIALLY_APPROVED` (liste filtrelemede `PARTIALLY_APPROVED`; istatistik kartında `PARTIAL_APPROVAL` — **tutarsızlık**).

### "Onay Bekleyen Talepler" listesi (max 5)
| Görünen alan | Kaynak |
|--------------|--------|
| Rozet | "Onay Bekliyor" |
| Alt rozet | `isOwnRequest` → "Kendi talebiniz" / "Size onay bekliyor" |
| Başlık, talep eden, ürün, tarih | aynı |
| Görüntülendi | seen state |
| Detay | → `/purchase-requests/:id` |

## Filtreler / arama
Yok (client-side filtre yok). Rol bazlı API filtreleme:
- `isPurchasingStaff` = roller `SATIN_ALMA_DEPARTMANI` veya `PURCHASE_MANAGER`
- Pending display: satın alma personeli için senior-forwarded id'leri pending'den çıkarılır (çift gösterim önleme)

## Butonlar & aksiyonlar

| Buton | Konum | Aksiyon |
|-------|-------|---------|
| Detay | Her liste satırı | `navigate('/purchase-requests/${id}')` |
| Tüm işlemdeki talepleri görüntüle → | İşlemde listesi footer (>5 kayıt) | `/purchase-requests` |
| Tüm onay bekleyen talepleri görüntüle → | Pending listesi footer (>5) | `/purchase-requests?status=pending` |

Navigation üzerinden diğer modüllere geçiş (Dashboard dışı).

## Modallar
Yok.

## API'ler

Mount'ta `Promise.all` ile paralel:

| Servis method | HTTP | Koşul |
|---------------|------|-------|
| `purchaseRequestService.getMyRequests()` | GET `/api/purchase-requests/my-requests` | Her zaman |
| `purchaseRequestService.getPendingApprovals()` | GET `/api/purchase-requests/pending-approvals` | Her zaman |
| `purchaseRequestService.getSeniorForwardedPendingApprovals()` | GET `/api/purchase-requests/pending-approvals/senior-forwarded` | `isPurchasingStaff` ise; değilse boş resolve |

**Yardımcı (localStorage):**
- `getSeenPendingApprovalIds(userId)` — key: `dashboard_pending_approval_seen_${userId}`
- `pruneSeenPendingApprovals(userId, ids)` — artık listede olmayan id'leri temizler

**Auth okuma (API çağrısı değil):**
- `authService.getUserInfo()`, `getCurrentUser()`, `getEffectiveRoles()`

## Navigasyon
| Hedef | Tetikleyici |
|-------|-------------|
| `/purchase-requests/:id` | Detay butonları |
| `/purchase-requests` | İşlemde footer |
| `/purchase-requests?status=pending` | Pending footer |

## Edge cases / koşullu UI
- **Loading:** tüm listeler spinner + "Yükleniyor..."
- **Error:** tek global `error` state — "Veriler yüklenirken hata oluştu"
- **Onaylananlar bölümü:** yalnızca `isPurchasingStaff === true`
- **Pending çift filtre:** senior-forwarded id'leri pending listesinden çıkarılır
- **Seen/unseen UI:** görülmemiş → sol border + renkli arka plan + nokta indicator; görülmüş → soluk gri + "Görüntülendi"
- **Kendi talebiniz:** `request.requester.id === currentUserId`
- **Boş state:** her liste için ayrı empty state mesajı + ikon
- **formatAmount** tanımlı ama **kullanılmıyor**
- API response: `data` array veya tek obje → normalize edilir
- `getInProgressRequests` vs liste filtresi status enum farkı (`PARTIAL_APPROVAL` vs `PARTIALLY_APPROVED`)

## Mobil notlar
- 4 kolonlu grid → mobilde 1 kolon (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- İki kolonlu liste grid → mobilde stack (`lg:grid-cols-2`)
- Navigation desktop odaklı (`hidden md:flex`) — mobilde hamburger/drawer yok (Navigation dosyasında); mobil portta bottom tab veya drawer şart
- Pull-to-refresh yok — mobilde `RefreshControl` eklenmeli
- Seen state AsyncStorage'a taşınmalı (`localStorage` → platform storage)
- Liste max 5/8 slice — mobilde "Tümünü gör" daha belirgin olmalı
- Push notification entegrasyonu: pending count badge Navigation/NotificationBell ile bağlanabilir
- Deep link: `/purchase-requests/:id` expo-router screen'e map edilmeli

---