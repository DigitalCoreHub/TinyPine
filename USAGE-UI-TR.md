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

