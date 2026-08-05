**Route:** `/purchase-requests/edit/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

**Özet**  
Mevcut talebi düzenleme. Rol bazlı iki farklı ekran render edilir.

**Route & Security**  
- Route: `/purchase-requests/edit/:id`  
- `PrivateRoute` + `REQUEST_EDIT` (yoksa listeye yönlendirme)

**Tip**  
Düzenleme formu (rol dallanması)

**Amaç**  
Satın alma departmanının katalog ürün/tedarikçi odaklı düzenlemesi veya talep sahibinin serbest metin düzenlemesi.

---

#### Dal A — Satın alma editörü

**Koşul:** `SATIN_ALMA_DEPARTMANI` veya `PURCHASE_MANAGER`

**Form alanları:**  
| Alan | Tip |
|------|-----|
| title | text (required) |
| description | textarea (required) |

**Kalemler** (`PurchaseRequestItems` bileşeni):

| Alan | Tip |
|------|-----|
| productId | react-select (aktif ürünler) |
| productName | text |
| quantity | number |
| description | textarea |
| productLink | url |
| imageBase64 | görüntüleme (upload yok) |
| potentialSupplierIds | multi-select (kategori/tüm tedarikçi toggle) |
| estimatedDeliveryDate | date |
| notes | textarea |

**Butonlar:** Geri, İptal, Kaydet  
**API:** `GET /api/purchase-requests/:id`, `PUT /api/purchase-requests/:id/items`

---

#### Dal B — Talep sahibi editörü (`PurchaseRequestEditRequester`)

**Koşul:** Diğer tüm roller

**Form:** title, description + kalemler (Create ile benzer: productName, quantity, description, productLink, estimatedDeliveryDate, image upload, notes)

**API:** `PUT /api/purchase-requests/:id` (talep + kalemler birlikte)

**Edge case'ler**  
- Satın alma dalında `console.log` debug satırları mevcut  
- Requester dalında `potentialSupplierIds` korunur ama UI’da seçim yok

**Mobil notlar**  
- PurchaseRequestItems grid responsive  
- Requester formu datetime-local + file input mobil uyumlu

---

---

## Ek kaynak analizi (explore)

## PurchaseRequestEdit

- **Route + security:** `/purchase-requests/edit/:id` · `PrivateRoute` · `REQUEST_EDIT` zorunlu; rol dalı:
  - `SATIN_ALMA_DEPARTMANI` | `PURCHASE_MANAGER` → satın alma editörü
  - Diğerleri → `PurchaseRequestEditRequester`
- **Tip:** Form (güncelleme)

### Satın alma editörü
- Alanlar: title*, description*, kalemler (`PurchaseRequestItems`)
- Kalem alanları: Ürün (react-select, product catalog), Ürün Adı, Miktar (min1), Açıklama, Ürün Linki (url), görsel (read-only varsa), Potansiyel Tedarikçiler (multi; kategori veya tüm), Tahmini Teslim (`date`→`T00:00:00`), Notlar
- Toggle: “Tüm Tedarikçileri Göster”
- API: `GET /api/purchase-requests/{id}` · `PUT /api/purchase-requests/{id}/items` · products/suppliers yardımcı
- Aksiyonlar: Geri · İptal · Kaydet · Ürün Ekle · Sil

### Requester editörü (`PurchaseRequestEditRequester`)
- Alanlar: title*, description*, kalem: productName*, quantity*, description, productLink, estimatedDelivery (datetime-local), image, notes · Kalem Ekle/Sil
- API: `PUT /api/purchase-requests/{id}` (item id korunur; datetime 16 karakterse `:00` eklenir)
- items.length===0 → Kaydet disabled

---