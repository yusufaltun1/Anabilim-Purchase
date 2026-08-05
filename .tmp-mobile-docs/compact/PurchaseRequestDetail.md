**Route:** `/purchase-requests/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Tek talebin tam yaşam döngüsü: detay bilgileri, belgeler, kalemler + tedarikçi teklifleri, onay zaman çizelgesi, onay/red işlemleri, teklif girişi, karşı teklif ve siparişe dönüştürme.

**Route & Security**  
- Route: `/purchase-requests/:id`  
- `PrivateRoute`  
- Yetkiler: `REQUEST_APPROVE`, `QUOTE_COLLECT`, `COUNTER_OFFER`, `ORDER_CREATE`, `REQUEST_EDIT`

**Tip**  
Detay + iş akışı + modaller

**Amaç**  
Talebin okunması, onay zincirinin yönetilmesi, teklif toplama/müzakere ve seçilen tekliften sipariş oluşturma.

---

#### Talep durumları (request.status)

| Kod | Türkçe | Tipik anlam |
|-----|--------|-------------|
| DRAFT | Taslak | Henüz onaya gitmemiş |
| IN_APPROVAL | Onay Bekliyor | Aktif onay adımı var |
| IN_PROGRESS | İşlemde | Satın alma/teklif aşaması |
| PARTIAL_APPROVAL | Kısmi Onay | Kısmi onay senaryosu |
| APPROVED | Onaylandı | Zincir tamamlandı |
| REJECTED | Reddedildi | Kapatıldı veya geri gönderildi |
| CANCELLED | İptal Edildi | İptal |
| COMPLETED | Tamamlandı | Süreç bitti |

#### Onay adımı durumları (approval.status)

| Kod | Türkçe |
|-----|--------|
| PENDING | Beklemede |
| APPROVED | Onaylandı |
| REJECTED | Reddedildi |

Her adımda: `stepOrder`, onaycı adı, `roleName`, `actionTakenAt`, `comment`.

---

#### Üst bilgi alanları

- Başlık, durum rozeti  
- Oluşturan: `requester`  
- Onaylayacak: `approvals` içinde `PENDING` adımın onaycısı  
- **Sil** (talep sahibi + `REQUEST_EDIT`, COMPLETED/CANCELLED değil)  
- **Geri** → `/purchase-requests`

**Talep detay kartı:** description, createdAt, updatedAt

---

#### Belgeler bölümü

- Liste: `attachments[]` → fileName, contentType ikonu  
- **İndir** → `GET .../attachments/:attachmentId` (blob)  
- **Belge ekle** → gizli file input, `accept="application/pdf,image/*"`  
- API: `POST /api/purchase-requests/:id/attachments` (multipart)

---

#### Satın alma kalemleri (her kalem)

**Görüntülenen alanlar:**  
- Kalem no, productName / product.name, product.code, productId  
- Görsel (base64/http link, yeni sekmede açılır)  
- quantity, estimatedDeliveryDate, product.unit, product.category  
- description, productLink, notes  
- potentialSuppliers: name, contactPerson, contactPhone, contactEmail  

**Tedarikçi teklifleri tablosu** (`SupplierQuoteList`):

| Kolon grubu | Alt kolonlar |
|-------------|--------------|
| Tedarikçi | Ad, iletişim kişisi |
| Teklif No | quoteNumber |
| Tedarikçi teklifi | Birim fiyat, Miktar, Toplam |
| Karşı teklif | Birim fiyat, Miktar, Toplam (+ counterOfferEnteredAt) |
| Teslim | deliveryDate |
| Durum | status rozeti |
| İşlemler | Teklif Gir/Güncelle, Siparişe Dönüştür |

**Teklif durumları (quote.status):**

| Kod | Türkçe |
|-----|--------|
| PENDING | Bekliyor |
| RESPONDED | Yanıtlandı |
| REJECTED | Reddedildi |
| CONVERTED_TO_ORDER | Siparişe Dönüştü |

**Teklif işlemleri (yetkiye göre):**  
- `QUOTE_COLLECT`: **Teklif Gir** (PENDING) / **Güncelle** (diğer) → Teklif modal  
- `COUNTER_OFFER`: **Karşı teklif gir** (RESPONDED, karşı teklif yok) → karşı teklif popover  
- `COUNTER_OFFER`: **Ana teklife uygula** (karşı teklif dolu) → teklif modal karşı teklif değerleriyle  
- `ORDER_CREATE`: **Siparişe Dönüştür** (RESPONDED) → ConvertRequestToOrderModal

Teklifler `totalPrice`’a göre sıralanır; seçili teklif üste alınır.

---

#### Onay işlemi paneli

Görünür koşul: `REQUEST_APPROVE` + status ∈ {IN_APPROVAL, IN_PROGRESS, PARTIAL_APPROVAL} + mevcut kullanıcı = bekleyen onaycı.

**Alanlar:**  
1. **Onayı hangi üst gruba ileteceksiniz?** — `nextApproverCandidatesList` / `request.nextApproverCandidates`  
2. **Üst onaycı bulunmuyor** (`hasNoNextApprover` + `sendDownCandidates`, SERKAN_BEY değilse): alıcı seçimi  
3. SERKAN_BEY + hasNoNextApprover: bilgi metni (doğrudan satın almaya ilet)  
4. **Onay yorumu** (textarea, opsiyonel)

**Onay butonları:**  
- Normal: **Onayla**  
- sendDown UI + SERKAN_BEY: **Onayla ve satın almaya ilet**  
- sendDown UI + diğer: **Kişiye ilet** (sendToUserId zorunlu) + **Tamamen onayla**  
- **Reddet** → Reddet modal

**Onay API payload:**  
`POST /api/purchase-requests/:id/approve`  
`{ comment, nextApproverUserId?, sendToUserId? }`

---

#### Reddet modal

| Alan | Zorunlu | Not |
|------|---------|-----|
| rejectionComment | Evet | Reddetme gerekçesi |
| returnToUserId | Hayır | SERKAN_BEY hariç; boş = tamamen reddet |

Geri gönderilecekler: talep sahibi + önceki onaycılar (`getReturnToCandidates`).

API: `POST /api/purchase-requests/:id/reject`  
`{ comment, rejectionReason, returnToUserId }`

SERKAN_BEY reddi: satın almaya iletilir, talep kapanmaz.

---

#### Teklif Gir/Güncelle modal

| Alan | Tip | Validasyon |
|------|-----|------------|
| unitPrice | number | > 0 |
| quantity | number | > 0 |
| currency | select TRY/USD/EUR | |
| supplierReference | text | |
| deliveryDate | date | zorunlu |
| validityDate | date | zorunlu |
| notes | textarea | |

API: `PUT /api/supplier-quotes/:quoteUid`

---

#### Karşı teklif popover (portal)

| Alan | Validasyon |
|------|------------|
| counterOfferQuantity | > 0 |
| counterOfferUnitPrice | > 0 |

API: `PUT /api/supplier-quotes/:quoteUid/counter-offer`  
`{ quantity, unitPrice }`

---

#### Siparişe dönüştür modal (`ConvertRequestToOrderModal`)

| Alan | Zorunlu |
|------|---------|
| quantity | Evet (max requestedQuantity) |
| deliveryWarehouseId | Evet |
| expectedDeliveryDate | datetime-local |
| notes | Hayır |

API: `POST /api/v1/purchase-orders`

---

#### Diğer API'ler

- `GET /api/purchase-requests/:id`  
- `DELETE /api/purchase-requests/:id`  
- Bekleyen onay görüldü işareti: `markPendingApprovalSeen`

**Edge case'ler**  
- `items` array/object/content/data normalize edilir  
- `supplierQuotes` array veya object olabilir  
- Onay paneli yüklenince `getFirstApproverCandidates` fallback  
- `handleCancel` tanımlı ama UI’da cancel butonu yok  
- `showAddItems` state tanımlı, kullanılmıyor

**Mobil notlar**  
- Teklif tablosu `min-w-[960px]` yatay kaydırma  
- Karşı teklif popover `w-[90vw] max-w-md`  
- Onay zaman çizelgesi dikey timeline

---