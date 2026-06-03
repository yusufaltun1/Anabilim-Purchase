# Envanter — TODO Checklist

> Detaylar her adımda konuşulacak. Tamamlanınca `[ ]` → `[x]`

---

## Kategoriler

- [x] Kategori ekleme: ad zorunlu
- [x] Kategori ekleme: ürün tipi seçimi (sarf, demirbaş vb.)
- [x] Üst kategori alanını kaldır
- [x] Kategori güncelleme
- [x] Kategori listeleme (tüm kategoriler, miktar + atanan)
- [x] Liste: sağ üst "Yeni Oluştur"
- [x] Kategori detay — sarf: depo miktarı, kalan, atananlar
- [x] Kategori detay — demirbaş: kategorideki tüm ürünler
- [x] Minimum miktarda mail gönderimi (cron günde 1x 08:00)
- [x] Minimum miktarda bildirim paneline düşürme
- [x] Bildirim eşiği input (kalan adet)

---

## Ortak (tüm liste sayfaları)

- [x] Aktif filtreleme (chip’ler, temizle, filtreli arama) — ürünler sayfasında

---

## Ürünler

- [x] Ürünler sayfası: liste + yeni ürün + düzenle + sil
- [x] Yeni ürün formu — tüm alanlar (`ProductForm`)
- [x] Ürün kodu (iç SKU) + demirbaş etiketi (barkod) ayrı alanlar
- [x] Çoklu resim (yükle, sil)
- [x] Sipariş bilgileri — onaylı satın alma talebi seçimi
- [x] Model + "Yeni" (IP/MAC modelden)
- [x] Durum + "Yeni" (dağıtılamaz → atama engeli BE)
- [x] Varsayılan konum: üst + alt + "Yeni"
- [x] Talep edilebilir → kategori (`requestable` + mail)
- [x] Talep maili: bilgiislem@anabilim.k12.tr
- [x] Listeden zimmet kısayolu + detayda tam akış
- [x] Kullanımdaki cihaz: atama engeli (BE validation)
- [x] Hazır cihaz: zimmetle butonu (canAssign)

---

## Backend / veri (gerekince)

- [x] Kategori modeli güncelle (parent kaldır, tip ekle)
- [ ] Konum: üst / alt hiyerarşi
- [ ] Model ve durum tabloları/API
- [ ] Migration’lar

---

## Sonra konuşulacaklar

- Ürün kodu = barkod mu?
- Web mi mobil mi önce?
- Resim depolama nasıl?
