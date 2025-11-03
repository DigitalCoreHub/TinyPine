# ⚡ TinyPine Performance Guide

> Optimize reactivity, rendering, and memory usage in TinyPine.js v1.3.0

---

## 🎯 Core Performance Principles

TinyPine is designed for **minimal overhead**:

- ✅ **No Virtual DOM** - Direct DOM manipulation
- ✅ **Native Proxy** - Zero-cost reactivity
- ✅ **Lazy Updates** - Debounced rendering
- ✅ **Smart Diffing** - Keyed lists (v1.3.0)

**Baseline:** ~4KB minified | <1ms initial load | Instant updates

---

## 🔄 Reactivity Optimization

### 1. **Minimize Reactive Properties**

```javascript
// ❌ Slow - Unnecessary reactive properties
{
  user: { id: 1, name: 'John', age: 30, email: '...', address: '...', ... }
}

// ✅ Fast - Only reactive what you need
{
  userName: 'John',
  userAge: 30
}
```

**Why:** Each property adds a Proxy trap. Keep state minimal.

---

### 2. **Batch State Updates**

```javascript
// ❌ Triggers 3 separate updates
count++;
name = "Jane";
status = "active";

// ✅ Triggers 1 update (debounced)
Object.assign(this, {
    count: count + 1,
    name: "Jane",
    status: "active",
});
```

**Why:** Updates are debounced with `setTimeout(0)`, but batching is faster.

---

### 3. **Avoid Deep Nesting**

```javascript
// ❌ Slow - Deep object reactivity
{
    user: {
        profile: {
            settings: {
                theme: "dark";
            }
        }
    }
}

// ✅ Fast - Flat structure
{
    userTheme: "dark";
}
```

**Why:** Proxy wrapping is recursive. Flat = fast.

---

## 🚀 Rendering Optimization

### 1. **Use `:key` for t-for (v1.3.0)**

```html
<!-- ❌ Slow - Re-renders entire list -->
<li t-for="item in items" t-text="item.name"></li>

<!-- ✅ Fast - Keyed diffing, reuses DOM nodes -->
<li t-for="item in items" :key="item.id" t-text="item.name"></li>
```

**Performance Impact:**

- Without key: O(n) re-render
- With key: O(changes) diff

**Benchmark (1000 items):**

```
No key:  ~50ms per update
With key: ~5ms per update (10x faster)
```

---

### 2. **Minimize Directive Usage**

```html
<!-- ❌ Redundant directives -->
<div t-show="isVisible" t-class:active="isActive" t-bind:id="userId">
    <span t-text="userName"></span>
    <span t-text="userEmail"></span>
</div>

<!-- ✅ Combine where possible -->
<div t-show="isVisible">
    <span>{{ userName }}</span>
    <span>{{ userEmail }}</span>
</div>
```

**Why:** Each directive = 1 evaluation per update.

---

### 3. **Avoid Expensive Expressions**

```html
<!-- ❌ Slow - Runs filter on every update -->
<li t-for="item in items.filter(i => i.active)">
    <!-- ✅ Fast - Filter once in data -->
    <div
        t-data="{
  items: [...],
  get activeItems() { return this.items.filter(i => i.active); }
}"
    >
        <li t-for="item in activeItems"></li>
    </div>
</li>
```

---

### 4. **Lazy Load Components**

```javascript
// ❌ All components loaded at once
import "./components/modal.js";
import "./components/table.js";
import "./components/chart.js";

// ✅ Load on demand
async function showChart() {
    await import("./components/chart.js");
    this.chartVisible = true;
}
```

---

## 📊 List Rendering Best Practices

### 1. **Pagination for Large Lists**

```javascript
// ❌ Render 10,000 items
{ items: [...10000 items] }

// ✅ Paginate
{
  items: [...],
  page: 1,
  pageSize: 50,
  get paginatedItems() {
    const start = (this.page - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }
}
```

```html
<li t-for="item in paginatedItems" :key="item.id"></li>
```

---

### 2. **Virtual Scrolling for Huge Lists**

For 1000+ items, use virtual scrolling:

```javascript
{
  items: [...],
  scrollTop: 0,
  itemHeight: 50,
  visibleCount: 20,

  get visibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    return this.items.slice(startIndex, startIndex + this.visibleCount);
  }
}
```

```html
<div
    class="scroll-container"
    style="height: 1000px; overflow-y: auto"
    t-scroll="scrollTop = $event.target.scrollTop"
>
    <div :style="'height: ' + (items.length * itemHeight) + 'px'">
        <li t-for="item in visibleItems" :key="item.id"></li>
    </div>
</div>
```

---

## 🧮 Form Performance

### 1. **Debounce Input Validation**

```html
<!-- ❌ Validates on every keystroke -->
<input t-model="email" t-validate="required|email" />

<!-- ✅ Validate on blur -->
<input t-model="email" t-validate="required|email" @blur="validate()" />
```

---

### 2. **Lazy Load Heavy Validation**

```javascript
// ❌ Import all validators upfront
import * as validators from "./validators.js";

// ✅ Import on demand
async function validateComplex() {
    const { validateCreditCard } = await import("./validators.js");
    return validateCreditCard(this.ccNumber);
}
```

---

## 🌐 Async & Network Optimization

### 1. **t-fetch Race Condition Handling (v1.3.0)**

**Built-in race control:**

```html
<!-- Automatic request cancellation -->
<div t-fetch="'/api/search?q=' + query"></div>
```

**How it works:**

- AbortController cancels outdated requests
- Request ID tracking prevents stale data overwrites

---

### 2. **Cache API Responses**

```javascript
TinyPine.cache().set("users", userData);

// Later...
const cached = TinyPine.cache().get("users");
if (cached) return cached;
```

---

### 3. **Lazy i18n Locale Loading**

```javascript
// ❌ Load all locales upfront
TinyPine.i18n({
    en: {
        /* 1000 keys */
    },
    tr: {
        /* 1000 keys */
    },
    es: {
        /* 1000 keys */
    },
});

// ✅ Load on demand
TinyPine.loadLocale("es", "/locales/es.json");
```

---

## 🧠 Memory Management

### 1. **Cleanup in Lifecycle Hooks**

```javascript
{
  timer: null,
  subscription: null,

  mounted() {
    this.timer = setInterval(() => this.update(), 1000);
    this.subscription = eventBus.subscribe('update', this.handleUpdate);
  },

  beforeUnmount() {
    clearInterval(this.timer);
    this.subscription.unsubscribe();
  }
}
```

---

### 2. **Avoid Circular References**

```javascript
// ❌ Memory leak
{
  parent: this,
  child: {
    parent: this // Circular!
  }
}

// ✅ Use $parent helper
{
  child: {
    // Access via $parent in expressions
  }
}
```

---

### 3. **Remove Event Listeners**

TinyPine auto-cleans `t-click`, but for custom listeners:

```javascript
{
  mounted() {
    this.handleResize = () => { /* ... */ };
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
}
```

---

## 📏 Measuring Performance

### 1. **Enable Performance Tracking**

```javascript
TinyPine.devtools();
```

**Metrics shown:**

- Update count
- Render time
- Memory usage

---

### 2. **Browser Performance API**

```javascript
performance.mark("render-start");
// ... rendering code
performance.mark("render-end");
performance.measure("render", "render-start", "render-end");

const measures = performance.getEntriesByType("measure");
console.log("Render time:", measures[0].duration, "ms");
```

---

### 3. **React DevTools Profiler Alternative**

Use Chrome DevTools:

1. **Performance Tab** → Record
2. Trigger state changes
3. Analyze flame graph

---

## 🎯 Production Optimizations

### 1. **Minify & Gzip**

```bash
# Build minified version
npm run build

# Gzip compression (server-side)
# TinyPine: ~4KB → ~1.5KB gzipped
```

---

### 2. **Disable Debug Mode**

```javascript
// ❌ Debug mode in production
TinyPine.debug = true;

// ✅ Production
TinyPine.debug = false;
```

---

### 3. **Use Lite Mode for Simple Apps**

```javascript
// Disables DevTools, heavy features
TinyPine.mode = "lite";
TinyPine.start("#app");
```

**Size reduction:** ~30% smaller

---

## 📊 Performance Benchmarks

### Directive Processing (1000 updates)

| Directive      | Time (ms) | Notes                   |
| -------------- | --------- | ----------------------- |
| t-text         | 5         | Fastest                 |
| t-show         | 8         | CSS transition          |
| t-class        | 10        | Class list manipulation |
| t-for (no key) | 50        | Full re-render          |
| t-for (keyed)  | 8         | Diff only changed       |

### State Updates (10,000 operations)

| Operation          | Time (ms) |
| ------------------ | --------- |
| Simple assignment  | 2         |
| Array push         | 3         |
| Object.assign      | 5         |
| Deep object update | 15        |

---

## ✅ Performance Checklist

- [ ] Use `:key` for all `t-for` lists
- [ ] Batch state updates when possible
- [ ] Keep reactive state minimal
- [ ] Avoid deep object nesting
- [ ] Cleanup timers/listeners in `beforeUnmount`
- [ ] Lazy load components and locales
- [ ] Enable production mode (debug off)
- [ ] Use pagination for large lists
- [ ] Cache API responses
- [ ] Debounce expensive operations

---

**Target Performance:**

- Initial load: <50ms
- State update: <5ms
- List diff (keyed): <10ms
- Memory: <5MB for typical app

**TinyPine is already fast. Follow these tips to keep it that way!** ⚡

---

**Last Updated:** v1.3.0
