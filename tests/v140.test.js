/**
 * TinyPine v1.4.0 Tests - Async Flow & Forms
 * Critical tests for v1.4.0 features
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("TinyPine v1.4.0 - Enhanced t-fetch", () => {
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

    it("should support debounce attribute", () => {
        container.innerHTML = `
            <div t-data="{ url: 'https://api.example.com/items' }">
                <button t-fetch="url" debounce="100">Fetch</button>
            </div>
        `;
        global.window.TinyPine.start(container);
        const button = container.querySelector("button");
        expect(button._tinypineFetchMeta).toBeDefined();
    });

    it("should support method attribute", () => {
        container.innerHTML = `
            <div t-data="{ url: 'https://api.example.com/post' }">
                <button t-fetch="url" method="POST">Submit</button>
            </div>
        `;
        global.window.TinyPine.start(container);
        const button = container.querySelector("button");
        expect(button._tinypineFetchMeta).toBeDefined();
    });
});

describe("TinyPine v1.4.0 - Form Validation", () => {
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

    it("should register tp-form component", () => {
        expect(global.customElements.get("tp-form")).toBeDefined();
    });

    it("should have validateAll method", () => {
        container.innerHTML = `<tp-form></tp-form>`;
        global.window.TinyPine.start(container);
        const form = container.querySelector("tp-form");
        expect(typeof form.validateAll).toBe("function");
    });

    it("should validate required fields", () => {
        container.innerHTML = `
            <tp-form>
                <div t-data="{ email: '' }">
                    <input t-model="email" t-validate="required" name="email" value="" />
                </div>
            </tp-form>
        `;
        global.window.TinyPine.start(container);
        const input = container.querySelector("input");
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("blur", { bubbles: true }));
        expect(input.classList.contains("tp-invalid")).toBe(true);
    });
});

describe("TinyPine v1.4.0 - t-debounce", () => {
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

    it("should setup debounce on input", () => {
        container.innerHTML = `
            <div t-data="{ search: '' }">
                <input t-model="search" t-debounce="300" />
            </div>
        `;
        global.window.TinyPine.start(container);
        const input = container.querySelector("input");
        expect(input._tinypineDebounceSetup).toBe(true);
    });
});

describe("TinyPine v1.4.0 - Integration", () => {
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

    it("should combine all v1.4.0 features", () => {
        container.innerHTML = `
            <tp-form>
                <div t-data="{ search: '' }">
                    <input t-model="search" t-debounce="200" t-validate="minLength:3" name="search" value="" />
                    <button t-fetch="'https://api.example.com/search'" method="GET" debounce="100">Search</button>
                </div>
            </tp-form>
        `;
        global.window.TinyPine.start(container);
        const input = container.querySelector("input");
        const button = container.querySelector("button");
        const form = container.querySelector("tp-form");
        expect(input._tinypineDebounceSetup).toBe(true);
        expect(input._tinypineValidateSetup).toBe(true);
        expect(button._tinypineFetchMeta).toBeDefined();
        expect(form.validateAll).toBeDefined();
    });
});
