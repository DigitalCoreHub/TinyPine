# TinyPine UI - Usage Guide

How to add TinyPine UI components to your project:

## 🌐 CDN Usage (Recommended - Easiest)

### Add to HTML page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>

  <!-- Tailwind CSS (required) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- TinyPine UI CSS -->
  <link rel="stylesheet" href="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.css">
</head>
<body>
  <div t-data="{ open: false }">
    <tp-button color="primary" size="md" t-click="open = true">Open</tp-button>

    <tp-modal t-show="open" title="Modal Title">
      <p>Modal content</p>
      <tp-button color="outline" t-click="open = false">Close</tp-button>
    </tp-modal>

    <tp-card title="Card Title">
      <p>Card content</p>
    </tp-card>
  </div>

  <!-- TinyPine Core (load first) -->
  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.min.js"></script>

  <!-- TinyPine UI (load after) -->
  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.min.js"></script>

  <!-- Initialize TinyPine -->
  <script>TinyPine.init();</script>
</body>
</html>
```

## 📦 NPM Usage

### 1. Install:

```bash
npm install tinypine
```

### 2. Import in JavaScript:

```js
// ESM
import TinyPine from 'tinypine';
import 'tinypine/dist/tinypine.ui.min.js';
import 'tinypine/dist/tinypine.ui.css';

// Or CSS in separate file
// <link rel="stylesheet" href="node_modules/tinypine/dist/tinypine.ui.css">
```

### 3. Use in HTML:

```html
<div t-data="{ count: 0 }">
  <tp-button color="primary" size="md" t-click="count++">
    Count: <span t-text="count"></span>
  </tp-button>
</div>

<script>
TinyPine.init();
</script>
```

## 🎨 Component Usage

### tp-button

```html
<!-- Basic usage -->
<tp-button color="primary" size="md">Save</tp-button>

<!-- Colors -->
<tp-button color="primary">Primary</tp-button>
<tp-button color="success">Success</tp-button>
<tp-button color="danger">Danger</tp-button>
<tp-button color="outline">Outline</tp-button>
<tp-button color="ghost">Ghost</tp-button>

<!-- Sizes -->
<tp-button size="sm">Small</tp-button>
<tp-button size="md">Medium</tp-button>
<tp-button size="lg">Large</tp-button>

<!-- With icon -->
<tp-button color="primary" icon="check">Save</tp-button>
<tp-button color="success" icon="plus">Add</tp-button>

<!-- With TinyPine directives -->
<tp-button color="danger" t-click="delete()">Delete</tp-button>
```

### tp-modal

```html
<div t-data="{ showModal: false }">
  <tp-button t-click="showModal = true">Open Modal</tp-button>

  <tp-modal t-show="showModal" title="Modal Title">
    <p>Modal content here</p>
    <tp-button t-click="showModal = false">Close</tp-button>
  </tp-modal>
</div>
```

### tp-card

```html
<tp-card title="Card Title">
  <p>Card content</p>
</tp-card>

<!-- Without title -->
<tp-card>
  <p>Just content</p>
</tp-card>
```

---

## 📝 Form Components (v1.3.0)

### tp-field

Field wrapper component for adding labels, helper text, and error messages.

**Props:**
- `label` - Label text
- `helper` - Helper text displayed below input
- `error` - Error message (replaces helper text)
- `required` - Shows red asterisk (*)

```html
<!-- Basic usage -->
<tp-field label="Email Address">
  <tp-input type="email" placeholder="you@example.com"></tp-input>
</tp-field>

<!-- With helper text -->
<tp-field label="Password" helper="Must be at least 8 characters">
  <tp-input type="password"></tp-input>
</tp-field>

<!-- Required field -->
<tp-field label="Full Name" required>
  <tp-input placeholder="John Doe"></tp-input>
</tp-field>

<!-- With error -->
<tp-field label="Email" error="Invalid email address">
  <tp-input type="email" state="error"></tp-input>
</tp-field>
```

### tp-input

Text input component with icon support and validation states.

**Props:**
- `type` - Input type (text, email, password, etc.) - default: "text"
- `size` - Size: sm, md, lg - default: "md"
- `icon` - Icon name (mail, user, lock, search, phone, calendar, location, link)
- `state` - Validation state: error, valid
- `placeholder` - Placeholder text

```html
<!-- Basic input -->
<tp-input placeholder="Enter your name"></tp-input>

<!-- With icon -->
<tp-input icon="mail" placeholder="Email"></tp-input>
<tp-input icon="lock" type="password" placeholder="Password"></tp-input>

<!-- Different sizes -->
<tp-input size="sm" placeholder="Small"></tp-input>
<tp-input size="md" placeholder="Medium"></tp-input>
<tp-input size="lg" placeholder="Large"></tp-input>

<!-- Validation states -->
<tp-input state="error" placeholder="Invalid"></tp-input>
<tp-input state="valid" placeholder="Valid"></tp-input>

<!-- With t-model -->
<div t-data="{ email: '' }">
  <tp-input icon="mail" type="email" t-model="email"></tp-input>
  <p>You typed: <span t-text="email"></span></p>
</div>
```

**Available Icons:**
- `mail` 📧 - Email
- `user` 👤 - User
- `lock` 🔒 - Password
- `search` 🔍 - Search
- `phone` 📞 - Phone
- `calendar` 📅 - Date
- `location` 📍 - Location
- `link` 🔗 - Link

### tp-checkbox

Custom checkbox component with label.

**Props:**
- `label` - Checkbox label text
- `disabled` - Disable the checkbox

```html
<!-- Basic checkbox -->
<tp-checkbox label="I agree to the terms"></tp-checkbox>

<!-- Disabled -->
<tp-checkbox label="Disabled option" disabled></tp-checkbox>

<!-- With t-model -->
<div t-data="{ agree: false }">
  <tp-checkbox label="I agree" t-model="agree"></tp-checkbox>
  <p>Agreed: <span t-text="agree ? 'Yes' : 'No'"></span></p>
</div>

<!-- Multiple checkboxes -->
<div t-data="{ options: { newsletter: false, updates: false } }">
  <tp-checkbox label="Newsletter" t-model="options.newsletter"></tp-checkbox>
  <tp-checkbox label="Updates" t-model="options.updates"></tp-checkbox>
</div>
```

### tp-file-upload

Drag & drop file upload with image preview.

**Props:**
- `accept` - File types (e.g., "image/*", ".pdf") - default: "*"
- `multiple` - Allow multiple files
- `max-size` - Max file size in MB

```html
<!-- Basic upload -->
<tp-file-upload></tp-file-upload>

<!-- Image only -->
<tp-file-upload accept="image/*"></tp-file-upload>

<!-- Multiple files -->
<tp-file-upload accept="image/*" multiple></tp-file-upload>

<!-- With size limit -->
<tp-file-upload accept="image/*" max-size="5"></tp-file-upload>

<!-- With t-model -->
<div t-data="{ file: null }">
  <tp-file-upload accept="image/*" t-model="file"></tp-file-upload>
</div>
```

**Features:**
- ✅ Click to upload
- ✅ Drag & drop support
- ✅ Image preview
- ✅ File size validation
- ✅ Visual feedback

### Complete Form Example

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
  <!-- Name Field -->
  <tp-field label="Full Name" helper="Enter your full name" required>
    <tp-input icon="user" placeholder="John Doe" t-model="form.name"></tp-input>
  </tp-field>

  <!-- Email Field -->
  <tp-field label="Email" helper="We'll never share your email">
    <tp-input icon="mail" type="email" placeholder="hello@example.com" t-model="form.email"></tp-input>
  </tp-field>

  <!-- Password Field -->
  <tp-field label="Password" helper="Must be at least 8 characters">
    <tp-input icon="lock" type="password" placeholder="••••••••" t-model="form.password"></tp-input>
  </tp-field>

  <!-- Terms Checkbox -->
  <div class="mb-4">
    <tp-checkbox label="I agree to the terms" t-model="form.agree"></tp-checkbox>
  </div>

  <!-- Avatar Upload -->
  <tp-field label="Profile Picture">
    <tp-file-upload accept="image/*" max-size="5" t-model="form.avatar"></tp-file-upload>
  </tp-field>

  <!-- Submit Button -->
  <tp-button color="success" size="md" class="w-full mt-4">
    Create Account
  </tp-button>
</div>
```

---

## 🌓 Theme Usage

```js
// Light mode (default)
TinyPine.theme = 'light';

// Dark mode
TinyPine.theme = 'dark';

// Event listener
TinyPine.on('theme:changed', (theme) => {
  console.log('Theme changed:', theme);
});
```

## 🧩 Creating Custom Components

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

Usage:

```html
<tp-custom title="Custom Component" color="purple">
  <p>Content</p>
</tp-custom>
```

## ⚠️ Important Notes

1. **Order matters:**
   - First `tinypine.min.js`
   - Then `tinypine.ui.min.js`
   - CSS file in `<head>`

2. **Tailwind CSS required:**
   - Components use Tailwind CSS classes
   - CDN: `<script src="https://cdn.tailwindcss.com"></script>`
   - Or use your own Tailwind build

3. **Custom classes:**
   ```html
   <!-- You can add your own classes -->
   <tp-button color="primary" class="my-custom-class">Button</tp-button>
   ```

## 🚀 Example Project

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TinyPine UI App</title>
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
    <h1 class="text-3xl font-bold mb-6">TinyPine UI Example</h1>

    <tp-button color="primary" size="lg" icon="plus" t-click="methods.openModal()">
      Add New User
    </tp-button>

    <tp-modal t-show="showModal" title="New User">
      <p class="mb-4">Form will go here</p>
      <div class="flex gap-3">
        <tp-button color="primary" t-click="methods.closeModal()">Save</tp-button>
        <tp-button color="outline" t-click="methods.closeModal()">Cancel</tp-button>
      </div>
    </tp-modal>

    <div class="mt-6 grid md:grid-cols-2 gap-4">
      <tp-card title="Users">
        <p t-text="'Total: ' + users.length"></p>
      </tp-card>
    </div>
  </div>

  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.min.js"></script>
  <script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.min.js"></script>
  <script>TinyPine.init();</script>
</body>
</html>
```

## 📚 More Information

- [Main README](README.md)
- [GitHub](https://github.com/DigitalCoreHub/TinyPine)
- [NPM Package](https://www.npmjs.com/package/tinypine)
