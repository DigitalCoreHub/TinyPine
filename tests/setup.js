/**
 * TinyPine Test Setup
 * Using jsdom environment - no manual mocking needed
 */

import { afterEach } from "vitest";

// Load TinyPine modules (they populate window.TinyPine via side effects)
// Static imports ensure they execute before tests
import "../src/store.js";
import "../src/core.js";
import "../src/devtools.js";
import "../src/ui.js";

// Cleanup after each test to prevent async warnings
afterEach(async () => {
    // Wait for any pending reactive updates (setTimeout(0))
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clear DOM
    document.body.innerHTML = "";
});
