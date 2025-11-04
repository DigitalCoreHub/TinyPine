<div align="center">
  <img src="favicon.svg" alt="TinyPine.js" width="100" height="100">

# TinyPine.js

**Minimal reactive micro-framework**

Zero build · Zero config · Just write HTML

[![Version](https://img.shields.io/badge/version-v1.4.0-blue.svg)](https://github.com/DigitalCoreHub/TinyPine)
[![Size](https://img.shields.io/badge/size-42KB-blue.svg)](https://unpkg.com/tinypine@1.4.0)
[![Tests](https://img.shields.io/badge/tests-107%20passing-green.svg)](https://github.com/DigitalCoreHub/TinyPine)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)</div>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [CLI Tool](#-cli-tool-v110)
- [What's New](#-whats-new)
    - [Core Stability (v1.3.0)](#-core-stability-v130)
    - [TinyPine UI (v1.2.0)](#-tinypine-ui-v120)
    - [Component Lifecycle (v1.1.2+)](#-component-lifecycle-v112)
    - [Sprout.js Readiness (v1.1.1)](#-sproutjs-readiness-v111)
- [Core Features](#-core-features)
- [Directives](#-directives)
- [Examples](#-examples)
- [Advanced Features](#-advanced-features)
- [Installation](#-installation)
- [API Reference](#-api-reference)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## ⚡ Quick Start

### CDN (Easiest)

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

        <script src="https://unpkg.com/tinypine@1.4.0/dist/tinypine.min.js"></script>
        <script>
            TinyPine.init();
        </script>
    </body>
</html>
```

### NPM

```bash
npm install tinypine
```

```js
import TinyPine from "tinypine";
TinyPine.init();
```

---

## 🚀 CLI Tool (v1.1.0)

Create TinyPine projects in seconds:

```bash
# Create a new project
npx tinypine-cli new myapp

# Start development server
cd myapp && npx tinypine-cli serve

# Add features (router, i18n, ui)
npx tinypine-cli add router
npx tinypine-cli add i18n
npx tinypine-cli add ui

# Build for production
npx tinypine-cli build
```

**Features:**

- 🎨 Templates: Vanilla, Tailwind, SPA, SSR, UI Ready
- 🔌 Modular add-ons: router, i18n, ui, devtools
- ⚡ Vite dev/build integration

[Learn more →](packages/cli/README.md)

---

## ✨ What's New

### � Async Flow & Forms (v1.4.0)

Powerful async operations and comprehensive form validation:

**Enhanced t-fetch with Debounce:**

```html
<div t-data="{ search: '', results: [] }">
    <!-- Debounce fetch requests -->
    <button
        t-fetch="'/api/search?q=' + search"
        debounce="500"
        method="POST"
        headers="{ 'Authorization': 'Bearer ' + token }"
    >
        Search
    </button>

    <!-- Lifecycle hooks -->
    <script>
        TinyPine.context({
            beforeFetch: async ({ url, method }) => {
                console.log("Starting request:", url);
                return true; // or false to cancel
            },
            afterFetch: ({ data }) => {
                console.log("Received:", data);
            },
        });
    </script>
</div>
```

**Form Validation System:**

```html
<tp-form>
    <div t-data="{ email: '', password: '' }">
        <!-- Built-in validators -->
        <input t-model="email" t-validate="required|email" name="email" />

        <input
            t-model="password"
            t-validate="required|minLength:8"
            name="password"
            type="password"
        />

        <!-- Show validation errors -->
        <p t-show="$errors.email" t-text="$errors.email[0]?.message"></p>

        <!-- Disable submit if invalid -->
        <button type="submit" :disabled="$invalid">Submit</button>
    </div>
</tp-form>
```

**Debounced Inputs:**

```html
<div t-data="{ searchQuery: '' }">
    <!-- Update state after 300ms of inactivity -->
    <input t-model="searchQuery" t-debounce="300" />
    <p t-text="'Searching for: ' + searchQuery"></p>
</div>
```

**Built-in Validators:**

- `required` - Field must not be empty
- `email` - Valid email format
- `min:N` / `max:N` - Numeric range
- `minLength:N` / `maxLength:N` - String length
- `pattern:regex` - Custom regex pattern
- `url` - Valid URL format
- `number` - Numeric value
- `integer` - Whole number

**Form State Variables:**

- `$errors` - Validation error messages per field
- `$valid` / `$invalid` - Overall form validity
- `$touched` - Fields that have been focused
- `$dirty` - Fields that have been modified
- `$pending` - Async operations in progress

### �🔒 Core Stability (v1.3.0)

Enhanced security and developer experience with powerful new features:

**Safe Expression Evaluator:**

```html
<!-- Multiple statements with semicolons -->
<div t-data="{ count: 0 }">
    <button t-click="const doubled = count * 2; count = doubled">Double</button>
</div>

<!-- Ternary operators -->
<p t-text="count > 10 ? 'High' : 'Low'"></p>

<!-- Arrow functions -->
<button t-click="items.filter(x => x.active).length">Active Count</button>
```

**XSS-Protected HTML Rendering:**

```html
<div t-data="{ content: '<p>Safe HTML</p>' }">
    <!-- Automatically sanitizes dangerous tags and scripts -->
    <div t-html="content"></div>
</div>
```

**Shorthand Binding Syntax:**

```html
<!-- Use :attr instead of t-bind:attr -->
<img :src="imageUrl" :alt="imageAlt" />
<div :class="activeClass" :id="elementId"></div>
```

**Enhanced Loop Context:**

```html
<ul>
    <li t-for="item in items" t-class:first="$first" t-class:last="$last">
        <span t-text="$index + 1"></span>: <span t-text="item"></span>
    </li>
</ul>
```

**New Form Components:**

- `tp-field` - Form field wrapper with labels, validation, and error states
- `tp-input` - Text input with icons, sizes, and validation states
- `tp-checkbox` - Custom checkbox with labels
- `tp-file-upload` - Drag & drop file upload with preview

[📖 Form Components Guide →](USAGE-UI.md#-form-components-v130)

---

### 🎨 TinyPine UI (v1.2.0)

Ready-to-use Tailwind CSS components:

```html
<script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.min.js"></script>
<script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.min.js"></script>
<link
    rel="stylesheet"
    href="https://unpkg.com/tinypine@1.2.0/dist/tinypine.ui.css"
/>
<script src="https://cdn.tailwindcss.com"></script>

<div t-data="{ open: false }">
    <tp-button color="primary" size="md" icon="check">Save</tp-button>
    <tp-modal t-show="open" title="Confirm">
        <p>Are you sure?</p>
        <tp-button color="outline" t-click="open = false">Cancel</tp-button>
    </tp-modal>
    <tp-card title="User Info">
        <p>Content goes here</p>
    </tp-card>
</div>

<script>
    TinyPine.init();
</script>
```

**Available Components:**

- `tp-button` - Button with color, size, type, icon props
- `tp-modal` - Modal with title prop, auto backdrop/close
- `tp-card` - Card with title prop, Tailwind styling

**Theme Support:**

```js
TinyPine.theme = "dark"; // or 'light'
```

[📖 Complete UI Usage Guide →](USAGE-UI.md) | [📖 Türkçe Kılavuz →](USAGE-UI-TR.md)

---

### 🔄 Component Lifecycle (v1.1.2+)

#### Mount Lifecycle

Run code after a component is rendered:

```html
<div
    t-data="{
  count: 0,
  mounted(el, ctx) {
    el.classList.add('mounted');
    console.log('Component mounted!');
  }
}"
>
    <span t-text="'Count: ' + count"></span>
    <button t-click="count++">+1</button>
</div>
```

**Global mount listener:**

```js
TinyPine.onMount((el, ctx) => {
    console.log("🌱 Mounted:", el);
});
```

#### Unmount Lifecycle (v1.1.3)

Run cleanup when a component is removed:

```html
<div
    t-data="{
  count: 0,
  beforeUnmount(el, ctx) {
    console.log('About to remove...');
  },
  unmounted(el, ctx) {
    console.log('Removed!');
  }
}"
>
    <span t-text="'Count: ' + count"></span>
</div>
```

**Global unmount listener:**

```js
TinyPine.onUnmount((el, ctx) => {
    console.log("🧹 Cleaned up:", el);
});
```

Emits `component:mounted` and `component:unmounted` events via the global event bus.

---

### 🌱 Sprout.js Readiness (v1.1.1)

TinyPine v1.1.1 introduces features for educational and sandbox environments:

**Lite Mode:**

```js
TinyPine.start("#app", { mode: "lite" });
// Disables: devtools, store, router, i18n
```

**Safe Mode:**

```js
TinyPine.start("#app", { safe: true });
// Wraps all directive executions in try/catch
```

**Silent Debug:**

```js
TinyPine.debugOptions.silent = true;
// Suppresses [TinyPine] console logs
```

**Global Event Bus:**

```js
TinyPine.on("directive:click", (el, ctx) => {
    console.log("Click detected");
});
```

---

## 🎯 Core Features

- ✅ **100 Passing Tests** - Comprehensive test coverage
- 📘 **TypeScript Support** - Full type definitions included
- 🛠️ **DevTools Integration** - Live debugging & inspection
- 🌍 **i18n Ready** - Built-in internationalization
- 🔄 **Global Store** - Shared state management
- 📡 **Async Support** - t-fetch, t-await directives
- 🌐 **Router System** - Hash-based navigation
- 🎨 **Transitions** - Smooth animations built-in
- 🔌 **Plugin API** - Extensible architecture
- 📊 **Performance** - Optimized for production

---

## 📚 Directives

### Core Directives

| Directive | Description                            | Example                                |
| --------- | -------------------------------------- | -------------------------------------- |
| `t-data`  | Create reactive scope                  | `<div t-data="{ count: 0 }">`          |
| `t-text`  | Update text content                    | `<span t-text="message"></span>`       |
| `t-html`  | Update HTML content (XSS-safe, v1.3.0) | `<div t-html="content"></div>`         |
| `t-show`  | Toggle visibility (with transitions)   | `<p t-show="isVisible">Hello</p>`      |
| `t-click` | Click handlers                         | `<button t-click="count++">+</button>` |
| `t-model` | Two-way binding                        | `<input t-model="name">`               |

### List Rendering & Events

| Directive        | Description     | Example                                  |
| ---------------- | --------------- | ---------------------------------------- |
| `t-for`          | List rendering  | `<li t-for="item in items">`             |
| `.prevent/.stop` | Event modifiers | `<button t-click="save.prevent">`        |
| `t-init`         | Lifecycle hook  | `<div t-init="console.log('Mounted!')">` |

### Advanced Bindings

| Directive      | Description         | Example                           |
| -------------- | ------------------- | --------------------------------- |
| `t-bind`       | Dynamic attributes  | `<img t-bind:src="url">`          |
| `t-class`      | Conditional classes | `<div t-class:active="isActive">` |
| `t-ref`        | DOM references      | `<input t-ref="input">`           |
| `t-transition` | CSS transitions     | `<div t-transition="fade">`       |

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
<div
    t-data="{
  todos: [],
  newTodo: '',
  methods: {
    add() {
      if(this.newTodo) this.todos.push(this.newTodo);
      this.newTodo = '';
    },
    remove(i) {
      this.todos.splice(i, 1);
    }
  }
}"
>
    <input t-model="newTodo" placeholder="Add todo" />
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
<div
    t-data="{
  email: '',
  password: '',
  loggedIn: false,
  methods: {
    login() {
      this.loggedIn = true;
    }
  }
}"
>
    <div t-show="!loggedIn">
        <input t-model="email" placeholder="Email" />
        <input t-model="password" type="password" placeholder="Password" />
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
TinyPine.store("auth", { user: "Guest", loggedIn: false });
TinyPine.store("ui", { theme: "light" });

// Use in any component
<div t-data="{}">
    <span t-text="$store.auth.user"></span>
    <button t-click="$store.auth.loggedIn = true">Login</button>
</div>;
```

### Custom Plugins

```javascript
TinyPine.use({
    name: "Toast",
    init(TinyPine) {
        TinyPine.directive("toast", (el, message) => {
            alert(message);
        });
    },
});
```

### Async Data Fetching

#### Enhanced t-fetch (v1.3.0)

Fetch data from APIs with race condition control, loading/error states, and lifecycle hooks:

```html
<!-- Basic fetch with loading/error states -->
<div t-data="{ posts: [], $loading: false, $error: null }">
    <div t-fetch="'/api/posts'">
        <!-- Loading indicator -->
        <p t-show="$loading">⏳ Loading posts...</p>

        <!-- Error message -->
        <p t-show="$error" t-text="'Error: ' + $error"></p>

        <!-- Posts list -->
        <ul t-show="!$loading && !$error">
            <li t-for="post in posts">
                <h3 t-text="post.title"></h3>
            </li>
        </ul>
    </div>
</div>

<!-- Advanced: Lifecycle hooks -->
<div t-data="{ users: [] }">
    <div
        t-fetch="'/api/users'"
        @t:onFetchStart="console.log('Fetching...')"
        @t:onFetchEnd="console.log('Done!', $event.detail.data)"
        @t:onFetchError="console.error('Failed:', $event.detail.error)"
    >
        <ul>
            <li t-for="user in users" t-text="user.name"></li>
        </ul>
    </div>
</div>

<!-- Dynamic URL with reactive state -->
<div t-data="{ userId: 1, user: null }">
    <input t-model="userId" type="number" />
    <div t-fetch="'/api/users/' + userId">
        <p t-show="$loading">Loading...</p>
        <p t-text="user?.name"></p>
    </div>
</div>
```

**Features:**

- ✅ **Race Condition Control** - Automatically cancels outdated requests
- ✅ **AbortController** - Properly cancels requests when URL changes
- ✅ **State Variables** - `$loading`, `$error`, `$response` automatically managed
- ✅ **Lifecycle Events** - `t:onFetchStart`, `t:onFetchEnd`, `t:onFetchError`
- ✅ **Request Tracking** - Prevents duplicate requests for same URL

#### t-await for Promises

Handle promises with loading and error states:

```html
<div t-data="{ user: {} }">
    <div t-await="fetch('/api/user').then(r=>r.json())">
        <div t-loading="'Loading user...'">⏳ Loading...</div>
        <div t-error="'Failed to load user.'">❌ Error!</div>
        <p t-text="user?.name || ''"></p>
    </div>
</div>
```

### Hash Router

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
        default: "home",
        onChange(route) {
            console.log("Route changed →", route);
        },
    });
</script>
```

### Internationalization (i18n)

Add multi-language support:

```html
<script>
    // Setup translations
    TinyPine.i18n(
        {
            en: { greeting: "Hello World!", welcome: "Welcome!" },
            tr: { greeting: "Merhaba Dünya!", welcome: "Hoş geldiniz!" },
        },
        { default: "en", cache: true }
    );
</script>

<div t-data>
    <h1 t-text.lang="'greeting'"></h1>
    <button t-click="$lang = 'tr'">🇹🇷 Türkçe</button>
    <button t-click="$lang = 'en'">🇺🇸 English</button>
</div>
```

**Dynamic Locale Loading:**

```javascript
TinyPine.loadLocale("tr", "/lang/tr.json");
TinyPine.loadLocale("en", "/lang/en.json");
```

### Event Modifiers

```html
<button t-click="save.prevent">Prevent default</button>
<button t-click="methods.init.once">Run once</button>
<button t-click="methods.close.outside">Close on outside click</button>
```

---

## 📦 Installation

### CDN

```html
<script src="https://unpkg.com/tinypine@1.2.0/dist/tinypine.min.js"></script>
<script>
    TinyPine.init();
</script>
```

### NPM

```bash
npm install tinypine
```

**TypeScript Support:**

```typescript
import TinyPine from "tinypine";
// Full IntelliSense and type checking
```

### Testing

```bash
npm test
```

**Test Coverage:**

- ✅ 100 passing tests (8 test files)
- ✅ Core directives (t-text, t-show, t-click, t-model, t-for)
- ✅ Form components (tp-input, tp-checkbox, tp-file-upload)
- ✅ Global stores and reactivity
- ✅ Keyed list diffing (v1.3.1)
- ✅ Router and validation (v1.3.1)
- ✅ Context management and lifecycle hooks
- ✅ Edge cases and performance

[📖 Testing Guide →](docs/testing.md)

---

## ⚙️ API Reference

### Core Methods

- `TinyPine.init(root?)` - Initialize TinyPine
- `TinyPine.start(selector, opts?)` - Start with options (lite/safe mode)
- `TinyPine.store(name, data)` - Create global store
- `TinyPine.watch(path, callback)` - Watch changes
- `TinyPine.use(plugin)` - Register plugin
- `TinyPine.directive(name, handler)` - Custom directive
- `TinyPine.component(name, config)` - Register custom component
- `TinyPine.transition(name, config)` - Register transition

### Lifecycle & Events

- `TinyPine.onMount(callback)` - Global mount listener
- `TinyPine.onUnmount(callback)` - Global unmount listener
- `TinyPine.on(event, callback)` - Event listener
- `TinyPine.off(event, callback)` - Remove event listener
- `TinyPine.emit(event, ...args)` - Emit event

### Context Variables

- `$parent` - Parent scope data
- `$root` - Root scope data
- `$refs` - DOM references
- `$el` - Current element
- `$store` - Global stores
- `$lang` - Current i18n language

---

## 🎨 Styling

TinyPine works with any CSS framework:

```html
<link
    href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css"
    rel="stylesheet"
/>
<div t-data="{ count: 0 }" class="p-8">
    <button t-click="count++" class="px-4 py-2 bg-blue-500 text-white rounded">
        Count: <span t-text="count"></span>
    </button>
</div>
```

---

## 🐛 Debugging

Enable debug mode:

```javascript
TinyPine.debug = true;
// Console will show: [TinyPine] count changed → 1

// Silent mode (suppress logs)
TinyPine.debugOptions.silent = true;
```

### DevTools

Built-in developer tools panel:

```html
<script>
    TinyPine.debug = true;
    TinyPine.devtools({ position: "bottom-right", theme: "dark" });
</script>
```

**Features:**

- 📊 Live Store Inspector
- 🎯 Context Viewer
- ⏱️ Reactivity Timeline
- 📈 Performance Monitor

---

## 🌍 Browser Support

✅ Chrome 49+
✅ Firefox 18+
✅ Safari 10+
✅ Edge 49+

Works everywhere JavaScript Proxies are supported.

---

## 📈 Roadmap

- ✅ **v1.0.0** - Stable Release with TypeScript & Tests
- ✅ **v1.1.0** - CLI Tool & Ecosystem Expansion
- ✅ **v1.1.1** - Sprout.js Readiness (Lite/Safe Modes)
- ✅ **v1.1.2** - Component Mount Lifecycle
- ✅ **v1.1.3** - Component Unmount Lifecycle
- ✅ **v1.2.0** - TinyPine UI Components
- ✅ **v1.3.0** - Core Stability & Form Components
- ✅ **v1.3.1** - Keyed Diffing & Advanced Features (100% Test Coverage!)
- 🔜 **v1.4.0** - Performance Optimizations & Virtual DOM (Planned)

---

## 📚 Documentation

Comprehensive guides and best practices:

- **[Testing Guide](docs/testing.md)** - Unit testing, E2E, best practices
- **[Performance Guide](docs/performance.md)** - Optimization tips, benchmarking
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- **[Anti-Patterns](docs/anti-patterns.md)** - What to avoid and why
- **[Memory Management](docs/memory.md)** - Preventing memory leaks

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
