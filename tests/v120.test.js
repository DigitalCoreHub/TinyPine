import { describe, it, expect, beforeAll } from "vitest";

describe("v1.2.0 UI Components", () => {
    beforeAll(async () => {
        // Load UI components
        if (typeof window !== "undefined") {
            try {
                await import("../src/ui.js");
            } catch (_) {}
        }
    });
    it("exposes TinyPine.component() API", () => {
        expect(typeof window.TinyPine.component).toBe("function");
    });

    it("registers component successfully", () => {
        window.TinyPine.component("test-component", {
            mounted() {},
        });
        expect(window.TinyPine._components.has("test-component")).toBe(true);
    });

    it("exposes TinyPine.theme property", () => {
        expect(typeof window.TinyPine.theme).toBe("string");
        expect(["light", "dark"]).toContain(window.TinyPine.theme);
    });

    it("tp-button component registered", () => {
        expect(window.TinyPine._components.has("tp-button")).toBe(true);
    });

    it("tp-modal component registered", () => {
        expect(window.TinyPine._components.has("tp-modal")).toBe(true);
    });

    it("tp-card component registered", () => {
        expect(window.TinyPine._components.has("tp-card")).toBe(true);
    });
});
