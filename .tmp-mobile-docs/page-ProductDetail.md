## Özet
Tek ürünün detayı: temel bilgiler, stok (seri kart veya depo tablosu), stok hareketleri, satın alma talepleri/siparişler, tedarikçiler, zimmetler. Demirbaş için `SerialStockItemSection` + `StockItemDetailPanel`.

## Route & Security
- **Route:** `/products/:id` (suppliers/add route’undan önce tanımlı değil; `/products/:id/suppliers/add` ayrı)
- **CapabilityRoute:** `INVENTORY_VIEW`
- **INVENTORY_MANAGE:** Düzenle, stok hareketi, zimmet, tedarikçi kaldırma, StockItemDetailPanel yönetimi

## Tip
Detay sayfası + gömülü bölümler + modals

## Amaç
Ürün envanter durumunu görüntülemek; zimmet/stok/tedarik/satın alma ilişkilerini yönetmek.

---

## Üst bar
| Öğe | İçerik |
|-----|--------|
| Başlık | product.name |
| Rozet | Aktif / Pasif |
| Alt | Kod: product.code |
| Geri | `/products` |
| Düzenle | INVENTORY_MANAGE → `/products/edit/:id` |

---

## Bölüm 1: Ürün Detayları (dl grid)
| Alan | Gösterim |
|------|----------|
| Açıklama | sm:col-span-2 |
| Kategori | name [code] |
| Ürün Tipi | PRODUCT_TYPE_LABELS veya ham değer |
| Birim | unitOfMeasure |
| Seri No | Sadece serialNumber varsa; font-mono |
| Oluşturan | createdByUserName veya — |
| Oluşturulma | formatDate(createdAt) |
| Minimum Miktar | minQuantity |
| Maksimum Miktar | maxQuantity |
| Tahmini Birim Fiyat | TRY locale |

**Not:** assetLabel, school, model, konum, BYOD, sipariş alanları bu kartta gösterilmez; düzenleme formunda ve listelerde.

---

## Bölüm 2: Depo Stokları

### A) Seri bazlı (`usesSerialStockItems`: FIXED_ASSET, IT_HARDWARE) — `SerialStockItemSection`
**Başlık:** Depo Stokları — “Cihaz kartına tıklayarak zimmet, stok hareketi ve geçmişi yönetin”

**Boş durum:** Manuel hareket ile ilk cihaz ekleme yönlendirmesi

**Cihaz kartı (grid 1/2/3 kolon):**
| Öğe | İçerik |
|-----|--------|
| Görsel | 16×16 veya “Cihaz” placeholder; görsel tıklanınca parent lightbox |
| Başlık | serialNumber · assetLabel veya Cihaz #id |
| Rozet | Stokta / Zimmetli / Bakımda / Emekli / assetConditionName |
| Depo | warehouseName veya “Depo dışında” |
| Zimmet | assignedUserName veya “Zimmet yok” |
| Garantili | isUnderWarranty yeşil chip |
| CTA | “Yönet →” |

Kart tıklanınca → **StockItemDetailPanel** (portal modal)

### B) Miktar bazlı (sarf vb.) — tablo
| Sütun | İçerik |
|-------|--------|
| Miktar | notes veya “X adet” |
| Durum | assetConditionName veya status |
| Depo | warehouseName |
| Atanan Kişi | assignedUserName |
| Resim | thumbnail → lightbox |

Boş: sarf için manuel stok girişi ipucu

---

## StockItemDetailPanel — TÜM sekmeler ve aksiyonlar

**Başlık:** serialLabel, durum rozeti, depo · zimmet özeti  
**Sekmeler:** Zimmet | Stok hareketi | Geçmiş

### Sekme: Zimmet
**Aktif zimmet varsa kart:**
- Atanan + tarih
- INVENTORY_MANAGE butonları:
  - Formu indir
  - İmzalı yükle (.xlsx hidden input)
  - Zimmeti iade et → AssignmentReturnModal
  - Zimmeti iptal et (confirm)

**Aktif zimmet yok + canManage + canAssign:**
→ `StockItemAssignmentForm` (aşağıda)

**canAssign false:**
“Amber” uyarı: depoda ve Hazır durumunda olmalı

### StockItemAssignmentForm alanları
| Alan | Zorunlu |
|------|---------|
| Zimmet tipi | Kişi / Konum |
| Kullanıcı | Kişi* |
| Okul | Hayır |
| Konum (3 seviye) | Konum* |
| Konum detayı | Hayır |
| Beklenen iade tarihi | Hayır |
| Ürün fotoğrafı F8 | Hayır (AssignmentFormPhotoPicker) |
| Not | Hayır |
| Zimmeti kaydet | submit |

### Sekme: Stok hareketi (canManage)
**inWarehouse** (depoda + IN_STOCK): çıkış  
**Değil:** giriş

| Alan | Zorunlu |
|------|---------|
| Depo | Girişte* (çıkışta mevcut depo) |
| Çıkış/Giriş lokasyonu | 3 seviye* |
| Açıklama | Hayır |
| Kaydet | movementType IN/OUT, quantity 1, reference MANUAL |

### Sekme: Geçmiş

**Zimmet geçmişi tablosu:**
Tarih | Durum | Atanan | Fotoğraf | Belgeler | Not

**Stok hareketleri tablosu:**
Tarih | Tip (Giriş/Çıkış/Düzeltme) | Lokasyon | Referans | Not

Referans etiketleri: MANUAL, ASSIGNMENT, ASSIGNMENT_RETURN, ASSIGNMENT_CANCEL, PURCHASE_ORDER, ADJUSTMENT, TRANSFER

**Alt:** Kapat

---

## Bölüm 3: Stok hareketleri — `ProductStockMovementSection`

**Başlık + Manuel hareket** toggle (INVENTORY_MANAGE)

Ürün tipine göre config (`getManualStockMovementConfig`):

| Tip | Mod | Özel alanlar |
|-----|-----|--------------|
| FIXED_ASSET / IT_HARDWARE | serial | Adet giriş, seri listesi zorunlu, çıkışta cihaz seç, lokasyon, ADJUSTMENT yok |
| SEMI_FIXED_ASSET | semi | Miktar, opsiyonel seri, ADJUSTMENT var |
| Diğer | quantity | Miktar, ADJUSTMENT var |

### Manuel hareket formu — TÜM alanlar
| Alan | Koşul |
|------|-------|
| Depo * | Her zaman; mevcut stok parantez içinde |
| Hareket tipi * | IN / OUT / (+ ADJUSTMENT semi/quantity) |
| Miktar * | semi/quantity |
| Adet * | serial IN |
| Depodaki cihaz * | serial OUT |
| Giriş/Çıkış lokasyonu * | demirbaş |
| Referans | MANUAL, ADJUSTMENT, TRANSFER, PURCHASE_ORDER |
| Açıklama | text |
| Seri numaraları (Adet 1..N) | IN serial/semi |

### Hareket geçmişi tablosu
Tarih | Depo | Tip | Miktar | Referans | Lokasyon | Not

API: `warehouseService.createStockMovementWithAutoStock`, GET product stock detail/movements

---

## Bölüm 4: Satın alma talepleri
| Sütun | İçerik |
|-------|--------|
| Talep | title |
| Durum | requestStatusLabel |
| Miktar | quantity |
| Tarih | requestCreatedAt |
| Detay | → `/purchase-requests/:requestId` |

API: GET `/api/products/:id/procurement` → purchaseRequests

---

## Bölüm 5: Siparişler
| Sütun | İçerik |
|-------|--------|
| Sipariş No | orderCode |
| Durum | orderStatusLabel |
| Miktar | quantity |
| Tutar | totalPrice + currency |
| Tarih | createdAt |
| Detay | → `/purchase-orders/:orderId` |

---

## Bölüm 6: Tedarikçiler
| Aksiyon | Not |
|---------|-----|
| Tedarikçi Ekle | `/products/:id/suppliers/add` (route INVENTORY_MANAGE; buton yetki kontrolsüz) |
| Liste | supplier.name |
| Kaldır | confirm → DELETE supplier link |

---

## Bölüm 7: Zimmetler

**Zimmet Et** butonu: `product.canAssign` false ise disabled + assignBlockers listesi

### Zimmet tablosu — TÜM sütunlar
| Sütun | İçerik |
|-------|--------|
| Zimmet Tarihi | assignmentDate |
| Seri / cihaz | usesSerialItems ise serialNumber veya #stockItemId |
| Durum | ACTIVE, RETURNED, LOST, DAMAGED, EXPIRED |
| Atanan Kişi/Konum | userAssignment: ad + okul; else konum + locationDetails |
| Miktar | quantity |
| Beklenen İade | expectedReturnDate |
| Notlar | notes |
| Oluşturan | createdByUserName |
| Fotoğraf | AssignmentFormPhotoThumb |
| Belgeler | AssignmentDocumentLinks |
| Zimmet Formu | aksiyon kolonu |

### Zimmet satır aksiyonları (ACTIVE)
| Aksiyon | API |
|---------|-----|
| Formu indir | downloadAssignmentForm |
| Fotoğraf yükle/değiştir | uploadFormPhoto (jpeg/png/gif) |
| İmzalı yükle | uploadSignedAssignmentForm (.xlsx) |
| İade et | AssignmentReturnModal |
| Zimmeti iptal et | cancelAssignment (confirm) |

**canCancelAssignment:** canBeCancelled veya (ACTIVE && !hasSignedForm)

**AssignmentDocumentLinks (belge varsa):**
- İmzalı zimmet indir
- İade belgesi indir
- İade fotoğrafı indir

---

## Modal: Zimmet Oluştur

| Alan | Zorunlu | Not |
|------|---------|-----|
| Depo seçimi / Cihaz seçimi * | Evet | Sarf: depo + miktar; demirbaş: cihaz listesi |
| Miktar | Sarf* | max = depo stoku |
| Zimmet Tipi | — | Kişi / Konum |
| Kullanıcı * | Kişi | Autocomplete |
| Okul | Hayır | |
| Konum * | Konum | LocationHierarchyPickers 3 seviye |
| Konum Detayları | Hayır | |
| Beklenen İade Tarihi | Hayır | date |
| Notlar | Hayır | textarea |
| Ürün fotoğrafı F8 | Hayır | AssignmentFormPhotoPicker |
| Bilgi kutusu | — | Sarf vs demirbaş açıklaması |

**Footer:** Zimmet Oluştur (disabled koşullu) | İptal

Payload: productId, stockItemId veya quantity+warehouseId, assignedUserId/LocationId, expectedReturnDate, notes; sonra form photo + download

---

## Modal: AssignmentReturnModal — TÜM alanlar
| Alan | Zorunlu |
|------|---------|
| İade deposu * | select |
| İade formunu indir | buton |
| Ürün fotoğrafı * | kamera veya dosya |
| İmzalı iade formu * | .xlsx max 20 MB |
| İade notu | Hayır |

Submit → returnAssignment(photo, document, warehouseId, notes)

---

## Modal: Resim lightbox
Ürün / stok / zimmet fotoğrafları için tam ekran görüntü

---

## API özeti
| Bölüm | Endpoint |
|-------|----------|
| Ürün | GET `/api/products/:id` |
| Stok seri | GET `/api/v1/stock-items/product/:id` |
| Stok miktar | warehouse getProductStocks / getProductStockDetail |
| Hareketler | stock detail recentMovements; stock item movements |
| Zimmetler | GET assignments by product |
| Procurement | GET `/api/products/:id/procurement` |
| Tedarikçi kaldır | DELETE `/api/products/:id/suppliers/:supplierId` |
| Zimmet CRUD | `/api/v1/assignments` + upload/download endpoints |

---

## Navigasyon
- Liste, kategori detay, konum detay → ProductDetail
- ProductListPanel `?assign=1` (modal otom açılmaz)
- Talep/sipariş detay cross-link

## Edge cases
- `?assign=1` işlenmiyor
- Tedarikçi Ekle butonu VIEW kullanıcıda görünür ama route engeller
- Zimmet Et disabled: assignBlockers veya canAssign false
- Sarf zimmetinde stok yetersizse hata
- İmzalı form yüklendikten sonra iptal edilemeyebilir
- ProductDetail temel kart demirbaş alanlarının çoğunu göstermez

## Mobil notlar
- Zimmet tablosu çok geniş; yatay scroll veya mobilde kart görünümü gerekir
- SerialStockItemSection kart grid mobilde tek sütun ideal
- StockItemDetailPanel max-h 90vh scroll; sekmeler 3 kolon kompakt
- Zimmet modal full-screen sheet önerilir
- Kamera: iade ve zimmet fotoğrafı mobilde zorunlu akış

---