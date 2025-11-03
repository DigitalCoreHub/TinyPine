# 🧠 TinyPine Memory & Lifecycle Guide

> Understanding cleanup, memory management, and lifecycle hooks in TinyPine.js v1.3.0

---

## 🔄 Component Lifecycle

TinyPine components have a simple, predictable lifecycle:

```
┌─────────────┐
│ t-data init │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  mounted()  │ <── Component attached to DOM
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Active    │ <── Reactive updates happen here
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ beforeUnmount() │ <── Component about to be removed
└────────┬────────┘
        │
        ▼
┌─────────────┐
│ unmounted() │ <── Component removed from DOM
└─────────────┘
```

---

## 📅 Lifecycle Hooks

### 1. **mounted()**

Called when component is attached to DOM.

```javascript
{
  count: 0,
  timer: null,

  mounted(el, context) {
    console.log('Component mounted!');
    console.log('Element:', el);
    console.log('Context:', context);

    // Setup timers, event listeners, etc.
    this.timer = setInterval(() => {
      this.count++;
    }, 1000);
  }
}
```

**When to use:**

- Initialize timers/intervals
- Setup external event listeners
- Fetch initial data
- Setup third-party libraries

---

### 2. **beforeUnmount()**

Called **before** component is removed from DOM.

```javascript
{
  socket: null,

  mounted() {
    this.socket = new WebSocket('ws://localhost:3000');
  },

  beforeUnmount(el, context) {
    console.log('About to unmount!');

    // Cleanup before removal
    if (this.socket) {
      this.socket.close();
    }
  }
}
```

**When to use:**

- Close WebSocket connections
- Send "user left" analytics
- Save state to localStorage
- Cleanup async operations

---

### 3. **unmounted()**

Called **after** component is removed from DOM.

```javascript
{
  subscription: null,

  mounted() {
    this.subscription = eventBus.subscribe('update', this.handleUpdate);
  },

  unmounted(el, context) {
    console.log('Component unmounted!');

    // Final cleanup
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

**When to use:**

- Remove event listeners
- Clear timers/intervals
- Remove DOM references
- Cleanup subscriptions

---

## 🧹 Cleanup Patterns

### Pattern 1: Timers & Intervals

```javascript
{
  timer: null,
  interval: null,

  mounted() {
    // Delayed action
    this.timer = setTimeout(() => {
      this.showMessage = true;
    }, 3000);

    // Recurring action
    this.interval = setInterval(() => {
      this.time = new Date().toLocaleTimeString();
    }, 1000);
  },

  beforeUnmount() {
    // CRITICAL: Clear both!
    clearTimeout(this.timer);
    clearInterval(this.interval);
  }
}
```

**Memory leak if not cleared:** Timer references keep component alive.

---

### Pattern 2: Event Listeners

```javascript
{
  handleResize: null,
  handleScroll: null,

  mounted() {
    this.handleResize = () => {
      this.windowWidth = window.innerWidth;
    };

    this.handleScroll = () => {
      this.scrollTop = window.scrollY;
    };

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll);
  },

  beforeUnmount() {
    // CRITICAL: Remove listeners!
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }
}
```

**Why store references:** Can't remove anonymous functions.

---

### Pattern 3: WebSockets & SSE

```javascript
{
  socket: null,

  mounted() {
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onmessage = (event) => {
      this.messages.push(JSON.parse(event.data));
    };
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
```

---

### Pattern 4: Third-Party Libraries

```javascript
{
  chart: null,

  mounted(el) {
    const canvas = el.querySelector('canvas');
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: this.chartData
    });
  },

  unmounted() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
```

---

### Pattern 5: Async Operations

```javascript
{
  abortController: null,

  async loadData() {
    // Cancel previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    try {
      const res = await fetch('/api/data', {
        signal: this.abortController.signal
      });
      this.data = await res.json();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    }
  },

  beforeUnmount() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
```

---

## 🚨 Memory Leak Checklist

| Resource                     | Cleanup Required           | Hook            |
| ---------------------------- | -------------------------- | --------------- |
| `setTimeout`                 | ✅ `clearTimeout()`        | `beforeUnmount` |
| `setInterval`                | ✅ `clearInterval()`       | `beforeUnmount` |
| `addEventListener`           | ✅ `removeEventListener()` | `beforeUnmount` |
| `WebSocket`                  | ✅ `socket.close()`        | `beforeUnmount` |
| `fetch` with AbortController | ✅ `controller.abort()`    | `beforeUnmount` |
| Third-party libs             | ✅ `lib.destroy()`         | `unmounted`     |
| DOM references               | ⚠️ Optional (auto-GC)      | `unmounted`     |
| Reactive state               | ❌ Auto-cleaned            | -               |

---

## 🧪 Testing for Memory Leaks

### Method 1: Chrome DevTools Memory Profiler

1. Open DevTools → Memory tab
2. Take **Heap Snapshot**
3. Perform actions (mount/unmount components)
4. Take another **Heap Snapshot**
5. Compare snapshots

**Expected:** No leaked DOM nodes or listeners.

---

### Method 2: Manual Counter

```javascript
// Track active components
window._activeComponents = 0;

{
  mounted() {
    window._activeComponents++;
    console.log('Active:', window._activeComponents);
  },

  unmounted() {
    window._activeComponents--;
    console.log('Active:', window._activeComponents);
  }
}

// After all unmounts:
console.log('Leaked:', window._activeComponents); // Should be 0
```

---

## 🔍 Debugging Memory Issues

### Enable Debug Mode

```javascript
TinyPine.debug = true;
```

**What you'll see:**

- Mounted/unmounted events
- Context creation/destruction
- State updates

---

### Check Global Contexts

```javascript
// TinyPine tracks all contexts internally
console.log(window.TinyPine._contexts);
console.log(window.TinyPine._contexts.size); // Should match DOM elements
```

---

### Inspect Element Metadata

```javascript
const el = document.querySelector("[t-data]");

console.log("State:", el._tinypineState);
console.log("Context:", el._tinypineContext);
console.log("Click handler:", el._tinypineClickHandler);
console.log("Validate handler:", el._tinypineValidateHandler);

// After unmount, these should be undefined/removed
```

---

## 🧠 State Management Memory

### Stores are Global

```javascript
// ⚠️ Stores persist across component unmounts
TinyPine.store("auth", { user: null });

// Later...
const auth = TinyPine.getStore("auth");
console.log(auth.user); // Still exists!
```

**When to clear:**

- User logout
- Route change (if needed)
- App reset

```javascript
// Manual clear
const auth = TinyPine.getStore("auth");
auth.user = null;
auth.token = null;
```

---

### Local State Auto-Cleans

```javascript
// ✅ Auto-cleaned on unmount
{
  items: [],
  count: 0
}
```

**TinyPine automatically removes:**

- `_tinypineState`
- `_tinypineContext`
- Event listeners added via directives

---

## 📊 Memory Benchmarks

### Typical Memory Usage

| Component Type          | Memory (per instance) |
| ----------------------- | --------------------- |
| Simple (10 props)       | ~2KB                  |
| Medium (50 props)       | ~8KB                  |
| Large (list, 100 items) | ~50KB                 |
| Store (global)          | ~5KB                  |

**Total for small app:** ~1-5MB

---

### Leak Indicators

🚨 **Warning signs:**

- Memory grows continuously
- Components stay in memory after unmount
- Event listeners accumulate
- `window._activeComponents` > 0 after cleanup

---

## ✅ Best Practices Summary

### DO ✅

1. ✅ **Always clean up timers:**

    ```javascript
    beforeUnmount() {
      clearInterval(this.timer);
    }
    ```

2. ✅ **Remove event listeners:**

    ```javascript
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }
    ```

3. ✅ **Close connections:**

    ```javascript
    beforeUnmount() {
      this.socket.close();
    }
    ```

4. ✅ **Cancel async operations:**

    ```javascript
    beforeUnmount() {
      this.abortController.abort();
    }
    ```

5. ✅ **Destroy third-party libs:**
    ```javascript
    unmounted() {
      this.chart.destroy();
    }
    ```

---

### DON'T ❌

1. ❌ **Forget to store listener references:**

    ```javascript
    // ❌ Can't remove later
    window.addEventListener("resize", () => {
        /* ... */
    });

    // ✅ Store reference
    this.handleResize = () => {
        /* ... */
    };
    window.addEventListener("resize", this.handleResize);
    ```

2. ❌ **Create circular references:**

    ```javascript
    // ❌ Memory leak
    {
        self: this;
    }
    ```

3. ❌ **Store DOM refs in state:**
    ```javascript
    // ❌ Use $refs instead
    {
        myElement: document.querySelector("#el");
    }
    ```

---

## 🛠️ Debugging Tools

### TinyPine DevTools

```javascript
TinyPine.devtools();
```

**Features:**

- Live component count
- Memory usage tracking
- Unmount detection

---

### Global Lifecycle Hooks

```javascript
// Track all mounts
TinyPine.onMount((el, context) => {
    console.log("Component mounted:", el);
});

// Track all unmounts
TinyPine.onUnmount((el, context) => {
    console.log("Component unmounted:", el);
});
```

---

## 📚 Resources

- **MDN Memory Management:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management
- **Chrome DevTools Memory Profiling:** https://developer.chrome.com/docs/devtools/memory-problems/

---

**Remember:** TinyPine auto-cleans most things, but **you** are responsible for:

1. ⏰ Timers/intervals
2. 🎧 Event listeners
3. 🔌 Network connections
4. 📚 Third-party libraries

**Last Updated:** v1.3.0
