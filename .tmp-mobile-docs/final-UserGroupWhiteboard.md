## Özet
React Flow tabanlı interaktif kullanıcı grubu tahtası; grupları görsel düğüm olarak gösterir, sürükle-bırak konumlandırma, gruplar arası bağlantı, üye atama yan paneli.

## Route & Security
- **Route:** `/user-groups/whiteboard`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem menüsü → Kullanıcı Grupları; `SYSTEM_MANAGE`

## Sayfa Tipi
İnteraktif canvas (React Flow) + sabit yan panel (320px)

## Amaç
Kullanıcı gruplarını görsel org-chart benzeri tahtada yönetmek; gruplara kullanıcı atamak, gruplar arası ilişki (link) kurmak, grup meta verilerini düzenlemek.

## Form Alanları

### Sol Panel (React Flow Panel)
| Alan | Tip | Validasyon | Varsayılan |
|------|-----|------------|------------|
| `newGroupName` | text | Boşsa create'te `'Yeni Grup'` kullanılır | `''` |

### Sağ Panel — Grup seçiliyken
| Alan | Label | Tip | Zorunlu |
|------|-------|-----|---------|
| `editGroupName` | Grup adı | text | Boşsa mevcut ad veya `'Grup'` |
| `editGroupDescription` | Açıklama (isteğe bağlı) | text | Hayır |

### Sağ Panel — Kullanıcı atama
| Alan | Tip | Not |
|------|-----|-----|
| `userSearchQuery` | search | Ad, soyad, email, departman filtre |
| Kullanıcı checkbox'ları | checkbox[] | `selectedUserIds: number[]` |
| Sayfalama | — | 20 kullanıcı/sayfa |

## Tablo Sütunları
Yok. Canvas düğümleri:
- **label** (grup adı)
- **memberCount** (üye sayısı)
- **description** (ilk 30 karakter)

Kenarlar (edges): `sourceGroupId` → `targetGroupId`, opsiyonel `linkLabel`

## Filtreler
- Kullanıcı listesi arama filtresi (client-side)
- Canvas filtresi yok

## Butonlar

### Sol Panel
| Buton | Aksiyon |
|-------|---------|
| **Yeni Grup** | `createGroup` → canvas'a düğüm ekle |
| **Pozisyonları kaydet** | Tüm düğüm pozisyonlarını toplu kaydet |
| **Yenile** | Whiteboard verisini yeniden yükle |

### Sağ Panel (grup seçili)
| Buton | Aksiyon |
|-------|---------|
| **Güncelle** | Grup adı/açıklama |
| **Kopyala** | Offset (+80,+60) konumda kopya grup |
| **Sil** | confirm → grup + bağlantıları sil |
| **Kullanıcı listesini yenile** | `userService.getAllUsers()` |
| **Üyeleri kaydet** | `setGroupMembers` |
| **← Önceki / Sonraki →** | Kullanıcı sayfalama |

### Canvas Etkileşimleri
- Düğüm sürükle → `onNodeDragStop` → tek pozisyon PATCH
- Handle'dan sürükle → bağlantı oluştur
- Delete/Backspace → seçili düğüm/kenar sil
- Düğüme tıkla → sağ panel aktif

## Modallar
Resmi modal yok. Kullanılan diyaloglar:
- `window.confirm` — grup silme (panel)
- `alert` — grup silme hatası, bağlantı oluşturma hatası, grup oluşturma hatası

## API'ler

### `userGroup.service` (role/workflow/permission değil)
| Metod | Endpoint | Kullanım |
|-------|----------|----------|
| `getWhiteboardData()` | `GET /api/user-groups/whiteboard` | İlk yükleme |
| `getGroupById(id)` | `GET /api/user-groups/{id}` | Seçili grup üyeleri |
| `createGroup(dto)` | `POST /api/user-groups` | Yeni grup / kopyala |
| `updateGroup(id, dto)` | `PUT /api/user-groups/{id}` | Meta güncelle |
| `updateGroupPosition(id, x, y)` | `PATCH /api/user-groups/{id}/position` | Sürükle-bırak |
| `updateGroupPositions(dto)` | `PUT /api/user-groups/positions` | Toplu kaydet |
| `deleteGroup(id)` | `DELETE /api/user-groups/{id}` | Sil |
| `createLink(dto)` | `POST /api/user-groups/links` | Bağlantı |
| `deleteLink(linkId)` | `DELETE /api/user-groups/links/{id}` | Kenar sil |
| `setGroupMembers(dto)` | `PUT /api/user-groups/members` | Üye atama |

### `user.service`
| Metod | Kullanım |
|-------|----------|
| `getAllUsers()` | Yan panel kullanıcı listesi |

## Navigasyon
- Tek sayfa; alt route yok
- Hata durumunda "Tekrar dene" → `loadWhiteboard()`

## Edge Case'ler
- Kullanıcı listesi boş/hatalı — amber uyarı + yenile linki
- `id` olmayan kullanıcılar checkbox disabled
- Aynı gruba veya duplicate bağlantı → alert
- Düğüm silme (Delete tuşu) API çağrısı yapar; hata olursa alert, UI geri alınmaz
- Kopya grup üye içermez (`memberCount: 0`)
- Pozisyon mesajları 2-4 sn auto-hide
- İsim alanları snake_case/camelCase uyumluluğu (`first_name` / `firstName`)

## Mobil Notlar
- **Kritik:** `flex` layout — canvas + `w-80` sabit yan panel; mobilde panel tahtayı ezer veya taşar
- React Flow pinch-zoom/pan mobilde zor; alternatif: tam ekran canvas + bottom sheet panel
- MiniMap, Controls küçük ekranda yer kaplar — gizlenebilir
- Delete/Backspace mobil klavyede yok — silme için explicit buton gerekir
- Handle sürükleme parmakla zor — büyük touch target
- Kullanıcı listesi 20/sayfa + sticky arama mobilde iyi pattern
- `calc(100vh - 4rem)` yükseklik mobil browser chrome ile sorunlu olabilir
- Yan panel başlığı "Rollere kullanıcı atama" — grup/rol terminolojisi karışık; mobil UX'te netleştirilmeli

[REDACTED]