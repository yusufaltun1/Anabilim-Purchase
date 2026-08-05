**Özet**  
Yeni satın alma talebi oluşturma formu. Başlık, açıklama, isteğe bağlı ilk onaycı seçimi ve dinamik kalem listesi içerir.

**Route & Security**  
- Route: `/purchase-requests/create`  
- `PrivateRoute` + `REQUEST_CREATE` (yoksa `/purchase-requests`’e yönlendirilir)

**Tip**  
Oluşturma formu

**Amaç**  
Talep sahibinin ürün kalemleriyle birlikte yeni talep açması ve onay zincirini başlatması.

**Form alanları — Talep**  
| Alan | Tip | Zorunlu | Not |
|------|-----|---------|-----|
| title | text | Evet | Talep Başlığı |
| description | textarea | Evet | Açıklama |
| firstApproverUserId | select | Koşullu | Birden fazla seçilebilir üst grup varsa zorunlu |

**İlk onaycı select**  
- API: `GET /api/purchase-requests/first-approver-candidates`  
- Tek seçilebilir aday varsa otomatik seçilir ve select disabled  
- Üye atanmamış gruplar disabled option  
- Payload: `firstApproverUserId` (tek adayda otomatik)

**Form alanları — Kalem (her ürün)**  
| Alan | Tip | Zorunlu |
|------|-----|---------|
| productName | text | Evet |
| quantity | number (min 1) | Evet |
| description | textarea | Evet |
| productLink | url | Hayır |
| estimatedDeliveryDate | datetime-local | Evet |
| imageBase64 | file (image/*) | Hayır |
| notes | textarea | Hayır |
| potentialSupplierIds | — | Hayır (create’te UI yok, boş array) |

**Butonlar**  
- **+ Ürün Ekle** / kalem sil (X)  
- **İptal** → `/purchase-requests`  
- **Oluştur** → `POST /api/purchase-requests` (en az 1 kalem + onaycı validasyonu)

**API'ler**  
- `getFirstApproverCandidates()`  
- `createRequest(payload)`

**Edge case'ler**  
- Resim sadece `image/*` kabul edilir (FileReader base64)  
- Submit disabled: loading, kalem yok, çoklu onaycı seçilmemiş  
- Başarı sonrası 1.5 sn sonra listeye dönüş

**Mobil notlar**  
- Kalem grid `md:grid-cols-2`; mobilde tek sütun  
- Resim yükleme alanı dokunmatik uyumlu

---

---

## Ek kaynak analizi (explore)

## PurchaseRequestCreate

- **Route + security:** `/purchase-requests/create` · `PrivateRoute` · `REQUEST_CREATE` yoksa `/purchase-requests`e redirect
- **Tip:** Form (oluşturma)
- **Amaç:** Yeni satın alma talebi
- **Form alanları:**
  | Alan | Zorunlu | Validasyon / koşul |
  |---|---|---|
  | Talep Başlığı | Evet (`required`) | — |
  | Açıklama | Evet | — |
  | İlk onaycı | Koşullu | Aday >1 ise zorunlu seçim; =1 ise otomatik/disabled; seçilebilir aday yoksa manager’a gider uyarısı |
  | Ürün Adı | Evet (kalem) | — |
  | Miktar | Evet | `min=1` |
  | Açıklama (kalem) | Evet | — |
  | Ürün Linki | Hayır | `type=url` |
  | Tahmini Teslimat | Evet | `datetime-local` |
  | Ürün Resmi | Hayır | sadece `image/*` → base64 |
  | Notlar | Hayır | — |
- **Tablo:** Yok
- **Filtreler:** Yok
- **Aksiyonlar:** + Ürün Ekle · kalem Sil · İptal · Oluştur (items boş veya onaycı seçilmemişse disabled)
- **Modals:** Yok
- **APIs:** `GET /api/purchase-requests/first-approver-candidates` · `POST /api/purchase-requests` (`firstApproverUserId` opsiyonel)
- **Workflow:** Oluşturma sonrası başarı → 1.5s → liste
- **Edge cases:** Submit items.length===0 ile disabled · `potentialSupplierIds` her zaman `[]` (UI’da seçim yok) · tek onaycıda select disabled

---