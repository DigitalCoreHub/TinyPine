/**
 * TinyPine.js v1.5.0
 * Main entry point - combines all modules
 */

// Import all TinyPine modules
import "./store.js";
import "./core.js";
import "./devtools.js";
import "./router.js"; // v1.5.0: Router module

// Export TinyPine for ESM
export default window.TinyPine;

// Backwards compatibility: expose start if only init was used
if (
    typeof window !== "undefined" &&
    window.TinyPine &&
    !window.TinyPine.start
) {
    window.TinyPine.start = function (selectorOrRoot, opts = {}) {
        if (opts && opts.safe) window.TinyPine._safeMode = true;
        const root =
            typeof selectorOrRoot === "string"
                ? document.querySelector(selectorOrRoot) || document.body
                : selectorOrRoot || document.body;
        window.TinyPine.init(root);
    };
}
