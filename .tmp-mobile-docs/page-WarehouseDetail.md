**Özet**  
Depo bilgileri + depodaki stok tablosu + stok hareketleri modal.

**Route & Security**  
- Route: `/warehouses/:id`  
- `PrivateRoute`

**Depo bilgi alanları**  
code, address, managerName, phone, email, active durumu

**Stok tablosu kolonları**  
Ürün (ad+kod), Stok Miktarı (+ birim), Min. Stok, Max. Stok, Son Hareket, İşlemler

**Stok hareketleri modal kolonları**  
Tarih, Miktar (+/-), Hareket Tipi (Giriş/Çıkış), Referans (type #id), Açıklama

**Butonlar**  
- **Hareketler** → modal + sayfalama (page size 10)  
- Modal **Kapat**

**API'ler (tanımlı, UI kısıtlı)**  
- `getWarehouseById`, `getWarehouseStocks`  
- `getStockMovements(stockId, ..., page, size)`  
- `updateStock`, `createStockMovement` (fonksiyonlar var, doğrudan UI butonu yok)

**Edge case'ler**  
- totalPages backend pagination gelmezse varsayılan 1

---