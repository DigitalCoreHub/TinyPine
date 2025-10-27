<div align="center">
  <img src="favicon.svg" alt="TinyPine.js" width="120" height="120">

  # TinyPine.js

  **Minimal, comfortable & intuitive reactive micro-framework**
  *"HTML reactivity, zero build, zero stress."*

  [![Version](https://img.shields.io/badge/version-v0.2.0-blue.svg)](https://github.com/DigitalCoreHub/TinyPine)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

---

## ✨ Overview

TinyPine.js is a lightweight reactive framework that brings instant reactivity to HTML without build tools, virtual DOM, or complex setup. Write reactive HTML directly in the browser—no bundlers, no transpilation, no configuration.

**v0.2.0** adds scoped reactivity with $parent, $root, $refs, method support, and debug mode.

## 🚀 Features

- ⚡ **Instant Reactivity** - Proxy-based reactive state management
- 🎯 **Zero Build Tools** - Works directly in the browser
- 📦 **Tiny Footprint** - Less than 10 KB minified
- 🎨 **Directive-Based** - Clean `t-*` attribute syntax
- 🔄 **Two-Way Binding** - Full data binding on inputs
- 🎭 **No Virtual DOM** - Direct DOM manipulation
- 🌳 **Scoped Contexts** - Nested reactive scopes with $parent, $root
- 🔍 **Debug Mode** - Built-in debugging utility
- 🎪 **Methods Support** - Component-like methods in scope

## 📦 Installation

### NPM
```bash
npm install tinypine
```

Then in your HTML:
```html
<script type="module">
  import { init } from './node_modules/tinypine/src/core.js';
  TinyPine.init();
</script>
```

### CDN (Unpkg)
```html
<script src="https://unpkg.com/tinypine@0.1.0/dist/tinypine.min.js"></script>
```

### Local Setup
1. Clone the repository
2. Include the core file in your HTML:
```html
<script type="module">
  import core from './src/core.js';
  // TinyPine auto-initializes
</script>
```

## 🎯 Quick Start

```html
<!DOCTYPE html>
<html>
<body>
  <div t-data="{ count: 0, message: 'Hello TinyPine!' }">
    <!-- Display reactive value -->
    <h1 t-text="message"></h1>
    <p>Count: <span t-text="count"></span></p>

    <!-- Click event handler -->
    <button t-click="count++">Increment</button>

    <!-- Two-way binding -->
    <input type="text" t-model="message">

    <!-- Conditional display -->
    <p t-show="count > 5">Wow! Count is greater than 5!</p>

    <!-- Dynamic class -->
    <div t-class:active="count > 0">Status: <span t-text="count > 0 ? 'Active' : 'Inactive'"></span></div>
  </div>

  <script type="module">
    import core from './src/core.js';
  </script>
</body>
</html>
```

## 📚 Directives

### `t-data`
Defines reactive data scope for a container element. Now supports nested scopes and methods!

**Basic usage:**
```html
<div t-data="{ count: 0, name: 'John', active: true }">
  <span t-text="name"></span>
  <span t-text="count"></span>
</div>
```

**With methods (v0.2.0):**
```html
<div t-data="{ count: 0, methods: { increment() { this.count++; } } }">
  <button t-click="methods.increment()">Add</button>
  <span t-text="count"></span>
</div>
```

**With nested scopes (v0.2.0):**
```html
<div t-data="{ parentCount: 0, methods: { inc() { this.parentCount++; } } }">
  <div t-data="{ childCount: 0, methods: { inc() { this.childCount++; } } }">
    <p t-text="$parent.parentCount"></p>
    <button t-click="methods.inc()">Increment Child</button>
  </div>
  <button t-click="methods.inc()">Increment Parent</button>
</div>
```

### v0.2.0 Context Accessors

Access contextual data and elements within scoped components:

- **$parent** - Access parent scope data
  ```html
  <div t-data="{ count: 0 }">
    <div t-data="{ parentCount: $parent.count }">
      Parent count: <span t-text="parentCount"></span>
    </div>
  </div>
  ```

- **$root** - Access root scope data
  ```html
  <div t-data="{ rootData: 'Root' }">
    <div t-data="{ nested: true }">
      <span t-text="$root.rootData"></span>
    </div>
  </div>
  ```

- **$refs** - Access registered DOM elements (with t-ref directive)
  ```html
  <div t-data="{ methods: { focus() { this.$refs.myInput.focus(); } } }">
    <input t-ref="myInput">
    <button t-click="methods.focus()">Focus</button>
  </div>
  ```

- **$el** - Access current scope's HTMLElement
  ```html
  <div t-data="{ methods: { logEl() { console.log(this.$el.tagName); } } }">
    <button t-click="methods.logEl()">Log Element</button>
  </div>
  ```

### `t-text`
Updates element's text content reactively.

```html
<span t-text="count"></span>
<span t-text="'Hello ' + name"></span>
```

### `t-show`
Toggles element visibility based on expression truthiness.

```html
<p t-show="isVisible">I'm shown when isVisible is true</p>
<p t-show="count > 10">Only visible when count exceeds 10</p>
```

### `t-bind`
Dynamically binds any HTML attribute.

```html
<img t-bind:src="imageUrl" t-bind:alt="imageName">
<a t-bind:href="linkUrl" t-bind:target="linkTarget">Link</a>
```

### `t-class`
Conditionally applies CSS classes.

```html
<!-- Toggle single class -->
<div t-class:active="isActive">Button</div>

<!-- Full class name replacement -->
<div t-class="getClass()">Element</div>
```

### `t-click`
Attaches click event handler.

```html
<button t-click="count++">Increment</button>
<button t-click="count--">Decrement</button>
<button t-click="count = 0">Reset</button>
```

### `t-model`
Two-way data binding for form inputs.

```html
<input type="text" t-model="name">
<input type="number" t-model="age">
<textarea t-model="description"></textarea>
```

### `t-ref`
Registers DOM elements for access via `$refs`.

```html
<div t-data="{ methods: { focusInput() { this.$refs.username.focus(); } } }">
  <input t-ref="username" type="text" placeholder="Username">
  <button t-click="methods.focusInput()">Focus Input</button>
</div>
```

## 📖 Examples

### Counter App

```html
<div t-data="{ count: 0 }">
  <button t-click="count--">−</button>
  <span t-text="count"></span>
  <button t-click="count++">+</button>
</div>
```

### Todo List (Basic)

```html
<div t-data="{ items: ['Task 1', 'Task 2'], newItem: '' }">
  <input t-model="newItem" placeholder="Add item">
  <button t-click="items.push(newItem); newItem = ''">Add</button>
  <ul>
    <li t-text="item" t-repeat="item in items"></li>
  </ul>
</div>
```

### Form Validation

```html
<div t-data="{ email: '', isValid: false }">
  <input type="email" t-model="email" placeholder="Email">
  <span t-show="email.length > 0 && !isValid" style="color: red;">Invalid email</span>
  <button t-click="isValid = true">Submit</button>
</div>
```

## 🏗️ Architecture

### Core Files

```
tinypine/
├── src/
│   ├── core.js     # Reactivity engine + directive handlers
│   └── index.js    # TinyPine entrypoint
├── dist/
│   └── tinypine.min.js
└── demo/
    └── index.html  # Live examples
```

### How It Works

1. **Initialization**: Scans DOM for `t-data` attributes
2. **Reactive State**: Creates Proxy objects for reactive get/set
3. **Directive Parsing**: Processes `t-*` attributes on elements
4. **Change Detection**: Updates DOM when state changes
5. **Event Binding**: Attaches event listeners for `t-click`, `t-model`

## 🎨 Styling

TinyPine doesn't include any CSS—you have full control. Style your components however you like!

```html
<style>
  .my-component {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .active {
    background: #4CAF50;
    color: white;
  }
</style>

<div t-data="{ active: true }" class="my-component" t-class:active="active">
  Content
</div>
```

## 🐛 Debug Mode

Enable debug mode to see detailed reactivity logs in the console:

```javascript
TinyPine.debug = true;
```

This will log all state changes with their respective elements and values.

## 🧪 Testing

Open the demo file in your browser:

```bash
# Serve the project
npm run dev
# or
npx serve -p 8000

# Open in browser
http://localhost:8000/demo/index.html
```

## 🐛 Debugging

TinyPine logs helpful warnings in the console:

- `[TinyPine] Unknown directive: t-xyz` - Invalid directive used
- `[TinyPine] Expression evaluation failed` - JavaScript error in expression
- `[TinyPine] Failed to parse t-data` - Invalid data object

Enable debug mode for more verbose logging:

```javascript
window.TinyPine.debug = true;
```

## 📊 Performance

- **Initial Load**: ~4 KB gzipped
- **Reactivity**: Proxy-based, minimal overhead
- **DOM Updates**: Direct manipulation (no VDOM)
- **Memory**: Efficient, no memory leaks

## 🛠️ Browser Support

- Chrome/Edge 49+
- Firefox 18+
- Safari 10+
- IE 11 (limited Proxy support)

## 🗺️ Roadmap

### v0.1.0 ✅ (Current)
- Core reactivity engine
- Basic directive set (t-data, t-text, t-show, t-bind, t-class, t-click, t-model)
- DOM initialization
- Zero build setup

### v0.2.0 (Planned)
- Scoped contexts
- Debug mode improvements
- Performance optimizations

### v0.3.0 (Planned)
- Plugin API
- Directive extension system
- Build tool integration (optional)

## 📝 License

MIT License - feel free to use TinyPine in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

Built with ❤️ by the TinyPine team

---

**Start building reactive UIs today with TinyPine.js!** 🌲
