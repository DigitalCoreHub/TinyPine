<div align="center">
  <img src="favicon.svg" alt="TinyPine.js" width="100" height="100">

  # TinyPine.js

  **Minimal reactive micro-framework**

  Zero build · Zero config · Just write HTML

  [![Version](https://img.shields.io/badge/version-v0.4.0-blue.svg)](https://github.com/DigitalCoreHub/TinyPine)
  [![Size](https://img.shields.io/badge/size-10KB-blue.svg)](https://unpkg.com/tinypine)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

---

## Quick Start

**CDN:**
```html
<script src="https://unpkg.com/tinypine@0.4.0/dist/tinypine.min.js"></script>
<script>TinyPine.init();</script>
```

**NPM:**
```bash
npm install tinypine
```

```html
<script type="module">
  import core from './node_modules/tinypine/src/core.js';
</script>
```

## Example

```html
<div t-data="{ count: 0, name: 'World' }">
  <h1 t-text="'Hello ' + name"></h1>
  <p>Count: <span t-text="count"></span></p>

  <button t-click="count++">Increment</button>
  <input t-model="name" placeholder="Your name">

  <p t-show="count > 5">Great job!</p>
</div>
```

[📖 View Full Documentation](#documentation)

---

## Features

✅ **13KB** minified · No build tools · No virtual DOM
✅ **Proxy-based reactivity** · Instant updates
✅ **Directive-based** · Clean `t-*` syntax
✅ **Scoped contexts** · `$parent`, `$root`, `$refs`, `$el`
✅ **List rendering** · `t-for` directive
✅ **Event modifiers** · `.prevent`, `.stop`, `.once`, `.outside`
✅ **Methods support** · Component-like functions
✅ **Global store** · `TinyPine.store()` and `$store` access
✅ **Watcher API** · `TinyPine.watch()` for reactive changes
✅ **SSR hydration** · Auto-load from `window.__TINYPINE_STATE__`
✅ **Zero dependencies** · Works anywhere

---

## Documentation

### Directives

#### `t-data`
Create a reactive scope.

```html
<div t-data="{ count: 0, name: 'John' }">
  <!-- content -->
</div>
```

**With methods:**
```html
<div t-data="{ count: 0, methods: { inc() { this.count++; } } }">
  <button t-click="methods.inc()">Add</button>
</div>
```

**Nested scopes:**
```html
<div t-data="{ parent: 'data' }">
  <div t-data="{ child: 'data' }">
    <span t-text="$parent.parent"></span>
  </div>
</div>
```

#### `t-text`
Update text content.

```html
<span t-text="count"></span>
<span t-text="'Hello ' + name"></span>
```

#### `t-show`
Toggle visibility.

```html
<p t-show="isVisible">Visible content</p>
<p t-show="count > 10">Conditional content</p>
```

#### `t-click`
Click handlers with event modifiers.

```html
<button t-click="count++">Increment</button>
<button t-click="methods.save.prevent">Save (no page refresh)</button>
<button t-click="methods.init.once">Initialize once</button>
```

**Event modifiers:**
- `.prevent` - `event.preventDefault()`
- `.stop` - `event.stopPropagation()`
- `.once` - Execute only once
- `.outside` - Detect clicks outside element

#### `t-model`
Two-way data binding.

```html
<input type="text" t-model="name">
<input type="number" t-model="age">
<textarea t-model="description"></textarea>
```

#### `t-for` *(v0.3.0)*
List rendering.

```html
<ul>
  <li t-for="item in items">
    <span t-text="item"></span>
  </li>
</ul>
```

**With index:**
```html
<li t-for="(item, index) in items">
  <span t-text="index"></span>: <span t-text="item"></span>
</li>
```

**With removal:**
```html
<div t-data="{ items: ['A', 'B'], methods: { remove(i) { this.items.splice(i, 1); } } }">
  <li t-for="(item, index) in items">
    <span t-text="item"></span>
    <button t-click="methods.remove(index)">Remove</button>
  </li>
</div>
```

#### `t-bind`
Dynamic attributes.

```html
<img t-bind:src="imageUrl" t-bind:alt="title">
<a t-bind:href="url" t-bind:target="target">Link</a>
```

#### `t-class`
Conditional CSS classes.

```html
<div t-class:active="isActive">Toggle active class</div>
<div t-class="className">Dynamic class</div>
```

#### `t-ref`
Register DOM references.

```html
<div t-data="{ methods: { focus() { this.$refs.input.focus(); } } }">
  <input t-ref="input">
  <button t-click="methods.focus()">Focus</button>
</div>
```

### Context Accessors

- **`$parent`** - Parent scope data
- **`$root`** - Root scope data
- **`$refs`** - Registered DOM elements
- **`$el`** - Current element

```html
<div t-data="{ root: 'data' }">
  <div t-data="{ child: 'data' }">
    <span t-text="$root.root"></span>
    <span t-text="$parent.child"></span>
  </div>
</div>
```

### Debug Mode

```javascript
TinyPine.debug = true;
```

---

## Examples

### Counter
```html
<div t-data="{ count: 0 }">
  <button t-click="count--">-</button>
  <span t-text="count"></span>
  <button t-click="count++">+</button>
</div>
```

### Todo List
```html
<div t-data="{ items: [], newItem: '', methods: {
  add() { if(this.newItem) { this.items.push(this.newItem); this.newItem = ''; } },
  remove(index) { this.items.splice(index, 1); }
} }">
  <input t-model="newItem" placeholder="Add item">
  <button t-click="methods.add()">Add</button>
  <ul>
    <li t-for="(item, index) in items">
      <span t-text="item"></span>
      <button t-click="methods.remove(index)">Remove</button>
    </li>
  </ul>
</div>
```

### Form Validation
```html
<div t-data="{ email: '', isValid: false }">
  <input t-model="email" type="email" placeholder="Email">
  <span t-show="!isValid && email">Invalid</span>
  <button t-click="isValid = true">Submit</button>
</div>
```

---

## Global Store & Watchers

### Creating Stores

```javascript
// Create a global store
TinyPine.store('auth', { user: 'Guest', loggedIn: false });
TinyPine.store('ui', { theme: 'light' });
```

### Accessing Stores

```html
<div t-data="{}">
  <!-- Access store properties -->
  <span t-text="$store.auth.user"></span>

  <!-- Update store -->
  <button t-click="methods.toggle()">Login</button>
</div>

<script>
  // In methods
  methods: {
    toggle() {
      this.$store.auth.loggedIn = !this.$store.auth.loggedIn;
    }
  }
</script>
```

### Watcher API

```javascript
// Watch a store property
const unwatch = TinyPine.watch('auth.loggedIn', (newVal, oldVal, path) => {
  console.log(`${path} changed:`, { old: oldVal, new: newVal });
});

// Later, unwatch
unwatch();
```

### SSR Hydration

```html
<!-- Server renders -->
<script>
window.__TINYPINE_STATE__ = {
  auth: { user: 'John', loggedIn: true },
  ui: { theme: 'dark' }
};
</script>

<script src="tinypine.min.js"></script>
<!-- TinyPine automatically hydrates from __TINYPINE_STATE__ -->
```

---

## How It Works

1. **Initialize** - Scan DOM for `t-data`
2. **Reactive State** - Create Proxy objects
3. **Parse Directives** - Process `t-*` attributes
4. **Watch Changes** - Update DOM automatically
5. **Event Handlers** - Attach listeners

**No virtual DOM** · **Direct DOM updates** · **13KB footprint**

---

## Roadmap

- ✅ **v0.1.0** - Core directives
- ✅ **v0.2.0** - Scoped contexts, methods
- ✅ **v0.3.0** - t-for, event modifiers
- ✅ **v0.4.0** - Global store, watcher API, SSR hydration
- 🚧 **v0.5.0** - Plugin API, extensions, build tools

---

## Browser Support

✅ Chrome/Edge 49+ · Firefox 18+ · Safari 10+

---

## License

MIT License - Use freely in your projects!

---

<div align="center">
  Made with ❤️ by TinyPine Team

  [GitHub](https://github.com/DigitalCoreHub/TinyPine) · [Issues](https://github.com/DigitalCoreHub/TinyPine/issues)
</div>
