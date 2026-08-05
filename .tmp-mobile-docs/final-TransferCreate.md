**Özet**  
Yeni depo transferi oluşturma; çoklu kalem, stok kontrolü, alıcı autocomplete.

**Route & Security**  
- Route: `/transfers/create`  
- `PrivateRoute`

**Transfer bilgileri formu**  
| Alan | Zorunlu |
|------|---------|
| sourceWarehouseId | Evet |
| targetWarehouseId | Evet |
| transferDate | date Evet |
| notes | textarea Hayır |
| selfManaged | checkbox |
| receiverUserId | Koşullu (selfManaged=false) |

**Alıcı kullanıcı**  
Autocomplete input; aktif kullanıcılar (`userService.getActiveUsers`); isim/e-posta filtre

**Kalem alanları (her ürün)**  
| Alan | Zorunlu | Not |
|------|---------|-----|
| productId | Evet | stok bilgisi option’da |
| requestedQuantity | Evet | max mevcut stok |
| serialNumbers | Koşullu | FIXED_ASSET / SEMI_FIXED_ASSET |
| conditionNotes | Hayır | |
| transferImagesBase64 | file multi | base64 |
| notes | textarea | |

**Butonlar**  
Ürün Ekle, kalem Sil, İptal, Kaydet

**Validasyon**  
Kaynak/hedef depo, tarih, min 1 kalem, stok yeterliliği, seri no zorunluluğu

**API'ler**  
- `warehouseService.getActiveWarehouses`, `getWarehouseStocks(sourceId)`  
- `productService.getActiveProducts`  
- `POST /api/asset-transfers`

**Mobil notlar**  
- Alıcı dropdown `max-h-60` scroll  
- Görsel yükleme mobil file picker

---

---

## Ek kaynak analizi (explore)

## TransferCreate

- **Route + security:** `/transfers/create` · `PrivateRoute`
- **Tip:** Form
- **Alanlar:**
  | Alan | Zorunlu | Koşul |
  |---|---|---|
  | sourceWarehouseId | Evet | >0 |
  | targetWarehouseId | Evet | >0 |
  | transferDate | Evet | date |
  | notes | Hayır | — |
  | selfManaged | Hayır | true → receiver zorunlu değil |
  | receiverUserId | Evet (selfManaged false) | searchable user dropdown |
  | items[] | ≥1 | — |
  | productId | — | select + stok bilgisi |
  | requestedQuantity | — | ≤ currentStock |
  | serialNumbers | FIXED/SEMI_FIXED | zorunlu |
  | conditionNotes | Hayır | — |
  | transferImagesBase64 | Hayır | multi image → base64 |
  | notes (kalem) | Hayır | — |
- **APIs:** `POST /api/asset-transfers` · warehouses/products/users · `GET` warehouse stocks
- **Edge:** Kaynak=hedef aynı olabilir (UI engeli yok)

---