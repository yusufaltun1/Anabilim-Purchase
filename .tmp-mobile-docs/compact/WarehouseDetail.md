**Route:** `/warehouses/:id`
**Parent:** ZW-55
**Etiket:** MOBILE

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

---

## Ek kaynak analizi (explore)

## WarehouseDetail

- **Route:** `/warehouses/:id` — PrivateRoute only
- **Tip:** detail
- **Bilgi:** kod, adres, sorumlu, telefon/email, durum
- **Stok tablosu:** Ürün | Stok | Min | Max | Son Hareket | Hareketler
- **Hareketler modal:** Tarih | Miktar (±) | Tip | Referans | Açıklama + pagination UI
- **APIs:** `GET /api/warehouses/:id`, `GET /api/warehouse-stocks/warehouse/:id`, `GET .../warehouse-stocks/:stockId/movements`
- **Not:** `handleUpdateStock` / `handleCreateStockMovement` tanımlı ama UI’da bağlı değil

---