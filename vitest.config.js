import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup.js"],
        watch: false,
        pool: "threads",
        maxThreads: 4,
        minThreads: 1,
        testTimeout: 2000,
        hookTimeout: 5000,
        reporters: ["default"],
        // Ignore async cleanup warnings - reactive updates use setTimeout(0)
        dangerouslyIgnoreUnhandledErrors: false,
        teardownTimeout: 100, // Give async operations time to complete
    },
});
