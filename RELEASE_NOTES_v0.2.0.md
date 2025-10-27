# v0.2.0 - Nested Scopes, Methods, Debug Mode

## 🎉 New Features

### Hierarchical Scope Management
Access parent and root scope data via `$parent` and `$root` context accessors.

```html
<div t-data="{ count: 0 }">
  <p>Parent: <span t-text="count"></span></p>
  <div t-data="{ childCount: 0 }">
    <p>Child: <span t-text="childCount"></span></p>
    <p>Parent from child: <span t-text="$parent.count"></span></p>
  </div>
</div>
```

### Methods Object Support
Define scoped methods in t-data for component-like behavior.

```html
<div t-data="{ count: 0, methods: { increment() { this.count++; } } }">
  <button t-click="methods.increment()">Add</button>
  <span t-text="count"></span>
</div>
```

### Debug Mode
Enable `TinyPine.debug` for detailed reactivity logging.

```javascript
TinyPine.debug = true; // Logs all state changes
```

### t-ref Directive
Register DOM elements for programmatic access via `$refs`.

```html
<div t-data="{ methods: { focus() { this.$refs.input.focus(); } } }">
  <input t-ref="input">
  <button t-click="methods.focus()">Focus</button>
</div>
```

### Context Accessors
- `$el` - Current scope element
- `$refs` - DOM element references
- `$parent` - Parent scope data
- `$root` - Root scope data

## 📦 Installation

```bash
npm install tinypine@0.2.0
```

## 🚀 What's Changed

- ✅ Nested reactive scopes with `$parent`/`$root` access
- ✅ Methods object in t-data (scoped functions)
- ✅ TinyPine.debug mode for development
- ✅ t-ref directive for DOM element references
- ✅ Context-aware directive evaluation
- ✅ Improved nested scope update system

## 📖 Documentation

See [README.md](https://github.com/DigitalCoreHub/TinyPine/blob/main/README.md) for full documentation.

## 🐛 Bug Fixes

- Fixed nested scope isolation issues
- Fixed methods this binding in event handlers
- Fixed context accessor evaluation in expressions

## 📊 Stats

- Build size: 11.62 KB (minified)
- Package size: 12.3 kB
- Files: 7

