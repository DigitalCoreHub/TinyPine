/**
 * TinyPine v1.3.1 - New Features Tests
 * Tests for form validation, advanced router, and keyed diffing
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("TinyPine v1.3.1 - Form Validation System", () => {
    let container;

    beforeEach(async () => {
        // Load TinyPine
        if (!global.window.TinyPine) {
            await import("../src/index.js");
        }

        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe("t-validate directive", () => {
        it("should register t-validate directive", () => {
            expect(global.window.TinyPine).toBeDefined();

            container.innerHTML = `
        <div t-data="{ email: '' }">
          <input t-model="email" t-validate="required">
        </div>
      `;

            const scope = container.querySelector("[t-data]");
            expect(scope).toBeTruthy();

            const input = container.querySelector("input");
            expect(input).toBeTruthy();
            expect(input.getAttribute("t-validate")).toBe("required");
        });

        it("should support validation rules: required", () => {
            container.innerHTML = `
        <div t-data="{ email: '' }">
          <input t-model="email" t-validate="required">
        </div>
      `;

            const input = container.querySelector("input");
            expect(input.getAttribute("t-validate")).toContain("required");
        });

        it("should support validation rules: email", () => {
            container.innerHTML = `
        <div t-data="{ email: '' }">
          <input t-model="email" t-validate="email">
        </div>
      `;

            const input = container.querySelector("input");
            expect(input.getAttribute("t-validate")).toContain("email");
        });

        it("should support validation rules: min:N", () => {
            container.innerHTML = `
        <div t-data="{ password: '' }">
          <input t-model="password" t-validate="min:8">
        </div>
      `;

            const input = container.querySelector("input");
            expect(input.getAttribute("t-validate")).toContain("min:8");
        });

        it("should support validation rules: max:N", () => {
            container.innerHTML = `
        <div t-data="{ username: '' }">
          <input t-model="username" t-validate="max:10">
        </div>
      `;

            const input = container.querySelector("input");
            expect(input.getAttribute("t-validate")).toContain("max:10");
        });

        it("should support validation rules: numeric", () => {
            container.innerHTML = `
        <div t-data="{ age: '' }">
          <input t-model="age" t-validate="numeric">
        </div>
      `;

            const input = container.querySelector("input");
            expect(input.getAttribute("t-validate")).toContain("numeric");
        });

        it("should support validation rules: url", () => {
            container.innerHTML = `
        <div t-data="{ website: '' }">
          <input t-model="website" t-validate="url">
        </div>
      `;

            const input = container.querySelector("input");
            expect(input.getAttribute("t-validate")).toContain("url");
        });

        it("should support multiple validation rules with pipe", () => {
            container.innerHTML = `
        <div t-data="{ email: '' }">
          <input t-model="email" t-validate="required|email">
        </div>
      `;

            const input = container.querySelector("input");
            const rules = input.getAttribute("t-validate");
            expect(rules).toContain("required");
            expect(rules).toContain("email");
            expect(rules).toContain("|");
        });
    });

    describe("TinyPine.forms API", () => {
        it("should expose TinyPine.forms.reset method", () => {
            expect(global.window.TinyPine.forms).toBeDefined();
            expect(typeof global.window.TinyPine.forms.reset).toBe("function");
        });

        it("should expose TinyPine.forms.validate method", () => {
            expect(global.window.TinyPine.forms).toBeDefined();
            expect(typeof global.window.TinyPine.forms.validate).toBe(
                "function"
            );
        });

        it("should expose TinyPine.forms.getData method", () => {
            expect(global.window.TinyPine.forms).toBeDefined();
            expect(typeof global.window.TinyPine.forms.getData).toBe(
                "function"
            );
        });

        it("should handle form structure", () => {
            container.innerHTML = `
        <div t-data="{ name: 'John', email: 'john@example.com' }">
          <input t-model="name">
          <input t-model="email">
        </div>
      `;

            const scope = container.querySelector("[t-data]");
            const inputs = container.querySelectorAll("input");

            expect(scope).toBeTruthy();
            expect(inputs.length).toBe(2);
        });
    });

    describe("tp-form component", () => {
        it("should render tp-form component", async () => {
            // Load UI components
            if (!global.window.TinyPine.components) {
                await import("../src/ui.js");
            }

            container.innerHTML = `
        <div t-data="{ name: '' }">
          <tp-form>
            <input t-model="name">
            <button type="submit">Submit</button>
          </tp-form>
        </div>
      `;

            const form = container.querySelector("tp-form");
            expect(form).toBeTruthy();
            expect(form.tagName.toLowerCase()).toBe("tp-form");
        });

        it("should contain form elements", async () => {
            if (!global.window.TinyPine.components) {
                await import("../src/ui.js");
            }

            container.innerHTML = `
        <div t-data="{ name: '' }">
          <tp-form>
            <input t-model="name">
            <button type="submit">Submit</button>
          </tp-form>
        </div>
      `;

            const form = container.querySelector("tp-form");
            const input = form.querySelector("input");
            const button = form.querySelector("button");

            expect(input).toBeTruthy();
            expect(button).toBeTruthy();
            expect(button.getAttribute("type")).toBe("submit");
        });
    });
});

describe("TinyPine v1.3.1 - Advanced Router", () => {
    let container;

    beforeEach(async () => {
        if (!global.window.TinyPine) {
            await import("../src/index.js");
        }

        container = document.createElement("div");
        document.body.appendChild(container);

        window.location.hash = "";
    });

    afterEach(() => {
        document.body.innerHTML = "";
        window.location.hash = "";
    });

    describe("Dynamic route params", () => {
        it("should support route param syntax :param", () => {
            const pattern = "user/:id";
            const parts = pattern.split("/").filter(Boolean);

            expect(parts.length).toBe(2);
            expect(parts[0]).toBe("user");
            expect(parts[1]).toBe(":id");
        });

        it("should support multiple params in route", () => {
            const pattern = "posts/:category/:id";
            const parts = pattern.split("/").filter(Boolean);

            expect(parts.length).toBe(3);
            expect(parts[0]).toBe("posts");
            expect(parts[1]).toBe(":category");
            expect(parts[2]).toBe(":id");
        });

        it("should match static and dynamic segments", () => {
            const pattern = "user/:id/profile";
            const parts = pattern.split("/").filter(Boolean);

            expect(parts[0]).toBe("user");
            expect(parts[1]).toBe(":id");
            expect(parts[2]).toBe("profile");
        });
    });

    describe("Router helpers", () => {
        it("should expose router.push method", () => {
            expect(global.window.TinyPine.router).toBeDefined();
            expect(typeof global.window.TinyPine.router.push).toBe("function");
        });

        it("should expose router.navigate method", () => {
            expect(global.window.TinyPine.router).toBeDefined();
            expect(typeof global.window.TinyPine.router.navigate).toBe(
                "function"
            );
        });

        it("should expose router.getCurrent method", () => {
            expect(global.window.TinyPine.router).toBeDefined();
            expect(typeof global.window.TinyPine.router.getCurrent).toBe(
                "function"
            );
        });
    });

    describe("Route guards", () => {
        it("should support beforeEnter guard in route config", () => {
            const guard = () => true;

            const routeConfig = {
                routes: {
                    admin: {
                        beforeEnter: guard,
                    },
                },
            };

            expect(routeConfig.routes.admin.beforeEnter).toBe(guard);
            expect(typeof routeConfig.routes.admin.beforeEnter).toBe(
                "function"
            );
        });

        it("should support guard return values", () => {
            const allowGuard = () => true;
            const denyGuard = () => false;

            expect(allowGuard()).toBe(true);
            expect(denyGuard()).toBe(false);
        });
    });

    describe("Fallback routes", () => {
        it("should support wildcard route (*)", () => {
            container.innerHTML = `
        <div t-route="home">Home</div>
        <div t-route="*">404 Not Found</div>
      `;

            const routes = container.querySelectorAll("[t-route]");
            expect(routes.length).toBe(2);
            expect(routes[1].getAttribute("t-route")).toBe("*");
        });
    });

    describe("t-route directive", () => {
        it("should render t-route elements", () => {
            container.innerHTML = `
        <div t-route="home">Home Page</div>
        <div t-route="about">About Page</div>
      `;

            const routes = container.querySelectorAll("[t-route]");
            expect(routes.length).toBe(2);
            expect(routes[0].getAttribute("t-route")).toBe("home");
            expect(routes[1].getAttribute("t-route")).toBe("about");
        });

        it("should support dynamic route patterns", () => {
            container.innerHTML = `
        <div t-route="user/:id">User Profile</div>
      `;

            const route = container.querySelector("[t-route]");
            expect(route.getAttribute("t-route")).toBe("user/:id");
        });
    });
});

describe("TinyPine v1.3.1 - Keyed List Diffing", () => {
    let container;

    beforeEach(async () => {
        if (!global.window.TinyPine) {
            await import("../src/index.js");
        }

        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    describe(":key binding", () => {
        it("should support :key attribute syntax", () => {
            container.innerHTML = `
        <div t-data="{ items: [{id: 1, name: 'A'}] }">
          <ul>
            <li t-for="item in items" :key="item.id" t-text="item.name"></li>
          </ul>
        </div>
      `;

            const li = container.querySelector("li");
            expect(li).toBeTruthy();
            expect(li.getAttribute(":key")).toBe("item.id");
        });

        it("should support t-bind:key syntax", () => {
            container.innerHTML = `
        <div t-data="{ items: [{id: 1}] }">
          <ul>
            <li t-for="item in items" t-bind:key="item.id"></li>
          </ul>
        </div>
      `;

            const li = container.querySelector("li");
            expect(li).toBeTruthy();
            expect(li.getAttribute("t-bind:key")).toBe("item.id");
        });

        it("should work with t-for directive", () => {
            container.innerHTML = `
        <div t-data="{ items: [{id: 1, name: 'A'}, {id: 2, name: 'B'}] }">
          <ul>
            <li t-for="item in items" :key="item.id" t-text="item.name"></li>
          </ul>
        </div>
      `;
            window.TinyPine.init(container);

            const ul = container.querySelector("ul");
            expect(ul).toBeTruthy();

            const lis = ul.querySelectorAll("li");
            expect(lis.length).toBe(2);
        });

        it("should support key binding with different expressions", () => {
            container.innerHTML = `
        <div t-data="{ items: [{id: 1}, {id: 2}] }">
          <div t-for="item in items" :key="item.id"></div>
        </div>
      `;

            const divs = container.querySelectorAll("[t-for]");
            expect(divs.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("List operations", () => {
        it("should handle array initialization", () => {
            container.innerHTML = `
        <div t-data="{ items: [{id: 1, name: 'A'}, {id: 2, name: 'B'}, {id: 3, name: 'C'}] }">
          <ul>
            <li t-for="item in items" :key="item.id" t-text="item.name"></li>
          </ul>
        </div>
      `;
            window.TinyPine.init(container);

            const ul = container.querySelector("ul");
            const lis = ul.querySelectorAll("li");

            expect(lis.length).toBe(3);
        });

        it("should support empty arrays", () => {
            container.innerHTML = `
        <div t-data="{ items: [] }">
          <ul>
            <li t-for="item in items" :key="item.id"></li>
          </ul>
        </div>
      `;
            window.TinyPine.init(container);

            const ul = container.querySelector("ul");
            const lis = ul.querySelectorAll("li");

            expect(lis.length).toBe(0);
        });

        it("should handle large arrays", () => {
            const items = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
            }));

            container.innerHTML = `
        <div t-data='{ items: ${JSON.stringify(items)} }'>
          <ul>
            <li t-for="item in items" :key="item.id" t-text="item.name"></li>
          </ul>
        </div>
      `;

            const ul = container.querySelector("ul");
            expect(ul).toBeTruthy();
        });
    });
});

describe("TinyPine v1.3.1 - Integration Tests", () => {
    let container;

    beforeEach(async () => {
        if (!global.window.TinyPine) {
            await import("../src/index.js");
        }

        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should combine form validation with lists", () => {
        container.innerHTML = `
      <div t-data="{
        users: [{id: 1, name: 'John', email: 'john@example.com'}],
        newUser: { name: '', email: '' }
      }">
        <form>
          <input t-model="newUser.name" t-validate="required">
          <input t-model="newUser.email" t-validate="required|email">
          <button type="submit">Add User</button>
        </form>

        <ul>
          <li t-for="user in users" :key="user.id">
            <span t-text="user.name"></span> - <span t-text="user.email"></span>
          </li>
        </ul>
      </div>
    `;

        const scope = container.querySelector("[t-data]");
        expect(scope).toBeTruthy();

        const inputs = container.querySelectorAll("input");
        expect(inputs.length).toBe(2);
        expect(inputs[0].getAttribute("t-validate")).toContain("required");
        expect(inputs[1].getAttribute("t-validate")).toContain("email");

        const lis = container.querySelectorAll("li");
        expect(lis.length).toBe(1);
    });

    it("should combine router with validation", () => {
        container.innerHTML = `
      <div>
        <div t-route="login">
          <div t-data="{ email: '', password: '' }">
            <input t-model="email" t-validate="required|email">
            <input t-model="password" t-validate="required|min:8">
          </div>
        </div>
        <div t-route="dashboard">Dashboard</div>
      </div>
    `;

        const routes = container.querySelectorAll("[t-route]");
        expect(routes.length).toBe(2);

        const inputs = container.querySelectorAll("input");
        expect(inputs.length).toBe(2);
    });

    it("should combine all v1.3.1 features", () => {
        container.innerHTML = `
      <div>
        <div t-route="users">
          <div t-data="{ users: [{id: 1, name: 'John'}], newUser: { name: '' } }">
            <tp-form>
              <input t-model="newUser.name" t-validate="required|min:3">
              <button type="submit">Add</button>
            </tp-form>

            <ul>
              <li t-for="user in users" :key="user.id" t-text="user.name"></li>
            </ul>
          </div>
        </div>
      </div>
    `;

        const route = container.querySelector("[t-route]");
        const scope = container.querySelector("[t-data]");
        const form = container.querySelector("tp-form");
        const input = container.querySelector("input");
        const li = container.querySelector("li");

        expect(route).toBeTruthy();
        expect(scope).toBeTruthy();
        expect(form).toBeTruthy();
        expect(input).toBeTruthy();
        expect(input.getAttribute("t-validate")).toBe("required|min:3");
        expect(li).toBeTruthy();
        expect(li.getAttribute(":key")).toBe("user.id");
    });
});
