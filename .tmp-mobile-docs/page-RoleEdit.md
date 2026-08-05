## Özet
Mevcut rolü düzenleme; temel bilgiler, ayarlar, permission yönetimi ve salt okunur rol meta bilgileri. Permission diff'i create sonrası add/remove ile uygulanır.

## Route & Security
- **Route:** `/roles/edit/:id`
- **Koruma:** `PrivateRoute`
- **Nav:** Sistem → Roller → kart Düzenle; `SYSTEM_MANAGE` (nav)

## Sayfa Tipi
Düzenleme formu

## Amaç
Var olan rolün adını, görünen adını, açıklamasını, aktiflik/sistem rolü bayraklarını ve permission setini güncellemek.

## Form Alanları

### Temel Bilgiler (RoleCreate ile aynı validasyon)
| Alan | Validasyon |
|------|------------|
| `name` | Zorunlu, `^[A-Z_]+$`, submit'te uppercase |
| `displayName` | Zorunlu |
| `description` | Zorunlu |

### Rol Ayarları
| Alan | Not |
|------|-----|
| `isActive` | Checkbox |
| `isSystemRole` | Checkbox; **`disabled` if `originalData.isSystemRole`** — mevcut sistem rolü bayrağı değiştirilemez |

### İşlem Yetkileri (özet)
RoleCreate ile aynı 10 `OPERATION_LABELS` checkbox

### Tüm Permission'lar
- Katalog gruplu checkbox'lar
- **Ek bölüm:** "Rolde var, katalogda yok (eski / silinmiş tanım)" — orphan permission'lar amber uyarı ile listelenir

### Salt Okunur — Rol Bilgileri kartı
- Oluşturulma Tarihi (`createdAt`, tr-TR)
- Son Güncelleme (`updatedAt`, tr-TR)
- Mevcut İzinler (badge listesi — yükleme anındaki orijinal veri)

## Tablo Sütunları
Yok

## Filtreler
Yok

## Butonlar
| Buton | Aksiyon |
|-------|---------|
| **İptal** | Temel alan değişikliği varsa confirm → `/roles` |
| **Kaydet** | update + permission diff → `/roles` |
| **← Rol listesine dön** | Yükleme hatası ekranında |

Loading: tam sayfa spinner. Saving: Kaydet disabled + "Kaydediliyor..."

## Modallar
Yok. İptal: `window.confirm`

## API'ler

### `role.service`
| Metod | Endpoint |
|-------|----------|
| `getRoleById(id)` | `GET /api/roles/{id}` |
| `updateRole(id, data)` | `PUT /api/roles/{id}` |
| `addPermissionToRole(id, name)` | `POST .../permissions?permissionName=` |
| `removePermissionFromRole(id, name)` | `DELETE .../permissions?permissionName=` |

### `permission.service`
| Metod | Endpoint |
|-------|----------|
| `getAllPermissions()` | `GET /api/permissions` |

## Navigasyon
- **Giriş:** `/roles/edit/:id` (id route param)
- **Başarı:** `/roles` + `'Rol başarıyla güncellendi!'`
- Geçersiz id / API hatası: hata ekranı + listeye dön linki

## Edge Case'ler
- İptal kontrolü permission değişikliklerini **kapsamaz**
- Permission add/remove hataları sessiz (`console.warn`)
- Sistem rolü checkbox'ı kilitli; metin uyarısı gösterilir
- Orphan permission'lar katalogda olmasa da checkbox ile yönetilebilir
- "Mevcut İzinler" kartı orijinal yükleme verisini gösterir; kaydetmeden güncellenmez

## Mobil Notlar
- RoleCreate ile aynı uzunluk sorunu
- Meta bilgi kartı mobilde alt bölüm olarak iyi konumlanır
- Orphan permission uyarısı mobilde dikkat çekici banner olarak kalabilir
- Loading/error full-page — mobilde skeleton tercih edilebilir

---