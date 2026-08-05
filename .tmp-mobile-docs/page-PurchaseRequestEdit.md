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