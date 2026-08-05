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