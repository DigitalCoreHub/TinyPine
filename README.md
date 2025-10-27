<div align="center">
  <img src="favicon.svg" alt="TinyPine.js" width="100" height="100">

  # TinyPine.js

  **Minimal reactive micro-framework**

  Zero build · Zero config · Just write HTML

  [![Version](https://img.shields.io/badge/version-v0.8.0-blue.svg)](https://github.com/DigitalCoreHub/TinyPine)
  [![Size](https://img.shields.io/badge/size-15KB-blue.svg)](https://unpkg.com/tinypine)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

---

## 🌟 Why TinyPine?

TinyPine is the **simplest** way to build reactive interfaces. No build tools, no transpilation, no configuration. Just add a script tag and start coding.

**Perfect for:**
- 🎨 **Quick prototypes** - Get started in seconds
- 📱 **Interactive UIs** - Smooth, reactive interfaces
- 🚀 **Lightweight apps** - Only 15KB minified
- 🎓 **Learning** - Understand reactivity from the ground up

---

## ⚡ Quick Start

Add one script tag and you're ready:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div t-data="{ message: 'Hello TinyPine!' }">
    <h1 t-text="message"></h1>
    <button t-click="message = 'Clicked!'">Click me</button>
  </div>

  <script src="https://unpkg.com/tinypine@0.8.0/dist/tinypine.min.js"></script>
  <script>TinyPine.init();</script>
</body>
</html>
```

**That's it!** No build step. No webpack. No npm install. Just pure, reactive HTML.

---

## 📚 All Directives

### Core Directives

| Directive | Description | Example |
|-----------|-------------|---------|
| `t-data` | Create reactive scope | `<div t-data="{ count: 0 }">` |
| `t-text` | Update text content | `<span t-text="message"></span>` |
| `t-show` | Toggle visibility *(with smooth transitions)* | `<p t-show="isVisible">Hello</p>` |
| `t-click` | Click handlers | `<button t-click="count++">+</button>` |
| `t-model` | Two-way binding | `<input t-model="name">` |

### List & Events

| Directive | Description | Example |
|-----------|-------------|---------|
| `t-for` | List rendering | `<li t-for="item in items">` |
| `.prevent/.stop` | Event modifiers | `<button t-click="save.prevent">` |
| `t-init` | Lifecycle hook | `<div t-init="console.log('Mounted!')">` |

### Bindings & Refs

| Directive | Description | Example |
|-----------|-------------|---------|
| `t-bind` | Dynamic attributes | `<img t-bind:src="url">` |
| `t-class` | Conditional classes | `<div t-class:active="isActive">` |
| `t-ref` | DOM references | `<input t-ref="input">` |
| `t-transition` | CSS transitions | `<div t-transition="fade">` |

---

## 🎯 Examples

### Counter App

```html
<div t-data="{ count: 0 }">
  <button t-click="count--">-</button>
  <span t-text="count"></span>
  <button t-click="count++">+</button>
</div>
```

### Todo List

```html
<div t-data="{
  todos: [],
  newTodo: '',
  methods: {
    add() { if(this.newTodo) this.todos.push(this.newTodo); this.newTodo = ''; },
    remove(i) { this.todos.splice(i, 1); }
  }
}">
  <input t-model="newTodo" placeholder="Add todo">
  <button t-click="methods.add()">Add</button>

  <ul>
    <li t-for="(todo, i) in todos">
      <span t-text="todo"></span>
      <button t-click="methods.remove(i)">Remove</button>
    </li>
  </ul>
</div>
```

### Login Form

```html
<div t-data="{ email: '', password: '', loggedIn: false, methods: { login() { this.loggedIn = true; } } }">
  <div t-show="!loggedIn">
    <input t-model="email" placeholder="Email">
    <input t-model="password" type="password" placeholder="Password">
    <button t-click="methods.login()">Login</button>
  </div>

  <div t-show="loggedIn">
    <p t-text="'Welcome, ' + email"></p>
  </div>
</div>
```

---

## 🔧 Advanced Features

### Global Store

Create shared state across components:

```javascript
// Create stores
TinyPine.store('auth', { user: 'Guest', loggedIn: false });
TinyPine.store('ui', { theme: 'light' });

// Use in any component
<div t-data="{}">
  <span t-text="$store.auth.user"></span>
  <button t-click="$store.auth.loggedIn = true">Login</button>
</div>
```

### Lifecycle Hooks

```html
<div t-data="{ count: 0 }"
     t-init="console.log('Mounted!')"
     t-destroy="console.log('Unmounted!')">
  <!-- content -->
</div>
```

### Custom Plugins

```javascript
TinyPine.use({
  name: 'Toast',
  init(TinyPine) {
    TinyPine.directive('toast', (el, message) => {
      alert(message);
    });
  }
});
```

```html
<button t-click="methods.show()">Show Toast</button>
```

### Event Modifiers

```html
<button t-click="save.prevent">Prevent default</button>
<button t-click="methods.init.once">Run once</button>
<button t-click="methods.close.outside">Close on outside click</button>
```

### Async Data Fetching (v0.7.0)

Fetch data from APIs and handle loading/error states:

```html
<!-- Fetch and auto-update -->
<div t-data="{ posts: [] }" t-fetch="'/api/posts'">
  <ul>
    <li t-for="post in posts">
      <h3 t-text="post.title"></h3>
    </li>
  </ul>
</div>

<!-- Await with loading and error states -->
<div t-data="{ user: null }">
  <div t-await="fetch('/api/user').then(r=>r.json())">
    <div t-loading="'Loading user...'">⏳ Loading...</div>
    <div t-error="'Failed to load user.'">❌ Error!</div>
    <p t-text="user.name"></p>
  </div>
</div>
```

### Hash Router (v0.7.0)

Build SPAs with hash-based routing:

```html
<nav>
  <a href="#/home">Home</a>
  <a href="#/about">About</a>
</nav>

<div t-route="'home'">🏠 Home Page</div>
<div t-route="'about'">ℹ️ About Page</div>

<script>
TinyPine.router({
  default: 'home',
  onChange(route) {
    console.log('Route changed →', route);
  }
});
</script>
```

### Cache System (v0.7.0)

Cache API responses to avoid redundant requests:

```javascript
const cache = TinyPine.cache();
cache.set('key', 'value');
const data = cache.get('key');
```

### Internationalization (v0.8.0)

Add multi-language support with reactive translations:

```html
<script>
// Setup translations
TinyPine.i18n({
  en: { greeting: 'Hello World!', welcome: 'Welcome!' },
  tr: { greeting: 'Merhaba Dünya!', welcome: 'Hoş geldiniz!' }
}, { default: 'en', cache: true });
</script>

<div t-data>
  <h1 t-text.lang="'greeting'"></h1>
  <button t-click="$lang = 'tr'">🇹🇷 Türkçe</button>
  <button t-click="$lang = 'en'">🇺🇸 English</button>
</div>
```

**Dynamic Locale Loading:**

```javascript
// Load from JSON files
TinyPine.loadLocale('tr', '/lang/tr.json');
TinyPine.loadLocale('en', '/lang/en.json');
```

---

## 📦 Installation

### CDN (Recommended)

```html
<script src="https://unpkg.com/tinypine@0.8.0/dist/tinypine.min.js"></script>
<script>TinyPine.init();</script>
```

### NPM

```bash
npm install tinypine
```

### Download

[Download from GitHub Releases](https://github.com/DigitalCoreHub/TinyPine/releases)

---

## 🎨 Styling

TinyPine works with any CSS framework or custom styles:

```html
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
<div t-data="{ count: 0 }" class="p-8">
  <button t-click="count++" class="px-4 py-2 bg-blue-500 text-white rounded">Count: <span t-text="count"></span></button>
</div>
```

---

## 🐛 Debugging

Enable debug mode to see all reactivity in action:

```javascript
TinyPine.debug = true;
// Console will show: [TinyPine] count changed → 1
```

---

## ⚙️ API Reference

### Core Methods

- `TinyPine.init(root?)` - Initialize TinyPine
- `TinyPine.store(name, data)` - Create global store
- `TinyPine.watch(path, callback)` - Watch changes
- `TinyPine.use(plugin)` - Register plugin
- `TinyPine.directive(name, handler)` - Custom directive
- `TinyPine.transition(name, config)` - Register transition

### Context Variables

- `$parent` - Parent scope data
- `$root` - Root scope data
- `$refs` - DOM references
- `$el` - Current element
- `$store` - Global stores

---

## 🌍 Browser Support

✅ Chrome 49+
✅ Firefox 18+
✅ Safari 10+
✅ Edge 49+

Works everywhere JavaScript Proxies are supported.

---

## 📈 Roadmap

- ✅ **v0.1.0** - Core directives
- ✅ **v0.2.0** - Contexts, methods, refs
- ✅ **v0.3.0** - t-for lists, event modifiers
- ✅ **v0.4.0** - Global store, watchers, SSR
- ✅ **v0.5.0** - Lifecycle hooks, plugins
- ✅ **v0.6.0** - Smooth transitions
- ✅ **v0.7.0** - Async fetch, router
- ✅ **v0.8.0** - Internationalization (i18n)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - Use freely in your projects!

---

<div align="center">
  Made with ❤️ by TinyPine Team

  [GitHub](https://github.com/DigitalCoreHub/TinyPine) ·
  [Issues](https://github.com/DigitalCoreHub/TinyPine/issues) ·
  [Documentation](https://github.com/DigitalCoreHub/TinyPine#readme)
</div>
