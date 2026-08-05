**Route:** `/users/create`
**Parent:** ZW-55
**Etiket:** MOBILE

## Özet
Yeni sistem kullanıcısı oluşturma formu. Temel kimlik bilgileri, opsiyonel yönetici seçimi (Headless UI Combobox) ve çoklu rol ataması içerir. Başarıda `/users` listesine success mesajı ile döner.

## Route & Security
| Özellik | Değer |
|---------|-------|
| Path | `/users/create` |
| Koruma | `PrivateRoute` |
| Menü | Sistem → (yetkili kullanıcılar) |
| CapabilityRoute | Yok |

## Sayfa tipi
**Create form sayfası**

## Amaç / özellikler
- Yeni kullanıcı kaydı
- Aktif rollerden çoklu seçim
- Aktif kullanıcılardan yönetici atama (autocomplete combobox)
- İptal / Kaydet aksiyonları

## Form alanları

### email
| Özellik | Değer |
|---------|-------|
| name | `email` |
| Tip | email input |
| Label | Email |
| Placeholder | ornek@anabilim.com |
| Required | Evet (HTML + form submit) |
| Validation | HTML5 email |
| Disabled | Submit loading sırasında buton disabled |

### firstName
| Ad | `firstName` |
| Tip | text |
| Label | Ad |
| Required | Evet |

### lastName
| Ad | `lastName` |
| Tip | text |
| Label | Soyad |
| Required | Evet |

### phone
| Ad | `phone` |
| Tip | tel |
| Label | Telefon |
| Placeholder | +90555123456 |
| Required | Evet |

### department
| Ad | `department` |
| Tip | text |
| Label | Departman |
| Placeholder | IT, Finans, İK vb. |
| Required | Evet |

### position
| Ad | `position` |
| Tip | text |
| Label | Pozisyon |
| Placeholder | Yazılım Geliştirici, Muhasebe Uzmanı vb. |
| Required | Evet |

### manager (Yönetici — Combobox)
| Özellik | Değer |
|---------|-------|
| State field | `formData.manager?: { id: number }` |
| Tip | Headless UI `Combobox` + arama input |
| Label | Yönetici |
| Placeholder | Yönetici ara... |
| Required | **Hayır** (HTML required yok) |
| Validation | Seçim yapılırsa `{ id: manager.id }` set edilir |
| Options | `managers` — `userService.getActiveUsers()` |
| Filtre | `managerQuery` → ad/soyad veya email substring |
| displayValue | `{firstName} {lastName}` |
| Option render | `{firstName} {lastName} ({email})` |
| Empty search | "Sonuç bulunamadı." |
| Disabled | — |
| afterLeave | query temizlenir |

### roles
| Özellik | Değer |
|---------|-------|
| name | `roles` |
| Tip | `<select multiple>` |
| Label | Roller |
| Required | Evet (HTML `required` — en az 1 seçim) |
| Options | `availableRoles` — `roleService.getActiveRoles()` → `role.name` |
| Validation | `Array.from(selectedOptions)` |
| Yardım metni | Ctrl/Command ile çoklu seçim |
| Disabled | — |

**Initial formData:**
```typescript
{ email: '', firstName: '', lastName: '', department: '', position: '', phone: '', roles: [] }
```

## Tablo kolonları
Yok.

## Filtreler / arama
Yalnızca yönetici Combobox içi arama (`managerQuery`).

## Butonlar & aksiyonlar

| Buton | Tip | Metin | Aksiyon |
|-------|-----|-------|---------|
| İptal | button | İptal | `navigate('/users')` |
| Kaydet | submit | Kaydet / Kaydediliyor... | `userService.createUser(formData)` → `/users` + success state |

## Modallar
Yok.

## API'ler

**Mount (paralel):**

| Servis method | HTTP |
|---------------|------|
| `roleService.getActiveRoles()` | GET `/api/roles/active` |
| `userService.getActiveUsers()` | GET `/api/users/active` |

**Submit:**

| Servis method | HTTP | Body |
|---------------|------|------|
| `userService.createUser(formData)` | POST `/api/users` | `CreateUserRequest`: email, firstName, lastName, department, position, phone, roles[], manager? |

## Navigasyon
| Aksiyon | Hedef |
|---------|-------|
| İptal | `/users` |
| Başarılı kayıt | `/users` state `{ message: 'Kullanıcı başarıyla oluşturuldu!' }` |

## Edge cases / koşullu UI
- Initial data load hatası → error banner "Veriler yüklenirken hata oluştu", roles/managers boş
- `getActiveUsers` fail → managers `[]`, console error
- Submit hatası → "Kullanıcı oluşturulurken hata oluştu" (backend mesajı loglanır, UI generic)
- Loading submit: Kaydet disabled + opacity
- Grid: 1 kolon mobil, 2 kolon md+
- UserCreate'te **schoolId, work location yok** (yalnızca UserEdit'te)

## Mobil notlar
- `<select multiple>` mobilde kötü UX — checkbox list veya multi-select bottom sheet kullanılmalı
- Headless UI Combobox → React Native'de searchable picker / autocomplete modal
- Ctrl+Command yardım metni mobilde anlamsız — multi-tap chip selection
- Form uzun — `KeyboardAvoidingView` + scroll
- Telefon alanı: `type="tel"`, uluslararası format mask düşünülebilir
- Yönetici opsiyonel — mobilde "Yönetici seç (opsiyonel)" label net olmalı
- POST sonrası listeye dönüş — stack'te back yerine replace önerilir

---