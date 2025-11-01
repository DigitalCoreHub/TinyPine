# TinyPine UI - Kullanım Kılavuzu

TinyPine UI component'lerini projenize eklemenin yolları:

## 🌐 CDN ile Kullanım (Önerilen - En Kolay)

### HTML sayfasına ekle:

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Uygulamam</title>

  <!-- Tailwind CSS (gerekli) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- TinyPine UI CSS -->
  <link rel="stylesheet" href="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.css">
</head>
<body>
  <div t-data="{ open: false }">
    <tp-button color="primary" size="md" t-click="open = true">Aç</tp-button>

    <tp-modal t-show="open" title="Modal Başlık">
      <p>Modal içeriği</p>
      <tp-button color="outline" t-click="open = false">Kapat</tp-button>
    </tp-modal>

    <tp-card title="Kart Başlık">
      <p>Kart içeriği</p>
    </tp-card>
  </div>

  <!-- TinyPine Core (önce yükle) -->
  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.min.js"></script>

  <!-- TinyPine UI (sonra yükle) -->
  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.min.js"></script>

  <!-- TinyPine'i başlat -->
  <script>TinyPine.init();</script>
</body>
</html>
```

## 📦 NPM ile Kullanım

### 1. Kurulum:

```bash
npm install tinypine
```

### 2. JavaScript'te import:

```js
// ESM
import TinyPine from 'tinypine';
import 'tinypine/dist/tinypine.ui.min.js';
import 'tinypine/dist/tinypine.ui.css';

// veya CSS ayrı dosyada
// <link rel="stylesheet" href="node_modules/tinypine/dist/tinypine.ui.css">
```

### 3. HTML'de kullan:

```html
<div t-data="{ count: 0 }">
  <tp-button color="primary" size="md" t-click="count++">
    Sayı: <span t-text="count"></span>
  </tp-button>
</div>

<script>
TinyPine.init();
</script>
```

## 🎨 Component Kullanımı

### tp-button

```html
<!-- Temel kullanım -->
<tp-button color="primary" size="md">Kaydet</tp-button>

<!-- Renkler -->
<tp-button color="primary">Primary</tp-button>
<tp-button color="success">Success</tp-button>
<tp-button color="danger">Danger</tp-button>
<tp-button color="outline">Outline</tp-button>
<tp-button color="ghost">Ghost</tp-button>

<!-- Boyutlar -->
<tp-button size="sm">Küçük</tp-button>
<tp-button size="md">Orta</tp-button>
<tp-button size="lg">Büyük</tp-button>

<!-- Icon ile -->
<tp-button color="primary" icon="check">Kaydet</tp-button>
<tp-button color="success" icon="plus">Ekle</tp-button>

<!-- TinyPine direktifleri ile -->
<tp-button color="danger" t-click="delete()">Sil</tp-button>
```

### tp-modal

```html
<div t-data="{ showModal: false }">
  <tp-button t-click="showModal = true">Modal Aç</tp-button>

  <tp-modal t-show="showModal" title="Modal Başlık">
    <p>Modal içeriği buraya</p>
    <tp-button t-click="showModal = false">Kapat</tp-button>
  </tp-modal>
</div>
```

### tp-card

```html
<tp-card title="Kart Başlık">
  <p>Kart içeriği</p>
</tp-card>

<!-- Başlık olmadan -->
<tp-card>
  <p>Sadece içerik</p>
</tp-card>
```

---

## 📝 Form Component'leri (v1.3.0)

### tp-field

Label, yardımcı metin ve hata mesajları için form wrapper component'i.

**Props:**
- `label` - Label metni
- `helper` - Input altında görünen yardımcı metin
- `error` - Hata mesajı (helper text'in yerine geçer)
- `required` - Kırmızı yıldız (*) gösterir

```html
<!-- Temel kullanım -->
<tp-field label="E-posta Adresi">
  <tp-input type="email" placeholder="you@example.com"></tp-input>
</tp-field>

<!-- Yardımcı metin ile -->
<tp-field label="Şifre" helper="En az 8 karakter olmalı">
  <tp-input type="password"></tp-input>
</tp-field>

<!-- Zorunlu alan -->
<tp-field label="Ad Soyad" required>
  <tp-input placeholder="Ahmet Yılmaz"></tp-input>
</tp-field>

<!-- Hata mesajı ile -->
<tp-field label="E-posta" error="Geçersiz e-posta adresi">
  <tp-input type="email" state="error"></tp-input>
</tp-field>
```

### tp-input

Icon desteği ve validation state'leri olan text input component'i.

**Props:**
- `type` - Input tipi (text, email, password, vb.) - varsayılan: "text"
- `size` - Boyut: sm, md, lg - varsayılan: "md"
- `icon` - Icon adı (mail, user, lock, search, phone, calendar, location, link)
- `state` - Validation durumu: error, valid
- `placeholder` - Placeholder metni

```html
<!-- Temel input -->
<tp-input placeholder="Adınızı girin"></tp-input>

<!-- Icon ile -->
<tp-input icon="mail" placeholder="E-posta"></tp-input>
<tp-input icon="lock" type="password" placeholder="Şifre"></tp-input>

<!-- Farklı boyutlar -->
<tp-input size="sm" placeholder="Küçük"></tp-input>
<tp-input size="md" placeholder="Orta"></tp-input>
<tp-input size="lg" placeholder="Büyük"></tp-input>

<!-- Validation durumları -->
<tp-input state="error" placeholder="Geçersiz"></tp-input>
<tp-input state="valid" placeholder="Geçerli"></tp-input>

<!-- t-model ile -->
<div t-data="{ email: '' }">
  <tp-input icon="mail" type="email" t-model="email"></tp-input>
  <p>Yazdığınız: <span t-text="email"></span></p>
</div>
```

**Mevcut Icon'lar:**
- `mail` 📧 - E-posta
- `user` 👤 - Kullanıcı
- `lock` 🔒 - Şifre
- `search` 🔍 - Arama
- `phone` 📞 - Telefon
- `calendar` 📅 - Tarih
- `location` 📍 - Konum
- `link` 🔗 - Link

### tp-checkbox

Label'lı özel checkbox component'i.

**Props:**
- `label` - Checkbox label metni
- `disabled` - Checkbox'ı devre dışı bırak

```html
<!-- Temel checkbox -->
<tp-checkbox label="Şartları kabul ediyorum"></tp-checkbox>

<!-- Devre dışı -->
<tp-checkbox label="Devre dışı seçenek" disabled></tp-checkbox>

<!-- t-model ile -->
<div t-data="{ agree: false }">
  <tp-checkbox label="Kabul ediyorum" t-model="agree"></tp-checkbox>
  <p>Kabul: <span t-text="agree ? 'Evet' : 'Hayır'"></span></p>
</div>

<!-- Birden fazla checkbox -->
<div t-data="{ options: { newsletter: false, updates: false } }">
  <tp-checkbox label="Haber Bülteni" t-model="options.newsletter"></tp-checkbox>
  <tp-checkbox label="Güncellemeler" t-model="options.updates"></tp-checkbox>
</div>
```

### tp-file-upload

Resim önizlemeli drag & drop dosya yükleme component'i.

**Props:**
- `accept` - Dosya tipleri (örn: "image/*", ".pdf") - varsayılan: "*"
- `multiple` - Birden fazla dosyaya izin ver
- `max-size` - Maksimum dosya boyutu (MB)

```html
<!-- Temel yükleme -->
<tp-file-upload></tp-file-upload>

<!-- Sadece resim -->
<tp-file-upload accept="image/*"></tp-file-upload>

<!-- Birden fazla dosya -->
<tp-file-upload accept="image/*" multiple></tp-file-upload>

<!-- Boyut limiti ile -->
<tp-file-upload accept="image/*" max-size="5"></tp-file-upload>

<!-- t-model ile -->
<div t-data="{ file: null }">
  <tp-file-upload accept="image/*" t-model="file"></tp-file-upload>
</div>
```

**Özellikler:**
- ✅ Tıkla ve yükle
- ✅ Drag & drop desteği
- ✅ Resim önizleme
- ✅ Dosya boyutu doğrulama
- ✅ Görsel geri bildirim

### Komple Form Örneği

```html
<div t-data="{
  form: {
    name: '',
    email: '',
    password: '',
    agree: false,
    avatar: null
  }
}">
  <!-- Ad Soyad Alanı -->
  <tp-field label="Ad Soyad" helper="Adınızı ve soyadınızı girin" required>
    <tp-input icon="user" placeholder="Ahmet Yılmaz" t-model="form.name"></tp-input>
  </tp-field>

  <!-- E-posta Alanı -->
  <tp-field label="E-posta" helper="E-postanızı kimseyle paylaşmayacağız">
    <tp-input icon="mail" type="email" placeholder="ornek@mail.com" t-model="form.email"></tp-input>
  </tp-field>

  <!-- Şifre Alanı -->
  <tp-field label="Şifre" helper="En az 8 karakter olmalı">
    <tp-input icon="lock" type="password" placeholder="••••••••" t-model="form.password"></tp-input>
  </tp-field>

  <!-- Şartlar Checkbox -->
  <div class="mb-4">
    <tp-checkbox label="Şartları kabul ediyorum" t-model="form.agree"></tp-checkbox>
  </div>

  <!-- Profil Resmi Yükleme -->
  <tp-field label="Profil Resmi">
    <tp-file-upload accept="image/*" max-size="5" t-model="form.avatar"></tp-file-upload>
  </tp-field>

  <!-- Gönder Butonu -->
  <tp-button color="success" size="md" class="w-full mt-4">
    Hesap Oluştur
  </tp-button>
</div>
```

---

## 🌓 Theme Kullanımı

```js
// Light mode (varsayılan)
TinyPine.theme = 'light';

// Dark mode
TinyPine.theme = 'dark';

// Event listener
TinyPine.on('theme:changed', (theme) => {
  console.log('Theme değişti:', theme);
});
```

## 🧩 Özel Component Oluşturma

```js
TinyPine.component('tp-custom', {
  mounted(el) {
    const title = el.getAttribute('title') || '';
    const color = el.getAttribute('color') || 'blue';

    el.className = `tp-custom bg-${color}-100 p-4 rounded-lg`;

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'text-lg font-bold mb-2';
      titleEl.textContent = title;
      el.insertBefore(titleEl, el.firstChild);
    }
  }
});
```

Kullanım:

```html
<tp-custom title="Özel Component" color="purple">
  <p>İçerik</p>
</tp-custom>
```

## ⚠️ Önemli Notlar

1. **Sıralama önemli:**
   - Önce `tinypine.min.js`
   - Sonra `tinypine.ui.min.js`
   - CSS dosyası `<head>` içinde

2. **Tailwind CSS gerekli:**
   - Component'ler Tailwind CSS class'larını kullanır
   - CDN: `<script src="https://cdn.tailwindcss.com"></script>`
   - veya kendi Tailwind build'inizi kullanın

3. **Özel class'lar:**
   ```html
   <!-- Kendi class'larınızı ekleyebilirsiniz -->
   <tp-button color="primary" class="my-custom-class">Button</tp-button>
   ```

## 🚀 Örnek Proje

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>TinyPine UI Uygulama</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.css">
</head>
<body class="p-8">
  <div t-data="{
    users: [],
    showModal: false,
    methods: {
      openModal() { this.showModal = true; },
      closeModal() { this.showModal = false; }
    }
  }">
    <h1 class="text-3xl font-bold mb-6">TinyPine UI Örnek</h1>

    <tp-button color="primary" size="lg" icon="plus" t-click="methods.openModal()">
      Yeni Kullanıcı Ekle
    </tp-button>

    <tp-modal t-show="showModal" title="Yeni Kullanıcı">
      <p class="mb-4">Form buraya gelecek</p>
      <div class="flex gap-3">
        <tp-button color="primary" t-click="methods.closeModal()">Kaydet</tp-button>
        <tp-button color="outline" t-click="methods.closeModal()">İptal</tp-button>
      </div>
    </tp-modal>

    <div class="mt-6 grid md:grid-cols-2 gap-4">
      <tp-card title="Kullanıcılar">
        <p t-text="'Toplam: ' + users.length"></p>
      </tp-card>
    </div>
  </div>

  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.min.js"></script>
  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.min.js"></script>
  <script>TinyPine.init();</script>
</body>
</html>
```

## 📚 Daha Fazla Bilgi

- [Ana README](README.md)
- [GitHub](https://github.com/DigitalCoreHub/TinyPine)
- [NPM Paketi](https://www.npmjs.com/package/tinypine)

