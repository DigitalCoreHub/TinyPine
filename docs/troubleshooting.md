# 🔧 TinyPine Troubleshooting Guide

> Common errors, debugging tips, and console fixes for TinyPine.js v1.3.0

---

## 🐛 Common Errors

### 1. **"[TinyPine] Unknown directive: t-xxx"**

**Problem:** You're using a directive that doesn't exist or is misspelled.

**Solution:**

```html
<!-- ❌ Wrong -->
<div t-visible="isOpen">
    <!-- ✅ Correct -->
    <div t-show="isOpen"></div>
</div>
```

**Valid Directives:**

- `t-data`, `t-text`, `t-html`, `t-show`, `t-bind`, `t-class`
- `t-for`, `t-model`, `t-click`, `t-ref`, `t-validate`
- `t-fetch`, `t-await`, `t-route`, `t-init`, `t-effect`, `t-destroy`

---

### 2. **"[TinyPine] Expression evaluation failed"**

**Problem:** Invalid JavaScript expression in directive.

**Common Causes:**

```html
<!-- ❌ Syntax error -->
<div t-show="count > 5 &&">
    <!-- ❌ Undefined variable -->
    <div t-text="userName">
        <!-- userName not in t-data -->

        <!-- ✅ Correct -->
        <div t-data="{ count: 0, userName: 'John' }">
            <div t-show="count > 5 && userName">
                <div t-text="userName"></div>
            </div>
        </div>
    </div>
</div>
```

**Debug Steps:**

1. Check browser console for exact error
2. Verify variable exists in scope
3. Test expression in console

---

### 3. **"[TinyPine] t-for target must be an array"**

**Problem:** `t-for` directive used on non-array data.

**Solution:**

```html
<!-- ❌ Wrong -->
<div t-data="{ items: {} }">
    <li t-for="item in items">
        <!-- ✅ Correct -->
        <div t-data="{ items: [] }">
            <li t-for="item in items"></li>
        </div>
    </li>
</div>
```

---

### 4. **t-model not updating state**

**Problem:** Input value doesn't sync with state.

**Common Causes:**

1. Property not defined in `t-data`
2. Typo in property name
3. Using `t-model` outside `t-data` scope

**Solution:**

```html
<!-- ❌ Property not defined -->
<div t-data="{ count: 0 }">
    <input t-model="name" />
    <!-- name not in t-data -->
</div>

<!-- ✅ Correct -->
<div t-data="{ count: 0, name: '' }">
    <input t-model="name" />
</div>
```

---

### 5. **t-click handler not firing**

**Problem:** Click event doesn't trigger state update.

**Common Causes:**

```html
<!-- ❌ Missing parentheses -->
<button t-click="increment">

<!-- ❌ Method not defined -->
<button t-click="save()"> <!-- save not in methods -->

<!-- ✅ Correct with state update -->
<button t-click="count++">

<!-- ✅ Correct with method -->
<div t-data="{ count: 0, methods: { increment() { this.count++; } } }">
  <button t-click="increment()">
</div>
```

---

### 6. **"[TinyPine][t-validate] t-model attribute required"**

**Problem:** Using `t-validate` without `t-model`.

**Solution:**

```html
<!-- ❌ Wrong -->
<input t-validate="required|email" />

<!-- ✅ Correct -->
<input t-model="email" t-validate="required|email" />
```

---

### 7. **Router not updating t-route elements**

**Problem:** Route changes but elements don't show/hide.

**Common Causes:**

1. Hash navigation not used (`#/route`)
2. Router not initialized
3. Route name mismatch

**Solution:**

```html
<!-- ❌ Wrong -->
<a href="/about">About</a>
<div t-route="about-page">
    <!-- ✅ Correct -->
    <a href="#/about">About</a>
    <div t-route="about">
        <script>
            TinyPine.router({ default: "home" });
        </script>
    </div>
</div>
```

---

## 🔍 Debugging Tips

### Enable Debug Mode

```javascript
TinyPine.debug = true;
// or
TinyPine.enableDebug();
```

**What you'll see:**

- State changes
- Directive processing
- Expression evaluation results
- Router navigation
- Validation results

### Inspect State

```javascript
// Get element's state
const el = document.querySelector("[t-data]");
const state = el._tinypineState;
console.log(state);

// Check context
const context = el._tinypineContext;
console.log(context.methods);
console.log(context.$refs);
```

### Check Global Stores

```javascript
const stores = TinyPine.getAllStores();
console.log(stores);

const auth = TinyPine.getStore("auth");
console.log(auth);
```

### Validate Forms Manually

```javascript
const form = document.querySelector("tp-form");
const scope = form.closest("[t-data]");

// Validate all fields
const isValid = TinyPine.forms.validate(scope);
console.log("Valid:", isValid);

// Get form data
const data = TinyPine.forms.getData(scope);
console.log("Data:", data);

// Check errors
const errors = scope._tinypineState.$errors;
console.log("Errors:", errors);
```

### Test Router

```javascript
// Get current route
const currentRoute = TinyPine.router.getCurrent();
console.log("Current:", currentRoute);

// Get route params
const params = TinyPine._routerState.currentParams;
console.log("Params:", params);

// Navigate programmatically
TinyPine.router.push("user", { id: "123" });
```

---

## 🚨 Console Warnings

### "[TinyPine] Could not get stores"

**Cause:** Store module not loaded or stores not initialized.

**Solution:**

```javascript
// Initialize stores before using them
TinyPine.store("auth", { user: null, token: null });

// Then start app
TinyPine.start("#app");
```

---

### "[TinyPine][t-fetch] Expression must evaluate to a string URL"

**Cause:** Invalid t-fetch expression.

**Solution:**

```html
<!-- ❌ Wrong -->
<div t-fetch="apiData">
    <!-- ✅ Correct -->
    <div t-fetch="'/api/data'">
        <!-- or -->
        <div t-data="{ url: '/api/data' }">
            <div t-fetch="url"></div>
        </div>
    </div>
</div>
```

---

### "[TinyPine][Router] Navigation blocked by guard"

**Cause:** Route guard returned `false`.

**Solution:**

```javascript
TinyPine.router({
    routes: {
        admin: {
            beforeEnter: (route, params) => {
                const auth = TinyPine.getStore("auth");
                if (!auth.isAdmin) {
                    console.warn("Admin access required");
                    return false; // Block navigation
                }
                return true; // Allow
            },
        },
    },
});
```

---

## 🛠️ Performance Issues

### 1. **Slow t-for rendering with large lists**

**Solution:** Use `:key` binding

```html
<!-- ❌ Slow (re-renders everything) -->
<li t-for="item in items">
    <!-- ✅ Fast (keyed diffing) -->
</li>

<li t-for="item in items" :key="item.id"></li>
```

### 2. **Too many state updates**

**Solution:** Batch updates

```javascript
// ❌ Multiple updates
count++;
count++;
count++;

// ✅ Single update
count += 3;
```

### 3. **Memory leaks from event listeners**

**Solution:** Use lifecycle hooks

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

## 🔧 Browser DevTools

### React DevTools Alternative

Use TinyPine DevTools:

```javascript
TinyPine.devtools();
```

**Features:**

- Live state inspector
- Store viewer
- Event timeline
- Performance metrics

---

## 📞 Getting Help

1. **Check console first** - Most errors show detailed messages
2. **Enable debug mode** - `TinyPine.debug = true`
3. **Inspect element state** - Use `el._tinypineState`
4. **Test expressions in console** - Verify syntax
5. **Check GitHub issues** - Common problems may be documented

---

## ✅ Quick Fixes Checklist

- [ ] Is `TinyPine.start()` called?
- [ ] Are all properties defined in `t-data`?
- [ ] Is the directive name spelled correctly?
- [ ] Are expressions valid JavaScript?
- [ ] Is the element inside a `t-data` scope?
- [ ] Are required attributes present? (e.g., `t-model` for `t-validate`)
- [ ] Is the browser console showing any errors?
- [ ] Is debug mode enabled for detailed logs?

---

**Last Updated:** v1.3.0
**Need more help?** Open an issue on GitHub
