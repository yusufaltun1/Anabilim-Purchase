**Özet**  
Depo kart listesi; aktif/pasif toggle ve pasif depo filtresi.

**Route & Security**  
- Route: `/warehouses`  
- `PrivateRoute`

**Tip**  
Liste (kart)

**Liste alanları (her depo)**  
- name, active rozeti  
- code, managerName, phone

**Filtre**  
- **Pasif Depoları Göster** checkbox (default: sadece active)

**Butonlar**  
- **Yeni Depo** → `/warehouses/create`  
- **Pasife Al / Aktife Al** → `updateWarehouseStatus(id)`  
- **Detay** → `/warehouses/:id`

**API'ler**  
- `warehouseService.getWarehouses()`

**Mobil notlar**  
- Kart grid `sm:grid-cols-3` meta bilgi; aksiyonlar sağda

---