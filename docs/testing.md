# 🧪 TinyPine Testing Guide

> Testing strategies, examples, and best practices for TinyPine.js v1.3.0

---

## 🎯 Testing Philosophy

TinyPine apps are **easy to test** because:

- ✅ **No build required** - Test in browser directly
- ✅ **Reactive state** - Predictable updates
- ✅ **Direct DOM access** - No virtual DOM abstraction
- ✅ **Event-driven** - Easy to trigger and verify

---

## 🛠️ Testing Tools

### Option 1: Vitest (Recommended)

**Why Vitest:**

- Fast, modern test runner
- ES modules support
- Built-in DOM (happy-dom)

**Setup:**

```bash
npm install -D vitest happy-dom
```

**vitest.config.js:**

```javascript
export default {
    test: {
        environment: "happy-dom",
        globals: true,
    },
};
```

---

### Option 2: Jest + JSDOM

```bash
npm install -D jest @testing-library/dom jsdom
```

**jest.config.js:**

```javascript
export default {
    testEnvironment: "jsdom",
    transform: {},
};
```

---

### Option 3: Playwright (E2E)

```bash
npm install -D @playwright/test
```

---

## ✅ Unit Testing

### 1. **Testing Reactive State**

```javascript
import { describe, it, expect, beforeEach } from "vitest";
import { reactive } from "../src/core.js";

describe("Reactive State", () => {
    it("should trigger callback on change", () => {
        let called = false;
        const data = reactive({ count: 0 }, () => {
            called = true;
        });

        data.count = 5;

        expect(called).toBe(true);
        expect(data.count).toBe(5);
    });

    it("should handle array mutations", () => {
        let updateCount = 0;
        const data = reactive({ items: [] }, () => updateCount++);

        data.items.push("item1");
        data.items.push("item2");

        expect(data.items).toHaveLength(2);
        expect(updateCount).toBeGreaterThan(0);
    });
});
```

---

### 2. **Testing Directives**

```javascript
import { describe, it, expect, beforeEach } from "vitest";
import { initializeScope } from "../src/core.js";

describe("t-text Directive", () => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    it("should update text content", () => {
        container.innerHTML = `
      <div t-data="{ name: 'John' }">
        <span t-text="name"></span>
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        const span = container.querySelector("span");
        expect(span.textContent).toBe("John");
    });

    it("should update on state change", async () => {
        container.innerHTML = `
      <div t-data="{ count: 0 }">
        <span t-text="count"></span>
        <button t-click="count++">Increment</button>
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        const button = container.querySelector("button");
        button.click();

        // Wait for debounced update
        await new Promise((resolve) => setTimeout(resolve, 10));

        const span = container.querySelector("span");
        expect(span.textContent).toBe("1");
    });
});
```

---

### 3. **Testing t-model (Two-way Binding)**

```javascript
describe("t-model Directive", () => {
    it("should sync input with state", async () => {
        const container = document.createElement("div");
        container.innerHTML = `
      <div t-data="{ email: '' }">
        <input t-model="email">
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        const input = container.querySelector("input");
        input.value = "test@example.com";
        input.dispatchEvent(new Event("input"));

        await new Promise((resolve) => setTimeout(resolve, 10));

        const state = scope._tinypineState;
        expect(state.email).toBe("test@example.com");
    });
});
```

---

### 4. **Testing Form Validation (v1.3.0)**

```javascript
describe("t-validate Directive", () => {
    it("should validate required field", async () => {
        const container = document.createElement("div");
        container.innerHTML = `
      <div t-data="{ email: '' }">
        <input t-model="email" t-validate="required">
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        const input = container.querySelector("input");
        input.dispatchEvent(new Event("blur"));

        await new Promise((resolve) => setTimeout(resolve, 10));

        const state = scope._tinypineState;
        expect(state.$errors.email).toBeDefined();
        expect(input.classList.contains("tp-invalid")).toBe(true);
    });

    it("should validate email format", async () => {
        const container = document.createElement("div");
        container.innerHTML = `
      <div t-data="{ email: '' }">
        <input t-model="email" t-validate="email">
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        const input = container.querySelector("input");
        input.value = "invalid-email";
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("blur"));

        await new Promise((resolve) => setTimeout(resolve, 10));

        const state = scope._tinypineState;
        expect(state.$errors.email).toContain("Invalid email format");
    });
});
```

---

### 5. **Testing t-fetch (v1.3.0)**

```javascript
import { describe, it, expect, vi } from "vitest";

describe("t-fetch Directive", () => {
    it("should fetch and update state", async () => {
        // Mock fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ id: 1, name: "Item 1" }]),
            })
        );

        const container = document.createElement("div");
        container.innerHTML = `
      <div t-data="{ items: [] }">
        <div t-fetch="'/api/items'"></div>
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        // Wait for fetch
        await new Promise((resolve) => setTimeout(resolve, 100));

        const state = scope._tinypineState;
        expect(state.items).toHaveLength(1);
        expect(state.items[0].name).toBe("Item 1");
    });

    it("should handle fetch errors", async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

        const container = document.createElement("div");
        container.innerHTML = `
      <div t-data="{ items: [] }">
        <div t-fetch="'/api/items'"></div>
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const state = scope._tinypineState;
        expect(state.$error).toBeDefined();
    });
});
```

---

## 🎭 Component Testing

### Testing Custom Components

```javascript
describe('tp-button Component', () => {
  beforeEach(() => {
    // Load UI module
    await import('../src/ui.js');
  });

  it('should apply color classes', () => {
    const button = document.createElement('tp-button');
    button.setAttribute('color', 'primary');
    document.body.appendChild(button);

    // Wait for component mount
    setTimeout(() => {
      expect(button.classList.contains('bg-blue-600')).toBe(true);
    }, 0);
  });
});
```

---

## 🌐 Integration Testing

### Testing Router (v1.3.0)

```javascript
describe("Router", () => {
    beforeEach(() => {
        window.TinyPine.router({ default: "home" });
    });

    it("should navigate to route", () => {
        TinyPine.router.push("about");
        expect(window.location.hash).toBe("#/about");
    });

    it("should extract route params", () => {
        const container = document.createElement("div");
        container.innerHTML = `
      <div t-route="user/:id">
        <span t-text="$route.params.id"></span>
      </div>
    `;

        window.location.hash = "#/user/123";

        // Trigger hashchange
        window.dispatchEvent(new Event("hashchange"));

        setTimeout(() => {
            const span = container.querySelector("span");
            expect(span.textContent).toBe("123");
        }, 10);
    });
});
```

---

### Testing Stores

```javascript
describe("Global Store", () => {
    it("should create reactive store", () => {
        TinyPine.store("cart", {
            items: [],
            total: 0,
        });

        const cart = TinyPine.getStore("cart");
        cart.items.push({ id: 1, price: 10 });
        cart.total = 10;

        expect(cart.items).toHaveLength(1);
        expect(cart.total).toBe(10);
    });

    it("should sync store across scopes", () => {
        TinyPine.store("auth", { user: null });

        const container = document.createElement("div");
        container.innerHTML = `
      <div t-data="{}">
        <span t-text="$store.auth.user"></span>
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        const auth = TinyPine.getStore("auth");
        auth.user = "John";

        setTimeout(() => {
            const span = container.querySelector("span");
            expect(span.textContent).toBe("John");
        }, 10);
    });
});
```

---

## 🚀 End-to-End Testing (Playwright)

### Setup Playwright

**playwright.config.js:**

```javascript
export default {
    testDir: "./tests/e2e",
    use: {
        baseURL: "http://localhost:8000",
    },
    webServer: {
        command: "npm run serve",
        port: 8000,
    },
};
```

---

### E2E Test Example

```javascript
import { test, expect } from "@playwright/test";

test.describe("Counter App", () => {
    test("should increment counter", async ({ page }) => {
        await page.goto("/demo/index.html");

        const counter = page.locator('[t-text="count"]');
        await expect(counter).toHaveText("0");

        await page.click('button:has-text("Increment")');
        await expect(counter).toHaveText("1");

        await page.click('button:has-text("Increment")');
        await expect(counter).toHaveText("2");
    });

    test("should reset counter", async ({ page }) => {
        await page.goto("/demo/index.html");

        await page.click('button:has-text("Increment")');
        await page.click('button:has-text("Increment")');

        const counter = page.locator('[t-text="count"]');
        await expect(counter).toHaveText("2");

        await page.click('button:has-text("Reset")');
        await expect(counter).toHaveText("0");
    });
});
```

---

### Testing Forms

```javascript
test("should validate form", async ({ page }) => {
    await page.goto("/demo/form.html");

    const emailInput = page.locator('input[t-model="email"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Empty email - should show error
    await submitBtn.click();
    await expect(emailInput).toHaveClass(/tp-invalid/);

    // Invalid email
    await emailInput.fill("invalid-email");
    await emailInput.blur();
    await expect(emailInput).toHaveClass(/tp-invalid/);

    // Valid email
    await emailInput.fill("test@example.com");
    await emailInput.blur();
    await expect(emailInput).toHaveClass(/tp-valid/);
});
```

---

## 🧪 Test Coverage

### Run Coverage with Vitest

```bash
vitest run --coverage
```

**Target Coverage:**

- Core reactivity: 90%+
- Directives: 85%+
- Helpers: 80%+

---

## ✅ Testing Best Practices

### 1. **Async Updates**

Always wait for debounced updates:

```javascript
await new Promise((resolve) => setTimeout(resolve, 10));
```

### 2. **Cleanup**

Clean up DOM after each test:

```javascript
afterEach(() => {
    document.body.innerHTML = "";
});
```

### 3. **Mock External APIs**

```javascript
vi.mock("fetch");
```

### 4. **Test User Interactions**

Use actual DOM events:

```javascript
button.click();
input.dispatchEvent(new Event("input"));
```

### 5. **Verify State and DOM**

Test both:

```javascript
expect(state.count).toBe(1); // State
expect(span.textContent).toBe("1"); // DOM
```

---

## 📊 Example Test Suite

**tests/basic.test.js:**

```javascript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { reactive, initializeScope } from "../src/core.js";

describe("TinyPine Core", () => {
    let container;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should create reactive state", () => {
        let updated = false;
        const state = reactive({ count: 0 }, () => {
            updated = true;
        });
        state.count = 10;
        expect(updated).toBe(true);
    });

    it("should render t-text", () => {
        container.innerHTML = `<div t-data="{ msg: 'Hello' }"><p t-text="msg"></p></div>`;
        const scope = container.querySelector("[t-data]");
        initializeScope(scope);
        expect(container.querySelector("p").textContent).toBe("Hello");
    });

    it("should handle t-click", async () => {
        container.innerHTML = `
      <div t-data="{ count: 0 }">
        <button t-click="count++">Click</button>
        <span t-text="count"></span>
      </div>
    `;
        const scope = container.querySelector("[t-data]");
        initializeScope(scope);

        container.querySelector("button").click();
        await new Promise((r) => setTimeout(r, 10));

        expect(container.querySelector("span").textContent).toBe("1");
    });
});
```

---

## 🎯 Test Matrix

| Feature        | Unit | Integration | E2E |
| -------------- | ---- | ----------- | --- |
| Reactive state | ✅   | ✅          | ❌  |
| Directives     | ✅   | ✅          | ✅  |
| Forms          | ✅   | ✅          | ✅  |
| Router         | ✅   | ✅          | ✅  |
| Stores         | ✅   | ✅          | ❌  |
| Components     | ✅   | ✅          | ✅  |

---

**Last Updated:** v1.3.0
**Run tests:** `npm test`
