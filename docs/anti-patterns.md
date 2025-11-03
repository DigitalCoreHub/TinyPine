# ⚠️ TinyPine Anti-Patterns

> Common gotchas, mistakes, and anti-patterns to avoid in TinyPine.js v1.3.0

---

## 🚫 1. Mutating Props Outside Scope

### ❌ **Anti-Pattern:**

```html
<div t-data="{ count: 0 }">
    <button onclick="count++">Increment</button>
</div>
```

### ✅ **Correct:**

```html
<div t-data="{ count: 0 }">
    <button t-click="count++">Increment</button>
</div>
```

**Why:** Plain `onclick` doesn't access reactive scope. Always use `t-click`.

---

## 🚫 2. Missing State Properties

### ❌ **Anti-Pattern:**

```html
<div t-data="{ count: 0 }">
    <input t-model="name" />
    <!-- name not defined! -->
</div>
```

### ✅ **Correct:**

```html
<div t-data="{ count: 0, name: '' }">
    <input t-model="name" />
</div>
```

**Why:** `t-model` requires the property to exist in state.

---

## 🚫 3. Not Using :key in Lists

### ❌ **Anti-Pattern:**

```html
<li t-for="item in items" t-text="item.name"></li>
```

**Problem:** Full re-render on every change. Slow for large lists.

### ✅ **Correct:**

```html
<li t-for="item in items" :key="item.id" t-text="item.name"></li>
```

**Why:** Keyed diffing reuses DOM nodes = 10x faster.

---

## 🚫 4. Expensive Expressions in Templates

### ❌ **Anti-Pattern:**

```html
<div
    t-for="item in items.filter(i => i.active).sort((a, b) => a.name.localeCompare(b.name))"
></div>
```

**Problem:** Runs filter + sort on every update.

### ✅ **Correct:**

```javascript
{
  items: [],
  get activeItems() {
    return this.items
      .filter(i => i.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
```

```html
<div t-for="item in activeItems" :key="item.id"></div>
```

**Why:** Computed property caches result.

---

## 🚫 5. Deep Object Nesting

### ❌ **Anti-Pattern:**

```javascript
{
    user: {
        profile: {
            settings: {
                theme: {
                    color: "dark";
                }
            }
        }
    }
}
```

### ✅ **Correct:**

```javascript
{
    userTheme: "dark";
}
```

**Why:** Deep nesting = slow Proxy wrapping. Keep state flat.

---

## 🚫 6. Not Cleaning Up Side Effects

### ❌ **Anti-Pattern:**

```javascript
{
  mounted() {
    setInterval(() => {
      this.count++;
    }, 1000);
  }
  // No cleanup!
}
```

**Problem:** Memory leak - interval keeps running after unmount.

### ✅ **Correct:**

```javascript
{
  timer: null,

  mounted() {
    this.timer = setInterval(() => {
      this.count++;
    }, 1000);
  },

  beforeUnmount() {
    clearInterval(this.timer);
  }
}
```

---

## 🚫 7. Using eval() or innerHTML Unsafely

### ❌ **Anti-Pattern:**

```html
<div t-html="userInput"></div>
```

**Problem:** XSS vulnerability if `userInput` contains `<script>`.

### ✅ **Correct:**

```html
<div t-text="userInput"></div>
```

**Why:** `t-html` has sanitizer, but `t-text` is safer for user content.

---

## 🚫 8. Ignoring Async Race Conditions

### ❌ **Anti-Pattern:**

```javascript
async loadUser(id) {
  const user = await fetch(`/api/users/${id}`).then(r => r.json());
  this.user = user; // Might be stale if ID changed!
}
```

### ✅ **Correct:**

Use `t-fetch` (built-in race control) or manual check:

```javascript
async loadUser(id) {
  const requestId = ++this.requestId;
  const user = await fetch(`/api/users/${id}`).then(r => r.json());

  if (requestId === this.requestId) {
    this.user = user; // Only update if latest
  }
}
```

---

## 🚫 9. Not Awaiting Debounced Updates

### ❌ **Anti-Pattern:**

```javascript
this.count = 10;
console.log(this.$refs.counter.textContent); // Still "0"!
```

**Problem:** Updates are debounced with `setTimeout(0)`.

### ✅ **Correct:**

```javascript
this.count = 10;
await new Promise((resolve) => setTimeout(resolve, 0));
console.log(this.$refs.counter.textContent); // "10"
```

**Or use `t-effect` for reactive side effects:**

```html
<div t-effect="console.log('Count is', count)"></div>
```

---

## 🚫 10. Modifying Array/Object by Reference

### ❌ **Anti-Pattern:**

```javascript
const item = this.items[0];
item.name = "Updated"; // Doesn't trigger update!
```

**Problem:** Direct mutation doesn't notify Proxy.

### ✅ **Correct:**

```javascript
this.items[0] = { ...this.items[0], name: "Updated" };
// or
this.items.splice(0, 1, { ...this.items[0], name: "Updated" });
```

**Why:** Assignment triggers Proxy setter.

---

## 🚫 11. Using t-for Without Parentheses

### ❌ **Anti-Pattern:**

```html
<li t-for="item, index in items"></li>
```

**Problem:** Parser expects `(item, index)`.

### ✅ **Correct:**

```html
<li t-for="(item, index) in items"></li>
```

---

## 🚫 12. Accessing $parent Incorrectly

### ❌ **Anti-Pattern:**

```javascript
{
  mounted() {
    console.log(this.$parent); // undefined in methods!
  }
}
```

**Problem:** `$parent` is a Proxy getter, not a direct property.

### ✅ **Correct:**

```html
<div t-text="$parent.userName"></div>
```

**Or in methods via context:**

```javascript
{
  methods: {
    log() {
      const parent = this.$parent; // Works in expressions
    }
  }
}
```

---

## 🚫 13. Forgetting t-data Scope

### ❌ **Anti-Pattern:**

```html
<div>
    <button t-click="count++">Increment</button>
    <!-- No scope! -->
</div>
```

### ✅ **Correct:**

```html
<div t-data="{ count: 0 }">
    <button t-click="count++">Increment</button>
</div>
```

**Why:** Directives require a `t-data` parent scope.

---

## 🚫 14. Using Reserved Keywords as Property Names

### ❌ **Anti-Pattern:**

```javascript
{
  class: 'active', // Reserved keyword!
  return: true,
  function: () => {}
}
```

### ✅ **Correct:**

```javascript
{
  className: 'active',
  shouldReturn: true,
  callback: () => {}
}
```

---

## 🚫 15. Not Validating Before Submit

### ❌ **Anti-Pattern:**

```html
<tp-form on-submit="saveUser()">
    <input t-model="email" t-validate="required|email" />
    <button type="submit">Save</button>
</tp-form>
```

**Problem:** Form submits even if invalid (if `validate="false"`).

### ✅ **Correct:**

```html
<tp-form on-submit="saveUser()" validate="true">
    <!-- or manual check -->
</tp-form>
```

```javascript
{
  methods: {
    saveUser() {
      const isValid = TinyPine.forms.validate(this.$el);
      if (!isValid) return;
      // ... save logic
    }
  }
}
```

---

## 🚫 16. Circular Reactive Dependencies

### ❌ **Anti-Pattern:**

```javascript
{
  a: 0,
  get b() { return this.c + 1; },
  get c() { return this.b + 1; } // Infinite loop!
}
```

### ✅ **Correct:**

Avoid circular getters or use manual caching:

```javascript
{
  a: 0,
  _cachedB: 0,
  get b() { return this.a + 1; }
}
```

---

## 🚫 17. Overusing Watchers

### ❌ **Anti-Pattern:**

```javascript
{
  count: 0,
  doubled: 0,

  mounted() {
    TinyPine.watch(() => this.count, (val) => {
      this.doubled = val * 2;
    });
  }
}
```

### ✅ **Correct:**

Use computed properties:

```javascript
{
  count: 0,
  get doubled() {
    return this.count * 2;
  }
}
```

**Why:** Computed properties are simpler and auto-tracked.

---

## 🚫 18. Hardcoding API URLs

### ❌ **Anti-Pattern:**

```html
<div t-fetch="'https://api.example.com/users'"></div>
```

### ✅ **Correct:**

```javascript
{
  apiBase: import.meta.env.VITE_API_URL || '/api',
  get usersUrl() {
    return `${this.apiBase}/users`;
  }
}
```

```html
<div t-fetch="usersUrl"></div>
```

---

## 🚫 19. Not Handling Fetch Errors

### ❌ **Anti-Pattern:**

```html
<div t-fetch="'/api/data'">
    <li t-for="item in items"></li>
</div>
```

**Problem:** No error UI if fetch fails.

### ✅ **Correct:**

```html
<div t-fetch="'/api/data'">
    <div t-show="$loading">Loading...</div>
    <div t-show="$error" t-text="'Error: ' + $error"></div>
    <li t-for="item in items" t-show="!$loading && !$error"></li>
</div>
```

---

## 🚫 20. Mixing Framework Styles

### ❌ **Anti-Pattern:**

```html
<!-- Mixing TinyPine with Vue syntax -->
<div t-data="{ count: 0 }" @click="count++"></div>
```

### ✅ **Correct:**

```html
<div t-data="{ count: 0 }" t-click="count++"></div>
```

**Why:** TinyPine uses `t-` prefix, not `@` or `:` (except `:key`).

---

## ✅ Best Practices Summary

1. ✅ Always use `t-click` instead of `onclick`
2. ✅ Define all state properties in `t-data`
3. ✅ Use `:key` for all `t-for` lists
4. ✅ Keep state flat and minimal
5. ✅ Clean up side effects in `beforeUnmount`
6. ✅ Use `t-text` for user content (XSS safety)
7. ✅ Handle async race conditions
8. ✅ Validate forms before submission
9. ✅ Avoid circular dependencies
10. ✅ Use computed properties over watchers

---

**Remember:** TinyPine is simple by design. Follow these patterns to keep it that way! 🌲

---

**Last Updated:** v1.3.0
