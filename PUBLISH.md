# NPM Publish Guide - TinyPine.js

## 📦 NPM'e Yayınlama Adımları

### 1. NPM Hesabı

```bash
# NPM'e login (eğer değilseniz)
npm login

# Login durumunu kontrol et
npm whoami
```

### 2. Package.json Kontrolü

```json
{
  "name": "tinypine",              // Package adı (kontrol edin unique olmalı)
  "version": "0.1.0",              // Versiyon
  "description": "...",             // Açıklama
  "main": "src/core.js",           // Entry point
  "files": ["src/", "dist/", "README.md"],  // Yayınlanacak dosyalar
  "repository": {                   // GitHub repo
    "type": "git",
    "url": "https://github.com/DigitalCoreHub/TinyPine.git"
  },
  "license": "MIT",                // License
  "keywords": [...]                 // npm search için keywords
}
```

### 3. Package Adı Kontrolü

```bash
# Package adının müsait olup olmadığını kontrol et
npm search tinypine

# Veya npmjs.com üzerinden kontrol edin
# https://www.npmjs.com/search?q=tinypine
```

Eğer "tinypine" müsait değilse, alternatifler:

- `@digitalcorehub/tinypine` (scoped package)
- `tinypine-js`
- `tinypinejs`

### 4. Build Oluşturma

```bash
# Production build oluştur
npm run build

# Dist klasöründe tinypine.min.js oluşmalı
ls -lh dist/
```

### 5. Test Publish (Dry Run)

```bash
# Gerçek publish olmadan test et
npm publish --dry-run

# Bu şunları gösterir:
# - Yayınlanacak dosyalar
# - Package boyutu
# - Tarball preview
```

### 6. Git Commit & Tag

```bash
# Tüm değişiklikleri commit et
git add .
git commit -m "feat: TinyPine.js v0.1.0 release"

# Git tag oluştur
git tag v0.1.0 -m "Release version 0.1.0"

# Push et
git push origin main
git push --tags
```

### 7. NPM Publish

```bash
# Production'a publish et
npm publish

# Scoped package için (@org/name):
npm publish --access public
```

### 8. Kontrol

```bash
# Package'in yayınlandığını kontrol et
npm view tinypine

# Veya web'den
https://www.npmjs.com/package/tinypine
```

## 🔄 Version Bump İçin

### Minor Update (0.1.0 -> 0.2.0)

```bash
npm version minor
git push && git push --tags
npm publish
```

### Patch Update (0.1.0 -> 0.1.1)

```bash
npm version patch
git push && git push --tags
npm publish
```

### Major Update (0.1.0 -> 1.0.0)

```bash
npm version major
git push && git push --tags
npm publish
```

## 📝 Önemli Notlar

### .npmignore Oluştur (Opsiyonel)

Eğer belirli dosyaları publish etmek istemiyorsanız:

```
.git/
node_modules/
demo/
.vscode/
*.md
!README.md
build.cjs
.gitignore
```

### README Güncelle

NPM'de kullanım örneği ekle:

````markdown
## Installation

```bash
npm install tinypine
```
````

## Usage

```html
<script src="node_modules/tinypine/dist/tinypine.min.js"></script>
```

````

## 🚨 Troubleshooting

### "You do not have permission to publish"
- NPM hesabınızın package adına sahip olduğundan emin olun
- Scoped package kullanın: `@username/tinypine`
- `npm whoami` ile login durumunuzu kontrol edin

### "Package name already taken"
- Alternatif isim deneyin
- Scoped package kullanın: `@digitalcorehub/tinypine`
- Mevcut package'i unpublish etmek için `npm unpublish` (72 saat içinde)

### Publish sonrası değişiklik
```bash
npm version patch
npm publish
````

## ✅ Checklist

- [ ] `npm run build` çalıştı
- [ ] `dist/tinypine.min.js` oluştu
- [ ] `npm publish --dry-run` hata vermedi
- [ ] Git commit & push yapıldı
- [ ] Git tag oluşturuldu
- [ ] `npm publish` başarılı
- [ ] NPM'de package görünüyor
