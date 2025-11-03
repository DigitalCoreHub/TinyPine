/**
 * Global Store System for TinyPine.js
 * Enables shared reactive state across all components
 */

const globalStores = new Map();
const watchers = new Map();
let watchIdCounter = 0;

function createStore(name, data) {
    // Use Proxy for reactive store
    const store = new Proxy(data, {
        set(target, key, value) {
            // Get old value BEFORE setting new value
            const oldValue = target[key];
            target[key] = value;
            // Trigger update for all components using this store
            updateAllStores(name, key, value, oldValue);
            return true;
        },
        get(target, key) {
            return target[key];
        },
    });

    globalStores.set(name, store);

    if (
        typeof window !== "undefined" &&
        window.TinyPine &&
        window.TinyPine.debug
    ) {
        console.log("[TinyPine] Store created:", name, store);
    }

    return store;
}

function updateAllStores(storeName, key, value, oldValue) {
    // Trigger watchers
    watchers.forEach((watcher, watchId) => {
        const pathParts = watcher.path.split(".");
        if (pathParts[0] === storeName && pathParts[1] === key) {
            try {
                watcher.callback(value, oldValue, watcher.path);
            } catch (e) {
                if (
                    typeof window !== "undefined" &&
                    window.TinyPine &&
                    window.TinyPine.debug
                ) {
                    console.error("[TinyPine] Watcher error:", e);
                }
            }
        }
    });

    // Find all elements with t-data and update them
    const elements = document.querySelectorAll("[t-data]");
    elements.forEach((element) => {
        if (
            element._tinypineContext &&
            typeof updateDirectives === "function"
        ) {
            const state = element._tinypineState;
            if (state) {
                updateDirectives(element, state);
            }
        }
    });

    if (
        typeof window !== "undefined" &&
        window.TinyPine &&
        window.TinyPine.debug
    ) {
        console.log(`[TinyPine] $store.${storeName}.${key} changed →`, value);
    }
}

function getStore(name) {
    return globalStores.get(name);
}

function getAllStores() {
    return Object.fromEntries(globalStores);
}

function watch(path, callback) {
    const watchId = watchIdCounter++;
    watchers.set(watchId, { path, callback });

    if (
        typeof window !== "undefined" &&
        window.TinyPine &&
        window.TinyPine.debug
    ) {
        console.log("[TinyPine] Watcher registered:", path);
    }

    return () => {
        watchers.delete(watchId);
        if (
            typeof window !== "undefined" &&
            window.TinyPine &&
            window.TinyPine.debug
        ) {
            console.log("[TinyPine] Watcher removed:", path);
        }
    };
}

// Export for use in core.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        createStore,
        getStore,
        getAllStores,
        globalStores,
        watch,
    };
}

// Create TinyPine global immediately
if (typeof window !== "undefined") {
    window.TinyPine = window.TinyPine || {};
    window.TinyPine.store = createStore;
    window.TinyPine.getStore = getStore;
    window.TinyPine.getAllStores = getAllStores;
    window.TinyPine.watch = watch;

    // Auto-hydrate from server state
    if (window.__TINYPINE_STATE__) {
        Object.keys(window.__TINYPINE_STATE__).forEach((name) => {
            createStore(name, window.__TINYPINE_STATE__[name]);
        });
        if (window.TinyPine.debug) {
            console.log("[TinyPine] Hydrated from server state");
        }
    }

    console.log("[TinyPine] Store system loaded");
}
